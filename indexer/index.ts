import { Async } from '@root/base/async';

import { Files, IFile } from './files';

export class Indexer extends Async {
    paths: string[];
    fileManager: Files;
    
    constructor(paths: string[]) {
        super();

        this.paths = paths;
        this.fileManager = new Files();
    }

    async run() : Promise<number> {
        // TODO: retrieve media library locations from database.
        const mediaLibraries = ['\\\\bravo\\Media'],
            extensions = ['mkv', 'mp4', 'wmv', 'avi'];

        let files = [].concat.apply([], await Promise.all(mediaLibraries.map(async library => {
            return await this.fileManager.find(library, extensions);
        })));

        return files.length;
    }
}