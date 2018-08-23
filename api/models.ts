import * as uuid from 'uuid/v1';

export class Id {
    id: string;
}

export class File {
    path: string;

    constructor(path?: string) {
        this.path = path;
    }
}

export class Media extends Id {
    id: string;
    path: string;
    name: string;
    poster: string;
    synopsis: string;
    year: number;

    static fromFile(file: File) : Media {
        let media = new Media();
        media.id = uuid();
        media.path = file.path;
        return media;
    }
}

export class Movie extends Media {}