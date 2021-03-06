import * as path from 'path';

import Queue from '@lib/queue';
import { File, Message, MessageType, Movie, Status, Media, Episode } from '@lib/models';
import MovieService from '@lib/data/movie';
import EpisodeService from '@lib/data/episode';

import Encoder, { EncodingResult } from './encoder';


export default class Converter {
    private static converterQueue: Queue = new Queue('converter');
    private static subtitlerQueue: Queue = new Queue('subtitler');
    private static encoder: Encoder = new Encoder();

    static async initialize() {
        this.converterQueue.receive(async (message: Message) => await this.receive(message));

        console.log(`[converter] Initialized. Listening for messages...`);
    }

    private static async receive(message: Message) {
        try {
            const media = message.payload as Media;

            console.log(`[converter] Message received: ${media.path}`);

            const location = `${path.dirname(media.path)}/${File.getName(media.path)}.mp4`,
                file = new File(media.path, location),
                result: EncodingResult = await this.encoder.run(file);

            switch (message.type) {
                case MessageType.Movie:
                    const movie = media as Movie;
                    movie.conversionStatus = result.conversion === undefined ? Status.Processed : Status.Failed;
                    movie.conversionError = result.conversion === undefined ? null : result.conversion as Error;
                    movie.path = location;
                    await MovieService.updateOne(movie);

                    if (!result.subtitles) {
                        console.log(`[converter] No subtitles found. Enqueuing movie subtitle request for ${movie.name}.`);
                        this.subtitlerQueue.send(new Message(movie, MessageType.Movie));
                    }

                    break;
                case MessageType.Episode:
                    const episode = media as Episode;
                    episode.conversionStatus = result.conversion === undefined ? Status.Processed : Status.Failed;
                    episode.conversionError = result.conversion === undefined ? null : result.conversion as Error;
                    episode.path = location;
                    await EpisodeService.updateOne(episode);

                    if (!result.subtitles) {
                        console.log(`[converter] No subtitles found. Enqueuing episode subtitle request for ${episode.show}/${episode.season}/${episode.number}.`);
                        this.subtitlerQueue.send(new Message(episode, MessageType.Episode));
                    }

                    break;
            }
        } catch (e) {
            console.error(e);
            message.error = e;
            this.converterQueue.sendError(message);
        }
    }
}