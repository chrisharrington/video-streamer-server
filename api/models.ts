import * as path from 'path';
import { getVideoDurationInSeconds } from 'get-video-duration';

export class Id {
    _id: string;
}

export class File {
    path: string;
    name: string;

    constructor(filepath?: string) {
        this.path = filepath;
        this.name = path.basename(filepath);
    }
}

export class Media extends Id {
    path: string;
    runtime: number;
    progress: number;
}

export class Movie extends Media {
    name: string;
    poster: string;
    synopsis: string;
    year: number;

    constructor(path: string) {
        super();
        this.path = path;
        this.parse();
    }

    static async fromFile(file: File) : Promise<Movie> {
        let movie = new Movie(file.path);
        let parts = file.path.split('/');
        let descriptor = parts[parts.length-2];
        parts = descriptor.split(' ');
        movie.year = parseInt(parts[parts.length-1].replace('(', '').replace(')', ''));
        movie.name = parts.slice(0, parts.length-1).join(' ');
        movie.runtime = await getVideoDurationInSeconds(file.path);
        movie.progress = 0;
        return movie;
    }

    private parse() {
        let split = this.path.split('//'),
            last = split[split.length-1];

        split = last.split(' ');
        this.name = split.slice(0, split.length - 1).join(' '),
        this.year = parseInt(split[split.length - 1].replace('(', '').replace(')', ''))
    }
}

export class Show extends Id {
    externalId: string;
    name: string;
    poster: string;
    synopsis: string;
    year: number;
}

export class Season extends Id {
    externalId: string;
    number: number;
    poster: string;
    synopsis: string;
    year: number;
    show: string;
}

export class Episode extends Media {
    externalId: string;
    number: number;
    season: number;
    show: string;
    path: string;
    synopsis: string;
    airDate: Date;
    name: string;

    static async fromFile(file: File) : Promise<Episode> {
        const model = new Episode();
        model.number = parseInt(file.path.substr(file.path.lastIndexOf('/')+1, 6).substr(4, 6));
        return model;
    }
}

// bravo/home/media/tv/The West Wing/Season 4/S04E01 - 20 Hours in America (1) WEBDL-1080p.mkv