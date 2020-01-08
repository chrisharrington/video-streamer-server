import 'module-alias/register';

import * as path from 'path';
import * as fs from 'fs';

import Queue from '@root/queue';
import '@root/extensions';
import { Watcher, WatcherEvent } from '@root/watcher';

import { File } from '@root/models';

import Files from './files';
import Converter from './converter';

(async function() {
    const directory = '/media/movies',
        extensions = ['mkv', 'mp4', 'm4v', 'avi'];

    const converter = new Converter(),
        files = await Files.find(directory, extensions),
        watcher = new Watcher(directory),
        queue = new Queue('converter');

    watcher.on(WatcherEvent.Update, (file: File) => {
        if (extensions.indexOf(path.extname(file.path).substring(1)) > -1 && file.path.indexOf('converting.mp4') === -1) {
            console.log(`[converter] Sending ${file.path} to be converted.`);
            queue.send(file);
        }
    });

    process.on('SIGINT', () => converter.abort());

    queue.receive(async (file: File) => {
        try {
            if (fs.existsSync(path.dirname(file.path) + '/converted'))
                return;

            console.log(`[converter] Received ${file.path} for conversion.`);
            await converter.convert(file.path, path.dirname(file.path) + '/' + path.dirname(file.path).split('/').slice(-1)[0] + '.mp4');
        } catch (e) {
            console.log(`[converter] Failed to convert ${file.path}.`);
            console.error(e);

            queue.sendError(file);
        }
    });

    for (var i = 0; i < files.length; i++) {
        console.log(`[converter] Sending ${files[i].path} to be converted.`);
        await queue.send(files[i]);
    }
})();