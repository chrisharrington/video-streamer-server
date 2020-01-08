import 'module-alias/register';

import { Watcher, WatcherEvent } from '@root/watcher';
import { File } from '@root/models';

import { MovieIndexer } from '@indexer/indexers/movie';
import { TvIndexer } from './indexers/tv';

import '@root/extensions';

(async () => {
    const tvDirectories = ['/media/tv'],
        movieDirectories = ['/media/movies'];

    const tvIndexer = new TvIndexer(tvDirectories),
        movieIndexer = new MovieIndexer(movieDirectories);

    // await tvIndexer.run();
    await movieIndexer.run();

    const watcher = new Watcher(...movieDirectories);
    watcher.on(WatcherEvent.Remove, () => movieIndexer.removeMoviesWithNoFile());
    watcher.on(WatcherEvent.Update, (file: File) => movieIndexer.run(file));
})();