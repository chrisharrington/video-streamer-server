import 'module-alias/register';

import Config from '@root/config';

import { MovieIndexer } from './movie';
import { TvIndexer } from './tv';

import Queue from '@root/queue';

(async () => {
    if (Config.enabled.indexer) {
        const tvDirectories = ['/media/tv'],
            movieDirectories = ['/media/movies'];

        const metadataQueue = new Queue('metadata'),
            subtitleQueue = new Queue('subtitler'),
            tvIndexer = new TvIndexer(subtitleQueue, metadataQueue, tvDirectories),
            movieIndexer = new MovieIndexer(subtitleQueue, metadataQueue, movieDirectories);

        await tvIndexer.run();
        await movieIndexer.run();
    } else
        console.log('[indexer] Disabled.');
})();