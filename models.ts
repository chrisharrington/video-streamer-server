import * as path from 'path';

import Config from '@root/config';

export class Id {
    _id: string;
}

export enum FileState {
    Valid = 'valid',
    Unprocessed = 'unprocessed',
    Queued = 'queued',
    Converting = 'converting',
    Converted = 'done'
}

export enum MessageType {
    Movie = 'movie',
    Show = 'show',
    Season = 'season',
    Episode = 'episode',
    Other = 'other'
}

export enum Status {
    Unprocessed = 'unprocessed',
    Queued = 'queued',
    Processed = 'processed'
}

export enum StreamType {
    Video = 'video',
    Audio = 'audio',
    Subtitle = 'subtitle'
}

export class File {
    path: string;
    output: string;
    extensions: string[];

    constructor(path?: string, output?: string) {
        this.path = path;
        this.output = output || path;
        this.extensions = ['mkv', 'mp4', 'avi', 'wmv', 'm4a', 'webm', 'mpg', 'mov', 'mp2', 'mpeg', 'mp3', 'mpv', 'ogg', 'm4p', 'qt', 'flv', 'swf'];
    }

    isVideoFile() {
        return this.extensions.some((extension: string) => this.path.endsWith(extension));
    }

    is(state: FileState) {
        const path = this.path;
        switch (state) {
            case FileState.Valid:
                return this.extensions.some((extension: string) => this.path.endsWith(extension));
            case FileState.Unprocessed:
                return !path.endsWith(`.${FileState.Converting}.mp4`) &&
                    !path.endsWith(`.${FileState.Queued}.mp4`) &&
                    !path.endsWith(`.${FileState.Converted}.mp4`);
            default:
                return path.endsWith(`${state}.mp4`);
        }
    }

    static isEpisode(filepath: string) {
        return /^S?0*(\d+)?[xE]0*(\d+)/i.test(path.parse(filepath).name.substr(0, 6));
    }

    static getPathForState(filepath: string, state: FileState) {
        if (state === FileState.Unprocessed || state === FileState.Valid)
            throw new Error(`Can't rename file to this state: ${state}, ${filepath}`);

        return this.isEpisode(filepath) ?
            `${path.dirname(filepath)}/${path.parse(filepath).name.substr(0, 6)}.${state}.mp4` :
            `${path.dirname(filepath)}/${path.parse(filepath).name}.${state}.mp4`;
    }

    static getName(filepath: string) {
        return this.isEpisode(filepath) ?
            path.parse(filepath).name.substr(0, 6) :
            filepath.split('/').slice(-2)[0];
    }
}

export class Media extends Id {
    path: string;
    runtime: number;
    progress: number;
    subtitles: string | null;
    subtitlesOffset: number;

    subtitlesStatus: Status;
    metadataStatus: Status;
    conversionStatus: Status;

    constructor() {
        super();

        this.metadataStatus = Status.Unprocessed;
        this.subtitlesStatus = Status.Unprocessed;
        this.subtitlesOffset = 0;
    }
}

export class Movie extends Media {
    externalId: string;
    name: string;
    poster: string;
    backdrop: string;
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
}

export class Show extends Id {
    externalId: string;
    name: string;
    poster: string;
    backdrop: string;
    synopsis: string;
    year: number;

    metadataStatus: Status;

    constructor(name?: string) {
        super();
        this.name = name;
        this.metadataStatus = Status.Unprocessed;
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

    metadataStatus: Status;

    constructor(number?: number, show?: string) {
        super();
        this.number = number;
        this.show = show;
        this.metadataStatus = Status.Unprocessed;
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

    identifier() : string {
        return this.path.substr(this.path.lastIndexOf('.')+1, 6);
    }
}

export class Message {
    type: MessageType;
    payload: any;
    error: string | null;

    constructor(payload: any, type?: MessageType, error?: Error) {
        this.type = type || MessageType.Other;
        this.payload = payload;
        this.error = error ? JSON.stringify(error) : null;
    }
}

export class Castable {
    url: string;
    name: string;
    poster: string;
    backdrop: string;

    static fromMovie(movie: Movie, url: string) : Castable {
        const castable = new Castable();
        castable.url = url;
        castable.name = movie.name;
        castable.poster = movie.poster;
        castable.backdrop = movie.backdrop;
        return castable;
    }

    static fromEpisode(episode: Episode, show: Show, url: string) : Castable {
        const castable = new Castable();
        castable.url = url;
        castable.name = episode.name;
        castable.poster = show.poster;
        castable.backdrop = show.backdrop;
        return castable;
    }
}