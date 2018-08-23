import * as fs from 'fs';
import * as path from 'path';
import * as recursive from 'recursive-readdir';

import { Async } from '@root/base/async';

import { File } from '@root/models';

export class Files extends Async {
    async find(dir: string, extensions: string[]) : Promise<File[]> {
        let p = this.promise<File[]>();

        recursive(dir, (error, files) => {
            if (error)
                return p.reject(error);

            files = files.filter(file => extensions.indexOf(path.extname(file).substring(1)) > -1);
            p.resolve(files.map(f => new File(f)));
        });

        return p.promise;
    }
}