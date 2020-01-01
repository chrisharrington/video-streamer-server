import * as path from 'path';
import * as recursive from 'recursive-readdir';

import { File } from '@root/models';

export class Files {
    async find(dir: string, extensions: string[]) : Promise<File[]> {
        return new Promise<File[]>((resolve, reject) => {
            recursive(dir, (error, files) => {
                if (error)
                    return reject(error);
    
                files = files.filter(file => extensions.indexOf(path.extname(file).substring(1)) > -1);
                resolve(files.map(f => new File(f)));
            });
        });
    }
}