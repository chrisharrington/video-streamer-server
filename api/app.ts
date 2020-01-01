import 'module-alias/register';

import Config from '@root/config';
import Server from '@root/server/server';
import { MovieIndexer } from '@root/indexer/movie';
import { TvIndexer } from './indexer/tv';

[
    // new Server(Config.serverPort),
    // new MovieIndexer(['/media/movies']),
    new TvIndexer(['/media/tv'])
].forEach(async task => {
    try {
        await task.run();
    } catch (e) {
        console.error(e);
    }
});