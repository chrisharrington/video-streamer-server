import ShowService from '@root/data/show';
import SeasonService from '@root/data/season';
import EpisodeService from '@root/data/episode';
import Metadata from '@root/metadata/tv';
import { Episode, File, Show, Season } from '@root/models';
import Queue from '@root/queue';

import { Files } from './files';

const QUEUE = 'tv-indexer';

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
    
    constructor(paths: string[]) {
        this.paths = paths;
        this.fileManager = new Files();

        Queue.receive(QUEUE, async (file: File) => await this.processFile(file));
    }

    async run() : Promise<void> {
        console.log('[tv-indexer] Indexing TV shows.');

        const extensions = ['mkv', 'mp4', 'wmv', 'avi'];

        const files = [].concat.apply([], await Promise.all(this.paths.map(async library => await this.fileManager.find(library, extensions))));
        console.log(`[tv-indexer] Found ${files.length} video files.`);
        
        for (var i = 0; i < files.length; i++)
            await this.processFile(files[i]);

        console.log(`[tv-indexer] Done. Processed ${files.length} TV episodes.`);
    }

    private async processFile(file: File) : Promise<void> {
        try {
            let found: Episode = await EpisodeService.findOne({ seasons: { '$elemMatch': { episodes: { '$elemMatch': { path: file.path } } } } });
            if (found)
                return;

            console.log(`[tv-indexer] Processing ${file.path}.`);
            
            const tv = await TvFile.fromFile(file),
                show = await this.processShow(tv.show),
                season = await this.processSeason(tv.season, show);
            await this.processEpisode(file, tv.episode, season, show);
        } catch (e) {
            console.log(`[tv-indexer] Error processing ${file.path}.`);
            console.error(e);
        }
    }

    private async processShow(name: string) : Promise<Show> {
        let show = await ShowService.findOne({ name });
        if (!show)
            show = await ShowService.insertOne({ name } as Show);
        if (!show.synopsis || !show.synopsis || !show.year) {
            show = await Metadata.getShow(show);
            await ShowService.updateOne(show);
        }
        return show;
    }

    private async processSeason(number: number, show: Show) : Promise<Season> {
        let season = await SeasonService.findOne({ number, show: show.name });
        if (!season)
            season = await SeasonService.insertOne({ number, show: show.name } as Season);
        if (!season.poster) {
            season = await Metadata.getSeason(season, show);
            await SeasonService.updateOne(season);
        }
        return season;
    }

    private async processEpisode(file: File, number: number, season: Season, show: Show) : Promise<void> {
        let episode = await EpisodeService.findOne({ number, season: season.number, show: show.name });
        if (!episode)
            episode = await EpisodeService.insertOne({ path: file.path, number, season: season.number, show: show.name } as Episode);
        if (!episode.synopsis) {
            episode = await Metadata.getEpisode(episode, season, show);
            await EpisodeService.updateOne(episode);
        }
    }
}