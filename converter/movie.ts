import * as path from 'path';
import * as fs from 'fs';

import Files from "@root/files";
import { Watcher, WatcherEvent } from "@root/watcher";
import Queue from "@root/queue";
import { File } from '@root/models';

import { Conversion } from './converter';
import Base from './base';

export default class MovieConverter extends Base {
    queue: Queue;

    constructor(queue: Queue) {
        super();

        this.queue = queue;
    }

    async run(directory: string) {
        const fileManager = new Files((file: string) => this.filter(file)),
            watcher = new Watcher(directory);

        const files = await fileManager.find(directory);
        for (var i = 0; i < files.length; i++)
            await this.send(files[i]);

        watcher.on(WatcherEvent.Update, async (file: File) => await this.send(file));

        console.log(`[converter] Watching for files: ${directory}`);
    }

    private async send(file: File) {
        if (this.isFileValid(file)) {
            console.log(`[converter] Sending movie ${file.path} to be converted.`);
            const directory = path.dirname(file.path),
                name = directory.split('/').slice(-1)[0],
                queued = `${directory}/${name}.queued.mp4`;

            fs.renameSync(file.path, queued);
            this.queue.send(new Conversion(queued, `${directory}/${name}.mp4`));
        }
    }

    private filter(file: string) : boolean {
        return ['mkv', 'mp4', 'm4v', 'avi'].indexOf(path.extname(file).substring(1)) > -1 &&
            file.indexOf('.done.mp4') === -1 &&
            file.indexOf('.queued.mp4') === -1;
    }
}