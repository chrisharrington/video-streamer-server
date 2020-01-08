import getVideoDuration from 'get-video-duration';
import * as fs from 'fs';

import MovieService from '@root/data/movie';
import { Movie, File } from '@root/models';

import MovieMetadata from '@indexer/metadata/movie';

import { Files } from './files';

export class MovieIndexer {
    paths: string[];
    fileManager: Files;
    
    constructor(paths: string[]) {
        this.paths = paths;
        this.fileManager = new Files();
    }

    async run(...files: File[]) : Promise<void> {
        console.log('[movie-indexer] Indexing movies.');

        await this.removeMoviesWithNoFile();

        const extensions = ['mkv', 'mp4', 'wmv', 'avi'];

        files = files.length > 0 ? files : [].concat.apply([], await Promise.all(this.paths.map(async library => await this.fileManager.find(library, extensions))));
        console.log(`[movie-indexer] Found ${files.length} video files.`);

        for (var i = 0; i < files.length; i++)
            await this.processFile(files[i]);

        console.log(`[movie-indexer] Done. Processed ${files.length} movies.`);
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