import * as path from 'path';
import * as fs from 'fs';
import * as recursive from 'recursive-readdir';

import { File } from '@root/models';

export default class Files {
    static async find(directory: string, extensions: string[]) : Promise<File[]> {
        return new Promise<File[]>((resolve, reject) => {
            recursive(directory, (error: Error, files: string[]) => {
                if (error)
                    return reject(error);
    
                files = files
                    .filter((file: string) => extensions.indexOf(path.extname(file).substring(1)) > -1)
                    .filter((file: string) => !fs.existsSync(path.dirname(file) + '/converted'));

                resolve(files.map((file: string) => new File(file)));
            });
        });
    }
}