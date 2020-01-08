import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const FfmpegCommand = require('fluent-ffmpeg');

// ffmpeg \
//     -hwaccel nvdec \
//     -i "/media/movies/2 Fast 2 Furious (2003)/2 Fast 2 Furious (2003).mp4" \
//     -vsync 0 \
//     -acodec aac \
//     -c:v h264_nvenc \
//     -b:v 5M \
//     output.mp4

class Progress {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: any;
    percent: any;

    static toString(progress: Progress, file: string) : string {
        return progress.percent < 0 ? '' : `[converter] ${path.basename(file)}: ${progress.percent.toFixed(2)}% / ${progress.currentFps} FPS / ${progress.timemark}`;
    }
}

export default class Converter {
    private command: any;
    private file: string;

    async convert(file: string, output: string) : Promise<void> {
        this.file = file;

        return new Promise((resolve: () => void, reject: (error: Error) => void) => {
            try {
                const command = this.command = new FfmpegCommand(file)
                    .inputOptions(
                        '-hwaccel', 'nvdec'
                    )
                    .output(path.dirname(file) + '/converting.mp4')
                    .outputOptions(
                        '-vsync', '0',
                        '-c:v', 'h264_nvenc',
                        '-acodec', 'aac',
                        '-b:v', '5M',
                    );

                const log = fs.createWriteStream(path.dirname(file) + '/log');
                command.on('stderr', (data: string) => log.write(data));
                command.on('start', () => console.log(`[converter] Beginning conversion: ${file}`));
                command.on('progress', (progress: Progress) => this.onProgress(progress))
                command.on('error', (error: string) => this.onError(error, reject));
                command.on('end', () => this.onEnd(file, output, resolve));
                command.run();
            } catch (e) {
                this.deleteFiles(path.dirname(this.file) + '/converting.mp4');
                reject(e);
            }
        });
    }

    abort() {
        try { this.command.ffmpegProc.stdin.write('q'); } catch (e) {}

        const directory = path.dirname(this.file);
        this.deleteFiles(directory + '/log', directory + '/converting.mp4');
    }

    private onError(error: string, reject: (error: Error) => void) {
        error = error.toString();
        if (error.indexOf('ffmpeg exited with code 255') > -1)
            return;

        reject(new Error(error));
    }

    private onProgress(progress: Progress) {
        console.log(Progress.toString(progress, this.file));
    }

    private onEnd(file: string, output: string, resolve: () => void) {
        const directory = path.dirname(file);

        fs.openSync(directory + '/converted', 'w');
        this.deleteFiles(file, `${directory}/log`);
        fs.renameSync(directory + '/converting.mp4', output);
        console.log(`[converter] Finished processing ${file}.`);
        resolve();
    }

    private deleteFiles(...files: string[]) {
        files.forEach((file: string) => {
            if (fs.existsSync(file))
                fs.unlinkSync(file);
        })
    }
}