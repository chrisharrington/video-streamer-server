import * as path from 'path';
import * as fs from 'fs';

import Queue from '@root/queue';
import Files from '@root/files';
import { FileState, File, Message, MessageType } from '@root/models';
import { Watcher, WatcherEvent } from '@root/watcher';

import Encoder from './encoder';
import Subtitler from './subtitler';

export default class Converter {
    private static queue: Queue = new Queue('converter');
    private static encoder: Encoder = new Encoder();
    private static subtitler: Subtitler = new Subtitler();

    static async initialize() {
        const directory = '/media/movies',
            fileManager = new Files((file: File) => file.is(FileState.Valid) && file.is(FileState.Unprocessed)),
            watcher = new Watcher(directory),
            files = await fileManager.find(directory);

        this.queue.receive(async (message: Message) => await this.receive(message));

        for (var i = 0; i < files.length; i++)
            await this.send(files[i]);

        watcher.on(WatcherEvent.Update, (file: File) => {
            if (file.is(FileState.Valid) && file.is(FileState.Unprocessed))
                this.send(file);
        });

        console.log(`[converter] Initialized. Listening for messages...`);
    }

    private static async send(file: File) {
        console.log(`[converter] Sending file for conversion: ${file.path}`);

        const filepath = `${path.dirname(file.path)}/${File.getPathForState(File.getName(file.path), FileState.Queued)}`;
        fs.renameSync(file.path, filepath);
        this.queue.send(new Message(new File(filepath, `${path.dirname(file.path)}/${File.getName(file.path)}.mp4`), File.isEpisode(file.path) ? MessageType.Episode : MessageType.Movie));
    }

    private static async receive(message: Message) {
        const file = File.create(message.payload);
        console.log(`[converter] Message received: ${file.path}`);

        try {
            await Promise.all([
                this.encoder.run(file),
                this.subtitler.run(file)
            ]);
        } catch (e) {
            console.error(e);
            message.error = e;
            this.queue.sendError(message);
        }
    }
}