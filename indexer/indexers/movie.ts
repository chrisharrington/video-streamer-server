import getVideoDuration from 'get-video-duration';
import * as fs from 'fs';
import * as path from 'path';

import Files from '@root/files';
import MovieService from '@root/data/movie';
import { Movie, File } from '@root/models';
import { Watcher, WatcherEvent } from '@root/watcher';

import MovieMetadata from '@indexer/metadata/movie';

import Base from './base';

export class MovieIndexer extends Base {
    paths: string[];
    fileManager: Files;
    
    constructor(paths: string[]) {
        super();

        this.paths = paths;
        this.fileManager = new Files((file: string) => this.fileFilter(file));
    }

    async run(...files: File[]) : Promise<void> {
        console.log('[movie-indexer] Indexing movies.');

        await this.removeMoviesWithNoFile();

        files = files.length > 0 ? files : [].concat.apply([], await Promise.all(this.paths.map(async library => await this.fileManager.find(library))));
        console.log(`[movie-indexer] Found ${files.length} video files.`);

        for (var i = 0; i < files.length; i++)
            await this.processFile(files[i]);

        console.log(`[movie-indexer] Done. Processed ${files.length} movies.`);

        const watcher = new Watcher(...this.paths);
        watcher.on(WatcherEvent.Update, async (file: File) => {
            if (this.fileFilter(file.path))
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
            if (!movie)
                movie = await MovieService.insertOne({ name, year, progress: 0, runtime: (await getVideoDuration(file.path)) } as Movie);

            movie.path = file.path;

            if (!movie.poster || !movie.synopsis) {
                movie = await MovieMetadata.getMovie(movie);
                await MovieService.updateOne(movie);
            }
        } catch (e) {
            console.log(`[movie-indexer] Error processing ${file.path}.`);
            console.error(e);
        }
    }
}