import * as path from 'path';
import * as recursive from 'recursive-readdir';

import { File } from '@root/models';

export default class Files {
    filter: (file: string) => boolean;

    constructor(filter: (file: string) => boolean) {
        this.filter = filter;
    }

    async find(directory: string) : Promise<File[]> {
        return new Promise<File[]>((resolve, reject) => {
            recursive(directory, (error: Error, files: string[]) => {
                if (error)
                    return reject(error);
    
                if (this.filter)
                    files = files.filter(this.filter);
                resolve(files.map((file: string) => new File(file)));
            });
        });
    }
}