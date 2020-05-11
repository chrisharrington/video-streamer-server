import * as fetch from 'node-fetch';
import * as fs from 'fs';
import * as sharp from 'sharp';

import Config from '@root/config';

const unique = require('unique-string');

const WIDTH = 500;

export default class Downloader {
    public static async image(url: string) : Promise<string> {
        const response = await fetch(url),
            name = `${unique()}.jpg`,
            file = fs.createWriteStream(`${Config.imagePath}${name}`),
            converter = sharp()
                .resize(WIDTH, Math.round(WIDTH / 1.7778))
                .webp();

        return new Promise((resolve, reject) => {
            response.body
                .pipe(converter)
                .pipe(file);

            response.body.on('error', reject);
            file.on('finish', () => resolve(`${Config.imageDomain}${name}`));
        });
    }
}