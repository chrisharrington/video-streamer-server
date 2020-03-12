import Queue from '@root/queue';
import { Message, MessageType, Movie, Status, Show, Season, Episode } from '@root/models';

import MovieService from '@root/data/movie';
import ShowService from '@root/data/show';
import SeasonService from '@root/data/season';
import EpisodeService from '@root/data/episode';

import MovieMetadata from './movie';
import TvMetadata from './tv';

export default class Metadata {
    private static queue: Queue;

    static initialize() {
        const queue = this.queue = new Queue('metadata');

        queue.receive(async (message: Message) => {
            console.log(`[metadata] Message received: ${JSON.stringify(message)}`);

            switch (message.type) {
                case MessageType.Movie:
                    await this.handleMovie(message.payload as Movie);
                    break;
                case MessageType.Show:
                    await this.handleShow(message.payload as Show);
                    break;
                case MessageType.Season:
                    await this.handleSeason(message.payload as Season);
                    break;
                case MessageType.Episode:
                    await this.handleEpisode(message.payload as Episode);
                    break;
                default:
                    throw new Error(`Message type "${message.type}" corresponds to no handler.`);
            }
        });

        console.log(`[metadata] Initialized. Listening for messages...`);
    }

    private static async handleMovie(movie: Movie) : Promise<void> {
        try {
            movie = await MovieMetadata.getMovie(movie);
            movie.metadataStatus = Status.Processed;
            await MovieService.updateOne(movie);
            
            console.log(`[metadata] Metadata retrieved for movie: ${movie.name}`);
        } catch (e) {
            console.log(`[metadata] Failed getting movie metadata: ${JSON.stringify(movie)}`);
            console.error(e);
            this.queue.sendError(new Message(movie, MessageType.Movie, e));
        }
    }

    private static async handleShow(show: Show) : Promise<void> {
        try {
            show = await TvMetadata.getShow(show);
            show.metadataStatus = Status.Processed;
            await ShowService.updateOne(show);

            console.log(`[metadata] Metadata retrieved for show: ${show.name}`);
        } catch (e) {
            console.log(`[metadata] Failed getting show metadata: ${JSON.stringify(show)}`);
            console.error(e);
            this.queue.sendError(new Message(show, MessageType.Show, e));
        }
    }

    private static async handleSeason(season: Season) : Promise<void> {
        try {
            const show = await ShowService.findOne({ name: season.show });
            if (!show)
                throw new Error(`Unable to find show: ${season.show}`);

            season = await TvMetadata.getSeason(season, show);
            season.metadataStatus = Status.Processed;
            await SeasonService.updateOne(season);

            console.log(`[metadata] Metadata retrieved for season: ${show.name} season ${season.number}`);
        } catch (e) {
            console.log(`[metadata] Failed getting season metadata: ${JSON.stringify(season)}`);
            console.error(e);
            this.queue.sendError(new Message(season, MessageType.Season, e));
        }
    }

    private static async handleEpisode(episode: Episode) : Promise<void> {
        try {
            const show = await ShowService.findOne({ name: episode.show });
            if (!show)
                throw new Error(`Unable to find show: ${episode.show}`);

            const season = await SeasonService.findOne({ show: episode.show, number: episode.season });
            if (!season)
                throw new Error

            episode = await TvMetadata.getEpisode(episode, season, show);
            episode.metadataStatus = Status.Processed;
            await EpisodeService.updateOne(episode);

            console.log(`[metadata] Metadata retrieved for episode: ${show.name} season ${season.number} episode ${episode.number}`);
        } catch (e) {
            console.log(`[metadata] Failed getting season metadata: ${JSON.stringify(episode)}`);
            console.error(e);
            this.queue.sendError(new Message(episode, MessageType.Season, e));
        }
    }
}