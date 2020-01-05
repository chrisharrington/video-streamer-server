import * as fs from 'fs';

const FfmpegCommand = require('fluent-ffmpeg');

interface Progress {
    percentComplete: number;
    fps: number;
    avgFps: number;
    eta: string;
    task: string;
}

export default class Converter {
    static async convert(file: string) : Promise<void> {
        if (!fs.existsSync(file)) {
            console.error(`[converter] File ${file} doesn't exist.`);
            return;
        }

        // ffmpeg -vsync 0 -hwaccel cuvid -c:v h264_cuvid -i "/home/chrisharrington/media/movies/Chef (2014)/Chef (2014) Bluray-1080p.mkv" -acodec aac -c:v h264_nvenc -b:v 5M output.mp4

        console.log(`[converter] Beginning conversion: ${file}`);

        new FfmpegCommand(file)
            .audioCodec('')

        // const conversion = hbjs.spawn({
        //     input: file,
        //     output: `${file.split('/').slice(-2, -1)}`,
        //     preset: 'Chromecast 1080p30 Surround'
        // });
        
        // conversion.on('error', error => console.error(error));
        // conversion.on('progress', (progress: Progress) => this.onProgress(progress));
        // conversion.on('end', () => this.onEnd(file));
    }

    static onProgress(progress: Progress) {
        const out = process.stdout;
        out.clearLine(0);
        out.cursorTo(0);
        out.write(`[converter] ${progress.task} / ${progress.percentComplete.toFixed(2)}% / ${progress.fps.toFixed(2)} FPS / ${progress.avgFps.toFixed(2)} FPS / ${progress.eta}`);
    }

    static onEnd(file: string) {
        process.stdout.write('\n');
        fs.unlinkSync(file);
        console.log(`[converter] Finished encoding ${file}.`);
    }
}