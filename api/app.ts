import 'module-alias/register';

import Config from '@root/config';
import Server from '@root/server/server';
import { MovieIndexer } from '@root/indexer/movie';

// Server:
// initialize web server
//  GET /movies
//  GET /movies/{id}
//  GET /play-movie/{id}

// Indexer:
// find movie files
// foreach movie in movies
//  grab metadata
//  save to database

Server.initialize(Config.serverPort);

const mediaLibrary: string = '\\\\bravo\\Media\\Movies';
let indexer = new MovieIndexer([mediaLibrary]);
indexer.run().catch(e => {
    console.error(e);
});



// import * as fs from 'fs';
// import * as express from 'express';

// const app = express();

// app.get('/video', function(req, res) {
//     const path = '\\\\bravo\\media\\Kid\'s Movies\\Ballerina (2016)\\Ballerina (2016).mkv'
//     const stat = fs.statSync(path)
//     const fileSize = stat.size
//     const range = req.headers.range as string;
//     if (range) {
//         const parts = range.replace(/bytes=/, "").split("-")
//         const start = parseInt(parts[0], 10)
//         const end = parts[1] 
//             ? parseInt(parts[1], 10)
//             : fileSize-1
//         const chunksize = (end-start)+1
//         const file = fs.createReadStream(path, {start, end})
//         const head = {
//             'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//             'Accept-Ranges': 'bytes',
//             'Content-Length': chunksize,
//             'Content-Type': 'video/mp4',
//         }
//         res.writeHead(206, head);
//         file.pipe(res);
//     } else {
//         const head = {
//             'Content-Length': fileSize,
//             'Content-Type': 'video/mp4',
//         }
//         res.writeHead(200, head)
//         fs.createReadStream(path).pipe(res)
//     }
// });

// app.listen(9999, () => console.log('Listening on port 9999...'));