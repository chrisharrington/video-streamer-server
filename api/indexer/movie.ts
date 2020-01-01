import MovieService from '@root/data/movie';
import Metadata from '@root/metadata/movie';

import { Movie } from '@root/models';

import { Files } from './files';

export class MovieIndexer {
    paths: string[];
    fileManager: Files;
    
    constructor(paths: string[]) {
        this.paths = paths;
        this.fileManager = new Files();

        Metadata.receiveMovie(this.onMessage.bind(this));
    }

    async run() : Promise<void> {
        console.log('[movie-indexer] Indexing movies.');

        // TODO: retrieve media library locations from database.
        const extensions = ['mkv', 'mp4', 'wmv', 'avi'];

        let files = [].concat.apply([], await Promise.all(this.paths.map(async library => await this.fileManager.find(library, extensions))));
        console.log(`[movie-indexer] Found ${files.length} video files.`);

        let movies: Movie[] = await Promise.all(files.map(file => Movie.fromFile(file)));
        movies = await MovieService.load(movies);
        console.log(`[movie-indexer] ${movies.length} new movies.`);

        movies.forEach((movie: Movie) => Metadata.enqueueMovie(movie));
        console.log(`[movie-indexer] Enqueued ${movies.length} movies for metadata retrieval.`);
    }

    private async onMessage(movie: Movie) {
        console.log(`[movie-indexer] Updating movie. ${JSON.stringify(movie)}.`);
        await MovieService.updateOne(movie);
    }
}