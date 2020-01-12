import MovieService from '@web/data/movies';
import EpisodeService from '@web/data/episodes';

import Config from './config';

export enum Status {
    Missing = 'missing',
    Queued = 'queued',
    Fulfilled = 'fulfilled'
}

export interface Playable {
    _id: string;
    runtime: number;
    progress: number;
    subtitlesStatus: Status;

    video() : string;
    subtitle() : string;
    saveProgress(time: number) : Promise<void>;
}

export interface Media {
    name: string;
    poster: string;
    synopsis: string;
}

export class Movie implements Media, Playable {
    _id: string;
    name: string;
    poster: string;
    synopsis: string;
    runtime: number;
    progress: number;
    year: number;
    subtitlesStatus: Status;

    video() : string {
        return `${Config.ApiUrl}/movies/play/${this.year}/${this.name}`;
    }

    subtitle() : string {
        return `${Config.ApiUrl}/movies/subtitle/${this.year}/${this.name}`;
    }

    async saveProgress(time: number) : Promise<void> {
        await MovieService.saveProgress(this._id, time);
    }
}

export class Show implements Media {
    name: string;
    poster: string;
    backdrop: string;
    synopsis: string;
    year: string;
}

export class Season {
    number: number;
    poster: string;
    synopsis: string;
    episodeCount: number;
}

export class Episode implements Playable {
    _id: string;
    runtime: number;
    progress: number;
    name: string;
    show: string;
    season: number;
    number: number;
    synopsis: string;
    subtitlesStatus: Status;

    video() : string {
        return `${Config.ApiUrl}/shows/play/${this.show}/${this.season}/${this.number}`;
    }

    subtitle() : string {
        return `${Config.ApiUrl}/shows/subtitle/${this._id}`;
    }

    async saveProgress(time: number) : Promise<void> {
        await EpisodeService.saveProgress(this._id, time);
    }
}