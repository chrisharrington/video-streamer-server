import * as fetch from 'node-fetch';
import * as fs from 'fs';

import Config from '@root/config';

const unique = require('unique-string');

export default class Downloader {
    public static async image(url: string) : Promise<string> {
        const response = await fetch(url),
            name = `${unique()}.jpg`,
            file = fs.createWriteStream(`${Config.imagePath}${name}`);

        return new Promise((resolve, reject) => {
            response.body.pipe(file);
            response.body.on('error', reject);
            file.on('finish', () => resolve(`${Config.imageDomain}${name}`));
        });
    }
}