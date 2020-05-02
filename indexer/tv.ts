import * as fs from 'fs';
import getVideoDuration from 'get-video-duration';

import Files from '@root/files';
import ShowService from '@root/data/show';
import SeasonService from '@root/data/season';
import EpisodeService from '@root/data/episode';
import { Episode, File, Show, Season, Status, MessageType, Message } from '@root/models';
import { Watcher, WatcherEvent } from '@root/watcher';
import Queue from '@root/queue';

class TvFile {
    show: string;
    season: number;
    episode: number;

    static fromFile(file: File) {
        const identifier = file.path.substr(file.path.lastIndexOf('/')+1, 6);
        const model = new TvFile();
        model.show = file.path.split('/').slice(-3, -2)[0];
        model.season = parseInt(identifier.substr(1, 3));
        model.episode = parseInt(identifier.substr(4, 6));
        return model;
    }
}

export class TvIndexer {
    paths: string[];
    fileManager: Files;
    subtitleQueue: Queue;
    metadataQueue: Queue;
    conversionQueue: Queue;
    
    constructor(subtitleQueue: Queue, metadataQueue: Queue, conversionQueue: Queue, paths: string[]) {
        this.subtitleQueue = subtitleQueue;
        this.metadataQueue = metadataQueue;
        this.conversionQueue = conversionQueue;
        this.paths = paths;
        this.fileManager = new Files((file: File) => file.isVideoFile());
    }

    async run(...files: File[]) : Promise<void> {
        const date = new Date();
        console.log('[tv-indexer] Indexing TV shows.');

        await this.removeEpisodesWithNoFile();
        await this.removeSeasonsWithNoEpisodes();
        await this.removeShowsWithNoSeasons();

        files = files.length > 0 ? files : [].concat.apply([], await Promise.all(this.paths.map(async library => await this.fileManager.find(library))));
        console.log(`[tv-indexer] Found ${files.length} video files.`);
        
        const { shows, seasons, episodes } = await this.getAllMedia();
        for (var i = 0; i < files.length; i++)
            await this.processFile(files[i], shows, seasons, episodes);

        console.log(`[tv-indexer] Done. Processed ${files.length} TV episode${files.length === 1 ? '' : 's'} in ${(new Date().getTime() - date.getTime())/1000} seconds.`);

        const watcher = new Watcher(...this.paths);

        watcher.on(WatcherEvent.Update, async (file: File) => {
            if (file.isVideoFile() && fs.existsSync(file.path))
                await this.processFile(file);
        });

        watcher.on(WatcherEvent.Remove, async () => {
            await this.removeEpisodesWithNoFile();
            await this.removeSeasonsWithNoEpisodes();
            await this.removeShowsWithNoSeasons();
        });

        console.log(`[tv-indexer] Watching for file changes...`);
    }

    private async getAllMedia() : Promise<{ shows: {[key: string]: Show}, seasons: {[key: string]: Season}, episodes: {[key: string]: Episode} }> {
        return Promise.all([
            ShowService.get(),
            SeasonService.get(),
            EpisodeService.get()
        ]).then(results => ({
            shows: results[0].reduce((map, obj) => { map[obj.name] = obj; return map; }, {}) as {[key: string]: Show},
            seasons: results[1].reduce((map, obj) => { map[obj.show + obj.number] = obj; return map; }, {}) as {[key: string]: Season},
            episodes: results[2].reduce((map, obj) => { map[obj.show + obj.season + obj.number] = obj; return map; }, {}) as {[key: string]: Episode}
        }));
    }

    private async removeEpisodesWithNoFile() {
        const episodes = (await EpisodeService.get()).filter((episode: Episode) => !fs.existsSync(episode.path));
        for (var i = 0; i < episodes.length; i++)
            await EpisodeService.remove(episodes[i]);
        console.log(`[tv-indexer] Removed ${episodes.length} missing episode${episodes.length === 1 ? '' : 's'}.`);
    }

