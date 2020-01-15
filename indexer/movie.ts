import getVideoDuration from 'get-video-duration';
import * as fs from 'fs';
import * as path from 'path';

import Files from '@root/files';
import MovieService from '@root/data/movie';
import { Movie, File, FileState, Status, MessageType, Message } from '@root/models';
import { Watcher, WatcherEvent } from '@root/watcher';
import Queue from '@root/queue';

export class MovieIndexer {
    paths: string[];
    fileManager: Files;
    subtitleQueue: Queue;
    metadataQueue: Queue;
    
    constructor(subtitleQueue: Queue, metadataQueue: Queue, paths: string[]) {
        this.subtitleQueue = subtitleQueue;
        this.metadataQueue = metadataQueue;
        this.paths = paths;
        this.fileManager = new Files((file: File) => file.is(FileState.Converted));
    }

    async run(...files: File[]) : Promise<void> {
        console.log('[movie-indexer] Indexing movies.');

        await this.removeMoviesWithNoFile();

        files = files.length > 0 ? files : [].concat.apply([], await Promise.all(this.paths.map(async library => await this.fileManager.find(library))));
        console.log(`[movie-indexer] Found ${files.length} video file${files.length === 1 ? '' : 's'}.`);

        for (var i = 0; i < files.length; i++)
            await this.processFile(files[i]);

        console.log(`[movie-indexer] Done. Processed ${files.length} movie${files.length === 1 ? '' : 's'}.`);

        const watcher = new Watcher(...this.paths);
        watcher.on(WatcherEvent.Update, async (file: File) => {
            if (file.is(FileState.Converted))
                await this.processFile(file);
        });
    }
    
    async removeMoviesWithNoFile() {
        const movies = (await MovieService.get()).filter((movie: Movie) => !fs.existsSync(movie.path));
        for (var i = 0; i < movies.length; i++)
            await MovieService.remove(movies[i]);
        console.log(`[movie-indexer] Removed ${movies.length} missing movie${movies.length === 1 ? '' : 's'}.`);
    }

    private async processFile(file: File) : Promise<void> {
        try {
            const title = file.path.split('/').slice(-2, -1).join(),
                name = title.split(' ').slice(0, -1).join(' '),
                year = parseInt(title.substring(title.lastIndexOf(' ')+1).replace('(', '').replace(')', ''));

            console.log(`[movie-indexer] Processing ${file.path}.`);

            let movie: Movie = await MovieService.findOne({ name, year });
            if (!movie) {
                movie = new Movie(file.path);
                movie.name = name;
                movie.year = year;
                movie.progress = 0;
                movie.runtime = await getVideoDuration(file.path);
                movie.subtitles = null;
                movie.subtitlesOffset = 0;
                movie.subtitlesStatus = Status.Missing;
                movie.metadataStatus = Status.Missing;
                await MovieService.insertOne(movie);
            }

            movie.path = file.path;

            if (movie.metadataStatus === Status.Missing) {
                movie.metadataStatus = Status.Queued;
                this.metadataQueue.send(new Message(movie, MessageType.Movie));
            }

            const subtitlesPath = `${path.dirname(file.path)}/${File.getName(file.path)}.vtt`;
            if (fs.existsSync(subtitlesPath)) {
                movie.subtitlesStatus = Status.Fulfilled;
                movie.subtitles = subtitlesPath;
            } else if (movie.subtitlesStatus === Status.Missing) {
                movie.subtitlesStatus = Status.Queued;
                await this.subtitleQueue.send(new Message(movie, MessageType.Movie));
            }

            await MovieService.updateOne(movie);
        } catch (e) {
            console.log(`[movie-indexer] Error processing ${file.path}.`);
            console.error(e);
        }
    }
}