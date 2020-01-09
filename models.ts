import * as path from 'path';

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
    externalId: string;
    name: string;
    poster: string;
    synopsis: string;
    year: number;
    genres: string[];

    constructor(path: string) {
        super();
        this.path = path;
        this.parse();
    }

    private parse() {
        let split = this.path.split('//'),
            last = split[split.length-1];

        split = last.split(' ');
        this.name = split.slice(0, split.length - 1).join(' '),
        this.year = parseInt(split[split.length - 1].replace('(', '').replace(')', ''))
    }

    static isMetadataMissing(movie: Movie) {
        return !movie.externalId ||
            !movie.poster ||
            !movie.synopsis ||
            !movie.genres;
    }
}

export class Show extends Id {
    externalId: string;
    name: string;
    poster: string;
    backdrop: string;
    synopsis: string;
    year: number;

    constructor(name?: string) {
        super();
        this.name = name;
    }

    static isMetadataMissing(show: Show) : boolean {
        return !show.externalId ||
            !show.poster ||
            !show.backdrop ||
            !show.synopsis ||
            !show.year;
    }
}

export class Season extends Id {
    externalId: string;
    number: number;
    poster: string;
    synopsis: string;
    year: number;
    show: string;
    episodeCount: number;

    constructor(number?: number, show?: string) {
        super();
        this.number = number;
        this.show = show;
    }

    static isMetadataMissing(season: Season) : boolean {
        return !season.externalId ||
            !season.number ||
            !season.poster ||
            !season.synopsis ||
            !season.year ||
            !season.episodeCount;
    }
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

    static isMetadataMissing(episode: Episode) : boolean {
        return !episode.externalId ||
            !episode.synopsis ||
            !episode.airDate ||
            !episode.name;
    }
}