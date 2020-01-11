import * as path from 'path';
import * as fs from 'fs';

import Queue from "@root/queue";
import Files from "@root/files";
import { Watcher, WatcherEvent } from "@root/watcher";
import { File, FileState, Message } from '@root/models';

import { Conversion } from './converter';

export default class TvConverter {
    queue: Queue;

    constructor(queue: Queue) {
        this.queue = queue;
    }

    async run(directory: string) {
        const fileManager = new Files((file: File) => file.is(FileState.Unprocessed)),
            watcher = new Watcher(directory);

        const files = await fileManager.find(directory);
        for (var i = 0; i < files.length; i++)
            await this.send(files[i]);

        watcher.on(WatcherEvent.Update, async (file: File) => await this.send(file));

        console.log(`[converter] Watching for files: ${directory}`);
    }

    private async send(file: File) {
        if (!file.is(FileState.Valid) || file.is(FileState.Converting) || file.is(FileState.Converted))
            return;

        console.log(`[converter] Sending TV episode ${file.path} to be converted.`);

        const name = file.path.split('/').slice(-1)[0].substring(0, 6),
            queued = `${path.dirname(file.path)}/${name}.queued.mp4`;

        fs.renameSync(file.path, queued);
        this.queue.send(new Message(new Conversion(queued, `${path.dirname(file.path)}/${name}.mp4`)));
    }
}