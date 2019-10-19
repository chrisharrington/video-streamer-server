import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';

import MovieService from '@root/data/movie';

export default class Movies {
    app: any;

    static initialize(app) {
        app.get('/movies/all', this.getMovies.bind(this));
        app.get('/movies/strem/:year/:name', this.streamMovie.bind(this));
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

    private static async playMovie(request: express.Request, response: express.Response) {
        const path = '\\\\bravo\\home\\media\\movies\\Chef (2014)\\Chef (2014) Bluray-1080p.mkv';

        const stat = fs.statSync(path),
            fileSize = stat.size,
            range = request.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
            response.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': (end-start)+1,
                'Content-Type': 'video/mp4',
            });
            fs.createReadStream(path, {start, end}).pipe(response);
        } else {
            response.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            });
            fs.createReadStream(path).pipe(response);
        }
    }

    private static async streamMovie(request, response) {
        const name = request.params.name,
            year = request.params.year;

        response.contentType('video/mp4');

        console.log(`[server] Request received: GET /play-movie/${year}/${name}`);

        try {
            new ffmpeg({source: `c:\\users\\chris\\Code\\video-streamer-server\\big.mkv`})
                .seekInput(1000)
                .outputOptions('-movflags frag_keyframe+empty_moov')
                .withVideoBitrate(1024)
                .withVideoCodec('libx264')
                .withAudioBitrate('128k')
                .withAudioCodec('libmp3lame')
                .toFormat('mp4')
                .on('stderr', e => console.log(e))
                .on('error', function(err, b, c) {
                    console.log('An error occurred.');
                    console.error(err);
                    console.error(c);
                })
                .on('end', function() {
                    console.log('Processing finished !');
                })
                .pipe(response);
                
            // ffmpeg(`c:\\users\\chris\\Code\\video-streamer-server\\big.mkv`)
            //     .videoCodec('libx264')
            //     .audioCodec('libmp3lame')
            //     .outputOptions('-movflags frag_keyframe+empty_moov')
            //     .seekInput(1000)
            //     .format('mp4')
            //     .on('error', function(err, b, c) {
            //         console.log('An error occurred.');
            //         console.error(err);
            //         console.error(c);
            //     })
            //     .on('end', function() {
            //         console.log('Processing finished !');
            //     })
            //     .pipe(response, { end: true });

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