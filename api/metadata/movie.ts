import * as request from 'request';

import Config from '@root/config';

import { Movie } from '@root/models';

import Queue from '@root/queue';

class Metadata {
    private queueName: string = 'movie-metadata';
    private errorQueueName: string = 'movie-metadata-error';
    private configuration: Promise<void>;
    private imageBaseUrl: string = null;

    constructor() {
        this.configuration = request(`${Config.metadataApiUrl}configuration?api_key=${Config.metadataApiKey}`, (error, _, body) => {
            this.imageBaseUrl = JSON.parse(body).images.base_url;
        });
    }

    async enqueueMovie(movie: Movie) {
        await Queue.send(this.queueName, movie);
    }

    async receiveMovie(onMessage: (movie: Movie) => void) {
        await Queue.receive(this.queueName, async (movie: Movie) => {
            console.log(`[movie-indexer] Received metadata message. ${movie.path}`);
            if (!movie.name || !movie.year) {
                console.log(`[movie-indexer] Movie missing either name or year. ${movie.path}`);
                await Queue.send(this.errorQueueName, movie);
            } else {
                let metadata = await new Promise<any>((resolve, reject) => {
                    const url = this.buildSearchMovieUrl(movie);
                    console.log(`[movie-indexer] Finding metadata from ${url}.`);
                    request(url, (error, _, body) => {
                        if (error) reject(error);
                        resolve(JSON.parse(body));
                    });
                });

                if (metadata.total_results === 0) {
                    console.log(`[movie-indexer] No metadata found. ${movie.path}`);
                    await Queue.send(this.errorQueueName, movie);
                } else {
                    await this.configuration;
                    let result = metadata.results.find(m => m.title === movie.name) || metadata.results[0];
                    movie.poster = `${this.imageBaseUrl}w342${result.poster_path}`;
                    movie.synopsis = result.overview;
                    onMessage(movie);
                }
            }
        }, 300);
    }

    private buildSearchMovieUrl(movie: Movie) : string {
        return `${Config.metadataApiUrl}search/movie?api_key=${Config.metadataApiKey}&query=${movie.name}&year=${movie.year}`;
    }
}

export default new Metadata();