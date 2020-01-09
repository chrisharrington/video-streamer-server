import * as path from 'path';
import * as fs from 'fs';

import Queue from "@root/queue";
import Files from "@root/files";
import { Watcher, WatcherEvent } from "@root/watcher";
import { File } from '@root/models';

import Base from "./base";
import { Conversion } from './converter';

export default class TvConverter extends Base {
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
            console.log(`[converter] Sending TV episode ${file.path} to be converted.`);

            const name = file.path.split('/').slice(-1)[0].substring(0, 6),
                queued = `${path.dirname(file.path)}/${name}.queued.mp4`;

            fs.renameSync(file.path, queued);
            this.queue.send(new Conversion(queued, `${path.dirname(file.path)}/${name}.mp4`));
        }
    }

    private filter(file: string) : boolean {
        return ['mkv', 'mp4', 'm4v', 'avi'].indexOf(path.extname(file).substring(1)) > -1 &&
            file.indexOf('.done.mp4') === -1 &&
            file.indexOf('.queued.mp4') === -1;
    }
}