    private async removeSeasonsWithNoEpisodes() {
        const seasons = await SeasonService.getSeasonsWithNoEpisodes();
        for (var i = 0; i < seasons.length; i++)
            await SeasonService.remove(seasons[i]);
        console.log(`[tv-indexer] Removed ${seasons.length} season${seasons.length === 1 ? '' : 's'} with no episodes.`);
    }

    private async removeShowsWithNoSeasons() {
        const shows = await ShowService.getShowsWithNoSeasons();
        for (var i = 0; i < shows.length; i++)
            await ShowService.remove(shows[i]);
        console.log(`[tv-indexer] Removed ${shows.length} show${shows.length === 1 ? '' : 's'} with no seasons.`);
    }

    private async processFile(file: File, shows?: {[key: string]: Show}, seasons?: {[key: string]: Season}, episodes?: {[key: string]: Episode}) : Promise<void> {
        try {
            console.log(`[tv-indexer] Processing ${file.path}.`);

            const tv = TvFile.fromFile(file),
                show = await this.processShow(tv.show, shows || {}),
                season = await this.processSeason(tv.season, show, seasons || {});

            await this.processEpisode(file, tv.episode, season, show, episodes || {});
        } catch (e) {
            console.log(`[tv-indexer] Error processing ${file.path}.`);
            console.error(e);
        }
    }

    private async processShow(name: string, shows?: {[key: string]: Show}) : Promise<Show> {
        let show = shows[name] || await ShowService.findOne({ name });

        if (!show) {
            show = new Show();
            show.name = name;
            show.metadataStatus = Status.Unprocessed;
            await ShowService.insertOne(show);
        }

        if (show.metadataStatus === Status.Unprocessed) {
            show.metadataStatus = Status.Queued;
            this.metadataQueue.send(new Message(show, MessageType.Show));
            await ShowService.updateOne(show);
        }

        return show;
    }

    private async processSeason(number: number, show: Show, seasons: {[key: string]: Season}) : Promise<Season> {
        let season = seasons[show.name + number] || await SeasonService.findOne({ number, show: show.name });

        if (!season) {
            season = new Season();
            season.number = number;
            season.show = show.name;
            season.metadataStatus = Status.Unprocessed;
            await SeasonService.insertOne(season);
        }

        if (season.metadataStatus === Status.Unprocessed) {
            season.metadataStatus = Status.Queued;
            this.metadataQueue.send(new Message(season, MessageType.Season));
            await SeasonService.updateOne(season);
        }

        return season;
    }

    private async processEpisode(file: File, number: number, season: Season, show: Show, episodes: {[key: string]: Episode}) : Promise<void> {
        let episode = episodes[show.name + season.number + number] || await EpisodeService.findOne({ number, season: season.number, show: show.name });
        if (!episode) {
            episode = new Episode();
            episode.number = number;
            episode.season = season.number;
            episode.show = show.name;
            episode.runtime = await getVideoDuration(file.path);
            episode.subtitles = null;
            episode.subtitlesOffset = 0;
            episode.subtitlesStatus = Status.Unprocessed;
            episode.metadataStatus = Status.Unprocessed;
            episode.conversionStatus = Status.Unprocessed;
            await EpisodeService.insertOne(episode);
        }

        episode.path = file.path;

        if (episode.metadataStatus === Status.Unprocessed) {
            episode.metadataStatus = Status.Queued;
            console.log(`[tv-indexer] Enqueuing metadata request for ${file.path}.`);
            this.metadataQueue.send(new Message(episode, MessageType.Episode));
        }

        if (episode.conversionStatus === Status.Unprocessed) {
            episode.conversionStatus = Status.Queued;
            console.log(`[tv-indexer] Enqueuing conversion request for ${file.path}.`);
            this.conversionQueue.send(new Message(episode, MessageType.Episode));
        }

        await EpisodeService.updateOne(episode);
    }
}