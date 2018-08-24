import * as express from 'express';
import * as fs from 'fs';

import MovieService from '@root/data/movie';

export default class Movies {
    app: any;

    static initialize(app) {
        app.get('/movies/all', this.getMovies.bind(this));
        app.get('/movies/play/:year/:name', this.playMovie.bind(this));
    }

    private static async getMovies(request, response) {
        console.log('[server] Request received: GET /movies');

        try {
            let movies = await MovieService.get();
            console.log(`[server] Request succeeded. GET /movies. Found ${movies.length} movies.`);
            response.status(200).send(movies);
        } catch (e) {
            console.error(`[server] Request failed: GET /movies. ${e.toString()}`);
            response.status(500).send(e);
        }
    }

    // localhost:8101/play-movie/1988/Die Hard

    private static async playMovie(request, response) {
        const name = request.params.name,
            year = request.params.year;

        console.log(`[server] Request received: GET /play-movie/${year}/${name}`);

        try {
            let movie = await MovieService.findOne({ name });
            if (!movie) {
                response.status(404).send(`No movie found with name and year ${name} (${year}).`)
                return;
            }

            movie.path = '\\\\bravo\\media\\Kid\'s Movies\\Ballerina (2016)\\Ballerina (2016).mkv';

            const stat = fs.statSync(movie.path)
            if (request.headers.range) {
                const parts = request.headers.range.replace(/bytes=/, "").split("-")
                const start = parseInt(parts[0], 10)
                const end = parts[1] ? parseInt(parts[1], 10) : stat.size-1
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': (end-start)+1,
                    'Content-Type': 'video/mp4',
                }
                response.writeHead(206, head);
                fs.createReadStream(movie.path, {start, end}).pipe(response);
            } else {
                const head = {
                    'Content-Length': stat.size,
                    'Content-Type': 'video/mp4',
                }
                response.writeHead(200, head)
                fs.createReadStream(movie.path).pipe(response)
            }

        } catch (e) {
            console.log(`[server] Request failed: GET /play-movie/${year}/${name}. ${e.toString()}`);
            response.status(500).send(e);
        }
    }
}