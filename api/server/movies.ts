import * as express from 'express';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';

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
            ffmpeg(`c:\\users\\chris\\Code\\video-streamer-server\\${name}.mkv`)
                .videoCodec('libx264')
                .audioCodec('libmp3lame')
                .outputOptions('-movflags frag_keyframe+empty_moov')
                .seekInput(1000)
                .format('mp4')
                .on('error', function(err, b, c) {
                    console.log('An error occurred.');
                    console.error(err);
                    console.error(c);
                })
                .on('end', function() {
                    console.log('Processing finished !');
                })
                .pipe(response, { end: true });

            // let movie = await MovieService.findOne({ name });
            // if (!movie) {
            //     response.status(404).send(`No movie found with name and year ${name} (${year}).`)
            //     return;
            // }

            // const path = `c:\\users\\chris\\Code\\video-streamer-server\\${name}.mkv`,
            //     stat = fs.statSync(path),
            //     fileSize = stat.size,
            //     range = request.headers.range;

            // if (range) {
            //     const parts = range.replace(/bytes=/, '').split('-'),
            //         start = parseInt(parts[0], 10),
            //         end = parts[1] ? parseInt(parts[1], 10) : fileSize-1,
            //         chunksize = end - start + 1,
            //         file = fs.createReadStream(path, {start, end});

            //     response.writeHead(206, {
            //         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            //         'Accept-Ranges': 'bytes',
            //         'Content-Length': chunksize,
            //         'Content-Type': 'video/mp4',
            //     });

            //     file.pipe(response);
            // } else {
            //     response.writeHead(200, {
            //         'Content-Length': fileSize,
            //         'Content-Type': 'video/mp4',
            //     });

            //     fs.createReadStream(path).pipe(response)
            // }

        } catch (e) {
            console.log(`[server] Request failed: GET /play-movie/${year}/${name}. ${e.toString()}`);
            response.status(500).send(e);
        }
    }
}