import * as fs from 'fs';
import * as path from 'path';
import * as OpenSubtitles from 'opensubtitles-api';
import * as fetch from 'node-fetch';
import * as zlib from 'zlib';
import * as srt2vtt from 'srt-to-vtt';

import Config from '@root/config';
import Queue from '@root/queue';
import MovieService from '@root/data/movie';
import EpisodeService from '@root/data/episode';
import { Media, Movie, Episode, Status, Message, MessageType, File } from '@root/models';

export class Subtitler {
    private static api: OpenSubtitles;
    private static queue: Queue;

    static initialize() {
        this.queue = new Queue('subtitler');
        this.api = new OpenSubtitles({ useragent: Config.subtitlesUserAgent });

        this.queue.receive(async (message: any) => await this.onMessage(message), 24*60*60*1000/180);

        console.log(`[subtitler] Initialized. Listening for messages...`);
    }

    private static async onMessage(message: Message) : Promise<void> {
        console.log(`[subtitler] Subtitle message received: ${JSON.stringify(message)}`);

        if (message.type === MessageType.Movie) {
            let movie: Movie = message.payload;

            movie = await this.searchForSubtitles(movie, {
                query: `${movie.name} ${movie.year}`
            }, message.type, `${path.dirname(movie.path)}/${File.getName(movie.path)}.vtt`);
    
            await MovieService.updateOne(movie);
        } else if (message.type === MessageType.Episode) {
            let episode: Episode = message.payload;

            episode = await this.searchForSubtitles(episode, {
                query: episode.show,
                season: episode.season,
                episode: episode.number
            }, message.type, `${path.dirname(episode.path)}/${episode.path.split('/').slice(-1)[0].substr(0, 6)}.vtt`);
    
            await EpisodeService.updateOne(episode)
        }
        else
            throw new Error(`Message type "${message.type}" has no handler.`);
    }

    private static async searchForSubtitles(media: Media, query: any, type: MessageType, output: string) : Promise<any> {
        try {
            const results = await this.api.search(Object.assign({
                sublanguageid: 'eng',
                gzip: true,
                extensions: ['srt']
            }, query));

            if (!results || !results['en'])
                throw new Error(`No subtitles found for query: ${JSON.stringify(media)}`);

            await this.downloadSubtitle(results.en.url, output);
            
            media.subtitles = output;
            media.subtitlesStatus = Status.Fulfilled;
        } catch (e) {
            console.log(`[subtitler] Error processing subtitle query: ${JSON.stringify(media)}`);
            console.error(e);

            media.subtitlesStatus = Status.Missing;
            this.queue.sendError(new Message(media, type, e));
        }

        return media;
    }

    private static async downloadSubtitle(url: string, destination: string) : Promise<void> {
        const response = await fetch(url);
        if (response.status !== 200)
            throw new Error(`[subtitler] Invalid response from subtitle URL: ${response.status}`);
        
        const stream = fs.createWriteStream(destination),
            gunzip = zlib.createGunzip();

        response.body
            .pipe(gunzip)
            .pipe(srt2vtt())
            .pipe(stream);

        console.log(`[subtitler] Finished downloading subtitle: ${destination}`);
    }
}