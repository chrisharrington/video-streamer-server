import * as request from 'request';

import Config from '@root/config';

import { Movie } from '@root/models';

import Queue from '@root/queue';

class Metadata {
    private queueName: string = 'movie-metadata';
    private errorQueueName: string = 'movie-metadata-error';

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
                    request(this.buildSearchMovieUrl(movie), (error, response, body) => {
                        if (error) reject(error);
                        resolve(JSON.parse(body));
                    });
                });

                if (metadata.total_results === 0) {
                    console.log(`[movie-indexer] No metadata found. ${movie.path}`);
                    await Queue.send(this.errorQueueName, movie);
                } else {
                    let result = metadata.results[0];
                    movie.poster = result.poster_path;
                    movie.synopsis = result.overview;
                    onMessage(movie);
                }
            }
        }, 300);
    }

    private buildSearchMovieUrl(movie: Movie) : string {
        return `${Config.movieDatabaseApiUrl}search/movie?api_key=${Config.movieDatabaseApiKey}&query=${movie.name}&year=${movie.year}`;
    }
}

export default new Metadata();

// https://api.themoviedb.org/3/search/movie?api_key=c26c67ed161834067f4d91430df1024e&query=21%20(2008)