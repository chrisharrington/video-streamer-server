import * as express from 'express';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';

import MovieService from '@root/data/movie';
import { Movie } from '@root/models';

export default class Movies {
    app: express.Application;

    static initialize(app) {
        app.get('/movies/all', this.getMovies.bind(this));
        app.post('/movies/progress', this.saveMovieProgress.bind(this));
        app.get('/movies/:year/:name', this.getMovieByYearAndName.bind(this));

        app.get('/movies/stream/:year/:name', this.streamMovie.bind(this));
        app.get('/movies/play/:year/:name', this.playMovie.bind(this));
        app.get('/movies/subtitle/:year/:name', this.getSubtitlesForMovie.bind(this));
    }

    private static async getMovies(_, response: express.Response) {
        console.log('[server] Request received: GET /movies');

        try {
            let movies = await MovieService.get();
            console.log(`[server] Request succeeded. GET /movies. Found ${movies.length} movies.`);
            response.status(200).send(movies.map(this.sanitize));
        } catch (e) {
            console.error(`[server] Request failed: GET /movies. ${e.toString()}`);
            response.status(500).send(e);
        }
    }

    private static async getMovieByYearAndName(request: express.Request, response: express.Response) {
        console.log('[server] Request received: GET /movies/:year/:name');
    
        try {
            let movie = await MovieService.getByYearAndName(parseInt(request.params.year), request.params.name);
            console.log(`[server] Request succeeded. GET /movies/:year/:name. Found movie:`, JSON.stringify(movie, null, 4));
            response.status(200).send(this.sanitize(movie));
        } catch (e) {
            console.error(`[server] Request failed: GET /movies/:year/:name. ${e.toString()}`);
            response.status(500).send(e);
        }
    }

    private static async saveMovieProgress(request: express.Request, response: express.Response) {
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
            console.error(`[server] Request failed: POST /movies/:year/:name/:secondsFromStart. ${e.toString()}`);
            response.status(500).send(e);
        }
    }

    private static sanitize(movie: Movie) : Movie {
        delete movie.path;
        return movie;
    }

    private static async playMovie(request: express.Request, response: express.Response) {
        console.log('[server] Request received: GET /movies/play/:year/:name', request.params.year, request.params.name, request.headers.range);

        try {
            const movie = await MovieService.getByYearAndName(parseInt(request.params.year), request.params.name);
            if (!movie) {
                console.error(`[server] Movie not found:`, request.params.year, request.params.name);
                response.sendStatus(404);
            }

            const stat = fs.statSync(movie.path),
                fileSize = stat.size,
                range = request.headers.range;

            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                response.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': (end-start)+1,
                    'Content-Type': 'video/webm',
                });
                fs.createReadStream(movie.path, { start, end }).pipe(response);
            } else {
                response.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': 'video/webm',
                });
                fs.createReadStream(movie.path).pipe(response);
            }
        } catch (e) {
            console.error('[server] Request failed: GET /movies/play/:year/:name', e.toString());
            response.sendStatus(500);
        }
    }

    private static async getSubtitlesForMovie(request: express.Request, response: express.Response) {
        console.log(`[server] Request received: GET /movies/subtitle/:year/:name`, request.params.year, request.params.name);

        try {
            const movie = await MovieService.getByYearAndName(parseInt(request.params.year), request.params.name);
            if (!movie) {
                console.error(`[server] Movie not found:`, request.params.year, request.params.name);
                response.sendStatus(404);
            }

            const path = movie.path.split('/').slice(0, -1).join('/') + '/en.vtt';
            response.writeHead(200, {
                'Content-Length': fs.statSync(path).size,
                'Content-Type': 'text/vvt',
            });
            fs.createReadStream(path).pipe(response);
        } catch (e) {
            console.error(`[server] Request failed: GET /movies/subtitle/:year/:name`, e.toString());
            response.sendStatus(500);
        }
    }

    private static async streamMovie(request: express.Request, response: express.Response) {
        const movie = await MovieService.getByYearAndName(parseInt(request.params.year), request.params.name);
        console.log(`[server] Request received: GET /stream-movie/${movie.year}/${movie.name}`);

        try {
            const stat = await fs.statSync(movie.path);
            response.set('Content-Type', 'video/mp4');
            response.set('Content-Length', stat.size.toString());

            new ffmpeg({ source: movie.path })
                // .seekInput(request.query.seek ? parseInt(request.query.seek) : 0)
                .outputOptions('-movflags frag_keyframe+empty_moov')
                .withVideoCodec('libx264')
                .withAudioBitrate('128k')
                .withAudioCodec('libmp3lame')
                .toFormat('mp4')
                .on('stderr', e => console.log(e))
                .on('error', () => console.log('An error occurred.'))
                .pipe(response, { end: true });
        } catch (e) {
            console.log(`[server] Request failed: GET /stream-movie/${movie.year}/${movie.name}.`);
            console.error(e);
            response.status(500).send(e);
        }
    }
}