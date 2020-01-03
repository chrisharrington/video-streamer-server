import * as fs from 'fs';
import { Request, Response } from 'express';

export default class Base {
    protected stream(request: Request, response: Response, path: string) {
        const stat = fs.statSync(path),
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
            fs.createReadStream(path, { start, end }).pipe(response);
        } else {
            response.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/webm',
            });
            fs.createReadStream(path).pipe(response);
        }
    }
}