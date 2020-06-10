import * as recursive from 'recursive-readdir';

import { File } from '@lib/models';

export default class Files {
    private filter: (file: File) => boolean;

    constructor(filter: (file: File) => boolean) {
        this.filter = filter;
    }

    async find(directory: string) : Promise<File[]> {
        return new Promise<File[]>((resolve, reject) => {
            recursive(directory, (error: Error, files: string[]) => {
                if (error)
                    return reject(error);
    
                if (this.filter)
                    files = files.filter((file: string) => this.filter(new File(file)));
                resolve(files.map((file: string) => new File(file)));
            });
        });
    }
}