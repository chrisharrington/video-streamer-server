import * as path from 'path';
import * as fs from 'fs';

import Queue from '@root/queue';
import { FileState, File, Message, MessageType, Movie, Status, Media } from '@root/models';
import { Watcher, WatcherEvent } from '@root/watcher';
import MovieService from '@root/data/movie';

import Encoder from './encoder';

export default class Converter {
    private static queue: Queue = new Queue('converter');
    private static encoder: Encoder = new Encoder();

    static async initialize() {
        this.queue.receive(async (message: Message) => await this.receive(message));

        console.log(`[converter] Initialized. Listening for messages...`);
    }

    private static async receive(message: Message) {
        try {
            const media = message.payload as Media;

            console.log(`[converter] Message received: ${media.path}`);

            const file = new File(media.path, `${path.dirname(media.path)}/${File.getName(media.path)}.mp4`);
            await this.encoder.run(file);

            switch (message.type) {
                case MessageType.Movie:
                    const movie = await MovieService.findById(media._id);
                    movie.conversionStatus = Status.Processed;
                    await MovieService.updateOne(movie);
                    break;
                case MessageType.Episode:

                    break;
            }
        } catch (e) {
            console.error(e);
            message.error = e;
            this.queue.sendError(message);
        }
    }
}