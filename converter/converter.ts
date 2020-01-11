import * as fs from 'fs';

import { Message } from '@root/models';
import Queue from '@root/queue';

const FfmpegCommand = require('fluent-ffmpeg');

// ffmpeg \
//     -hwaccel nvdec \
//     -i "/media/movies/2 Fast 2 Furious (2003)/2 Fast 2 Furious (2003).mp4" \
//     -vsync 0 \
//     -acodec aac \
//     -c:v h264_nvenc \
//     -b:v 5M \
//     output.mp4

export class Conversion {
    path: string;
    output: string;

    constructor(path: string, output: string) {
        this.path = path;
        this.output = output;
    }
}

class Progress {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: any;
    percent: any;

    static toString(progress: Progress, file: string) : string {
        return progress.percent < 0 ? '' : `[converter] ${file}: ${progress.percent.toFixed(2)}% / ${progress.currentFps} FPS / ${progress.timemark}`;
    }
}

export class Converter {
    private static command: any;
    private static file: string;
    private static output: string;

    static initialize(queue: Queue) {
        queue.receive(async (message: Message) => {
            const file = message.payload as Conversion;
            try {
                console.log(`[converter] Received ${file.path} for conversion.`);
                await this.convert(file.path, file.output);
            } catch (e) {
                console.log(`[converter] Failed to convert ${file.path}.`);
                console.error(e);

                queue.sendError(new Message(file, null, e));
            }
        });

        process.on('SIGINT', () => this.abort());
    }

    private static async convert(file: string, output: string) : Promise<void> {
        this.file = file;
        this.output = output;

        return new Promise((resolve: () => void, reject: (error: Error) => void) => {
            try {
                const command = this.command = new FfmpegCommand(this.file)
                    .inputOptions(
                        '-hwaccel', 'nvdec'
                    )
                    .output(this.changeFileExtension(this.output, 'converting.mp4'))
                    .outputOptions(
                        '-vsync', '0',
                        '-c:v', 'h264_nvenc',
                        '-acodec', 'aac',
                        '-b:v', '5M'
                    );

                command.on('start', () => console.log(`[converter] Converting: ${this.file}`));
                // command.on('progress', (progress: Progress) => this.onProgress(progress))
                command.on('error', (error: string) => this.onError(error, reject));
                command.on('end', () => this.onEnd(this.file, this.output, resolve));
                command.run();
            } catch (e) {
                this.deleteFiles(this.changeFileExtension(this.output, 'converting.mp4'));
                reject(e);
            }
        });
    }

    static abort() {
        try { this.command.ffmpegProc.stdin.write('q'); } catch (e) {}
        this.deleteFiles(this.changeFileExtension(this.output, 'converting.mp4'));
    }

    private static onError(error: string, reject: (error: Error) => void) {
        error = error.toString();
        if (error.indexOf('ffmpeg exited with code 255') > -1)
            return;

        reject(new Error(error));
    }

    private static onProgress(progress: Progress) {
        console.log(Progress.toString(progress, this.file));
    }

    private static onEnd(file: string, output: string, resolve: () => void) {
        this.deleteFiles(file);
        fs.renameSync(this.changeFileExtension(output, 'converting.mp4'), this.changeFileExtension(output, 'done.mp4'));
        console.log(`[converter] Finished processing ${file}.`);
        resolve();
    }

    private static deleteFiles(...files: string[]) {
        files.forEach((file: string) => {
            if (fs.existsSync(file))
                fs.unlinkSync(file);
        })
    }

    private static changeFileExtension(file: string, extension: string) : string {
        return file.substr(0, file.lastIndexOf('.')+1) + extension;
    }
}