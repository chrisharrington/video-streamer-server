import * as path from 'path';
import * as fs from 'fs';
import * as ffprobe from 'ffprobe';
import * as srt2vtt from 'srt-to-vtt';

import { File } from '@root/models';

const FfmpegCommand = require('fluent-ffmpeg');

export default class Subtitler {
    async run(file: File) : Promise<void> {
        console.log(`[converter] Extracting subtitle: ${file.path}`)

        const result: any = await ffprobe(file.path, { path: 'ffprobe' });
        
        let index = result.streams.findIndex(stream => stream.codec_name === 'subrip' && stream.tags.language === 'eng' && stream.disposition.forced === 0);
        if (index === -1)
            index = result.streams.findIndex(stream => stream.codec_name === 'subrip' && stream.tags.language === 'eng');

        if (index === -1) {
            console.log(`[converter] No English subtitles found.`);
            return;
        }

        return new Promise((resolve, reject) => {
            new FfmpegCommand(file.path)
                .format('srt')
                .inputOptions(
                    '-txt_format', 'text'
                )
                .outputOptions(
                    '-map', '0:' + index
                )
                .on('end', () => {
                    console.log(`[converter] Subtitles extracted: ${file.path}`);
                    resolve();
                })
                .on('error', error => reject(error))
                .pipe(srt2vtt())
                .pipe(fs.createWriteStream(`${path.dirname(file.output)}/${path.parse(file.output).name}.vtt`));
        });
    }
}