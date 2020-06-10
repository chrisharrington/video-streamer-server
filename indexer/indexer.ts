import { MovieIndexer } from './movie';
import { TvIndexer } from './tv';

import Queue from '@lib/queue';

export default class Indexer {
    static async initialize() {
        const tvDirectories = ['/media/tv'],
            movieDirectories = ['/media/movies'];

        const metadataQueue = new Queue('metadata'),
            subtitleQueue = new Queue('subtitler'),
            conversionQueue = new Queue('converter'),
            tvIndexer = new TvIndexer(subtitleQueue, metadataQueue, conversionQueue, tvDirectories),
            movieIndexer = new MovieIndexer(subtitleQueue, metadataQueue, conversionQueue, movieDirectories);

        await tvIndexer.run();
        await movieIndexer.run();
    }
}