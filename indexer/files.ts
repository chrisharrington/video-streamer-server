import * as fs from 'fs';
import * as path from 'path';
import * as recursive from 'recursive-readdir';

import { Async } from '@root/base/async';

export interface IFile {
    path: string;
}

export class Files extends Async {
    async find(dir: string, extensions: string[]) : Promise<IFile[]> {
        let p = this.promise<IFile[]>();

        recursive(dir, (error, files) => {
            if (error)
                return p.reject(error);

            //files = files.filter(file => extensions.indexOf(path.extname(file)) > -1);
            p.resolve(files);
        });

        return p.promise;
    }
}