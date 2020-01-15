import * as express from 'express';
import * as fs from 'fs';

import MovieService from '@root/data/movie';
import { Movie } from '@root/models';

import Base from './base';

export default class Movies extends Base {
    app: express.Application;

    initialize(app) {
        app.get('/movies/all', this.getMovies.bind(this));
        app.post('/movies/progress', this.saveProgress.bind(this));
        app.get('/movies/:year/:name', this.getMovieByYearAndName.bind(this));

        app.get('/movies/play/:year/:name', this.playMovie.bind(this));
        app.get('/movies/subtitle/:year/:name', this.getSubtitlesForMovie.bind(this));
    }

    private async getMovies(_, response: express.Response) {
        console.log('[server] Request received: GET /movies');

        try {
            let movies = await MovieService.get();
            console.log(`[server] Request succeeded. GET /movies. Found ${movies.length} movies.`);
            response.status(200).send(movies.map(this.sanitize));
        } catch (e) {
            console.error(`[server] Request failed: GET /movies.`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async getMovieByYearAndName(request: express.Request, response: express.Response) {
        console.log('[server] Request received: GET /movies/:year/:name');
    
        try {
            let movie = await MovieService.getByYearAndName(parseInt(request.params.year), request.params.name);
            console.log(`[server] Request succeeded. GET /movies/:year/:name. Found movie:`, JSON.stringify(movie, null, 4));
            response.status(200).send(this.sanitize(movie));
        } catch (e) {
            console.error(`[server] Request failed: GET /movies/:year/:name.`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async saveProgress(request: express.Request, response: express.Response) {
        console.log('[server] Request received: POST /movies/progress', request.body);

        try {
            let movie: Movie = await MovieService.findById(request.body.id);
            if (!movie) {
                console.error(`[server] Error: no movie found: ${request.body.id}.`);
                response.sendStatus(404);
                return;
            }

            movie.progress = parseInt(request.body.secondsFromStart);
            if (isNaN(movie.progress)) {
                console.error(`[server] Error: invalid progress: ${request.body.secondsFromStart}`);
                response.sendStatus(400);
                return;
            }

            await MovieService.updateOne(movie);
            response.sendStatus(200);
        } catch (e) {
            console.error(`[server] Request failed: POST /movies/progress.`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private sanitize(movie: Movie) : Movie {
        delete movie.path;
        return movie;
    }

    private async playMovie(request: express.Request, response: express.Response) {
        console.log('[server] Request received: GET /movies/play/:year/:name', request.params.year, request.params.name, request.headers.range);

        try {
            const movie = await MovieService.getByYearAndName(parseInt(request.params.year), request.params.name);
            if (!movie) {
                console.error(`[server] Movie not found:`, request.params.year, request.params.name);
                response.sendStatus(404);
            }

            this.stream(request, response, movie.path);
        } catch (e) {
            console.error('[server] Request failed: GET /movies/play/:year/:name');
            console.error(e);
            response.sendStatus(500);
        }
    }

    private async getSubtitlesForMovie(request: express.Request, response: express.Response) {
        console.log(`[server] Request received: GET /movies/subtitle/:year/:name`, request.params.year, request.params.name);

        try {
            const movie = await MovieService.getByYearAndName(parseInt(request.params.year), request.params.name);
            if (!movie) {
                console.error(`[server] Movie not found:`, request.params.year, request.params.name);
                response.sendStatus(404);
            }

            response.writeHead(200, {
                'Content-Length': fs.statSync(movie.subtitles).size,
                'Content-Type': 'text/vvt',
            });
            fs.createReadStream(movie.subtitles).pipe(response);
        } catch (e) {
            console.error(`[server] Request failed: GET /movies/subtitle/:year/:name`);
            console.error(e);
            response.sendStatus(500);
        }
    }
}