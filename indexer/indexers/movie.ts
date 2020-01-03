import getVideoDuration from 'get-video-duration';

import MovieService from '@root/data/movie';

import MovieMetadata from '@indexer/metadata/movie';

import { Movie, File } from '@root/models';

import { Files } from './files';

export class MovieIndexer {
    paths: string[];
    fileManager: Files;
    
    constructor(paths: string[]) {
        this.paths = paths;
        this.fileManager = new Files();
    }

    async run() : Promise<void> {
        console.log('[movie-indexer] Indexing movies.');

        // TODO: retrieve media library locations from database.
        const extensions = ['mkv', 'mp4', 'wmv', 'avi'];

        let files = [].concat.apply([], await Promise.all(this.paths.map(async library => await this.fileManager.find(library, extensions))));
        console.log(`[movie-indexer] Found ${files.length} video files.`);

        for (var i = 0; i < files.length; i++)
            await this.processFile(files[i]);

        console.log(`[movie-indexer] Done. Processed ${files.length} movies.`);
    }
    
    async processFile(file: File) : Promise<void> {
        try {
            const title = file.path.split('/').slice(-2, -1).join(),
                name = title.split(' ').slice(0, -1).join(' '),
                year = parseInt(title.substring(title.lastIndexOf(' ')+1).replace('(', '').replace(')', ''));

            console.log(`[tv-indexer] Processing ${file.path}.`);

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