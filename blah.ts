import * as ffprobe from 'ffprobe';
import * as path from 'path';
import * as fs from 'fs';
import * as srt2vtt from 'srt-to-vtt';

const FfmpegCommand = require('fluent-ffmpeg');

(async () => {
    const file = '/media/tv/Rick and Morty/Season 2/S02E02.queued.mp4';
    const output = '/media/tv/Rick and Morty/Season 2/S02E02.vtt';
    const temp = '/media/tv/Rick and Morty/Season 2/S02E02.queued.temp.srt';

    const srt = fs.readFileSync(temp);
    srt2vtt(srt, (error, vtt) => {
        if (error) throw new Error(error);
        fs.writeFileSync(output, vtt);
        fs.unlinkSync(temp);
        console.log(`[converter] Subtitles extracted: ${file}`);
    });

    //await blah(file, output);

    async function blah(file: string, output: string) : Promise<void> {
        console.log(`[converter] Extracting subtitle: ${file}`)

        const result: any = await ffprobe(file, { path: 'ffprobe' }),
            index = result.streams.findIndex(stream => stream.codec_name === 'subrip' && stream.tags.language === 'eng'),
            temp = `${path.dirname(output)}/${path.parse(file).name}.temp.srt`;

        if (index === -1) {
            // queue remote subtitles
        }

        return new Promise((resolve, reject) => {
            const command = new FfmpegCommand(file)
                .inputOptions(
                    '-txt_format', 'text'
                )
                .output(temp)
                .outputOptions(
                    '-map', '0:' + index
                );

            command.on('start', (command: string) => console.log(command));
            command.on('error', (error: string) => reject(new Error(error)));
            command.on('end', () => {
                const srt = fs.readFileSync(temp);
                srt2vtt(srt, (error, vtt) => {
                    if (error) throw new Error(error);
                    fs.writeFileSync(output, vtt);
                    fs.unlinkSync(temp);
                    console.log(`[converter] Subtitles extracted: ${file}`);
                    resolve();
                });
            });
            command.run();
        });
    }
})();

// ffmpeg \
//     -txt_format text \
//     -i "/media/tv/Rick and Morty/Season 2/S02E02.queued.mp4" \
//     -map 0:s:4 \
//     out.srt