import * as fs from 'fs';
import * as ffprobe from 'ffprobe';
import * as path from 'path';

import { File, FileState, StreamType } from '@root/models';

const FfmpegCommand = require('fluent-ffmpeg');

// ffmpeg \
//     -hwaccel nvdec \
//     -i "/media/movies/2 Fast 2 Furious (2003)/2 Fast 2 Furious (2003).mp4" \
//     -vsync 0 \
//     -acodec libmp3lame \
//     -c:v h264_nvenc \
//     -b:v 5M \
//     output.mp4

export default class Encoder {
    private command: any;
    private file: File;

    constructor() {
        process.on('SIGINT', () => this.abort());
    }

    async run(file: File) : Promise<void> {
        return new Promise(async (resolve: () => void, reject: (error: Error) => void) => {
            try {
                const command = new FfmpegCommand(file.path)
                    .inputOptions(
                        '-hwaccel', 'nvdec'
                    )
                    .output(File.getPathForState(file.output, FileState.Converting))
                    .outputOptions(
                        '-vsync', '0',
                        '-c:v', 'h264_nvenc',
                        '-acodec', 'libmp3lame',
                        '-b:v', '5M',
                        '-sn',
                        '-map', '0:' + (await this.getStreamIndex(file, stream => stream.codec_type === StreamType.Video)),
                        '-map', '0:' + (await this.getStreamIndex(file, stream => stream.codec_type === StreamType.Audio && stream.tags.language === 'eng'))
                    );

                // const command = new FfmpegCommand(file.path)
                //     .output(`${path.dirname(file.path)}/${path.parse(file.path).name.split('.')[0]}.blah.mp4`)
                //     .outputOptions(
                //         '-c', 'copy',
                //         '-sn',
                //         '-acodec', 'libmp3lame'
                //     );

                command.on('start', () => console.log(`[converter] Converting: ${file.path}`));
                command.on('error', (error: string) => this.onError(error, reject));
                command.on('end', () => this.onEnd(file, resolve));
                command.run();
            } catch (e) {
                this.deleteFiles(File.getPathForState(file.output, FileState.Converting))
                reject(e);
            }
        });
    }

    private abort() {
        try { this.command.ffmpegProc.stdin.write('q'); } catch (e) {}
        this.deleteFiles(File.getPathForState(this.file.output, FileState.Converting));
    }

    private onError(error: string, reject: (error: Error) => void) {
        error = error.toString();
        if (error.indexOf('ffmpeg exited with code 255') > -1)
            return;

        reject(new Error(error));
    }

    private onEnd(file: File, resolve: () => void) {
        // this.deleteFiles(file.path);
        // fs.renameSync(File.getPathForState(file.output, FileState.Converting), File.getPathForState(file.output, FileState.Converted));
        console.log(`[converter] Finished processing ${file.path}.`);
        resolve();
    }

    private deleteFiles(...files: string[]) {
        files.forEach((file: string) => {
            if (fs.existsSync(file))
                fs.unlinkSync(file);
        })
    }

    private async getStreamIndex(file: File, filter: (stream: any) => boolean) : Promise<number> {
        const result = await ffprobe(file.path, { path: 'ffprobe' });
        return result.streams.findIndex(filter);
    }
}