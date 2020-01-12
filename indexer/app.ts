import 'module-alias/register';

import { Watcher, WatcherEvent } from '@root/watcher';
import { File, FileState } from '@root/models';

import { MovieIndexer } from './movie';
import { TvIndexer } from './tv';

import Queue from '@root/queue';

(async () => {
    const tvDirectories = ['/media/tv'],
        movieDirectories = ['/media/movies'];

    const metadataQueue = new Queue('metadata'),
        subtitleQueue = new Queue('subtitler'),
        tvIndexer = new TvIndexer(subtitleQueue, metadataQueue, tvDirectories),
        movieIndexer = new MovieIndexer(subtitleQueue, metadataQueue, movieDirectories);

    await tvIndexer.run();
    await movieIndexer.run();

    const movieWatcher = new Watcher(...movieDirectories);
    movieWatcher.on(WatcherEvent.Remove, (file: File) => file.is(FileState.Converted) && movieIndexer.removeMoviesWithNoFile());
    movieWatcher.on(WatcherEvent.Update, (file: File) => file.is(FileState.Converted) && movieIndexer.run(file));

    const tvWatcher = new Watcher(...tvDirectories);
    tvWatcher.on(WatcherEvent.Remove, (file: File) => file.is(FileState.Converted) && tvIndexer.removeEpisodesWithNoFile());
    tvWatcher.on(WatcherEvent.Update, (file: File) => file.is(FileState.Converted) && tvIndexer.run(file));
})();