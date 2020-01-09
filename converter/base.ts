import * as path from 'path';

import { File } from '@root/models';

export default class Base {
    protected isFileValid(file: File) : boolean {
        return ['mkv', 'mp4', 'm4v', 'avi'].indexOf(path.extname(file.path).substring(1)) > -1 &&
            file.path.indexOf('.converting.mp4') === -1 &&
            file.path.indexOf('.done.mp4') === -1 &&
            file.path.indexOf('.queued.mp4') === -1;
    }
}