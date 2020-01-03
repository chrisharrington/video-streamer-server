import 'module-alias/register';

import { MovieIndexer } from '@indexer/indexers/movie';
import { TvIndexer } from './indexers/tv';

import '@root/extensions';

[
    new TvIndexer(['/media/tv']),
    new MovieIndexer(['/media/movies'])
].forEach(async task => {
    try {
        await task.run();
    } catch (e) {
        console.error(e);
    }
});