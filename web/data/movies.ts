import BaseService from './base';

import Config from '@web/config';

import { Movie, Playable } from '@web/models';

export default class MovieService extends BaseService {
    static async getAll() : Promise<Movie[]> {
        const data = await this.get(`${Config.ApiUrl}/movies/all`);
        return data.map(this.build);
    }

    static async getByYearAndName(year: number, name: string) : Promise<Movie> {
        return this.build(await this.get(`${Config.ApiUrl}/movies/${year}/${name}`));
    }

    static async saveProgress(id: string, secondsFromStart: number) : Promise<void> {
        this.post(`${Config.ApiUrl}/movies/progress`, {
            id,
            secondsFromStart
        });
    }

    private static build(data: any) : Movie {
        const movie = new Movie();
        Object.keys(data).forEach(k => movie[k] = data[k]);
        return movie;
    }
}