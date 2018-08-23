import { Async } from '@root/base/async';
import MovieService from '@root/data/movie';
import Metadata from '@root/indexer/metadata';

import { File, Media, Movie } from '@root/models';

import { Files } from './files';

export class MovieIndexer extends Async {
    paths: string[];
    fileManager: Files;
    
    constructor(paths: string[]) {
        super();

        this.paths = paths;
        this.fileManager = new Files();

        Metadata.receive<Movie>(this.onMessage.bind(this));
    }

    async run() : Promise<number> {
        // TODO: retrieve media library locations from database.
        const extensions = ['mkv', 'mp4', 'wmv', 'avi'];

        let files = [].concat.apply([], await Promise.all(this.paths.map(async library => {
            return await this.fileManager.find(library, extensions);
        })));

        await MovieService.load(files.map(file => Media.fromFile(file)));

        files.forEach((file: File) => Metadata.queue(file));

        return files.length;
    }

    private async onMessage(model: Movie) {
        await MovieService.
    }
}