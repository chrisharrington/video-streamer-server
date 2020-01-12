import BaseService from './base';

import Config from '@web/config';

import { Episode } from '@web/models';

export default class EpisodeService extends BaseService {
    static async getByShowAndSeason(show: string, season: number) : Promise<Episode[]> {
        const data = await this.get(`${Config.ApiUrl}/shows/${show}/${season}/episodes`);
        return data.map(this.build);
    }

    static async getByShowSeasonAndEpisode(show: string, season: number, episode: number) : Promise<Episode> {
        return this.build(await this.get(`${Config.ApiUrl}/shows/${show}/${season}/${episode}`));
    }

    static async saveProgress(id: string, secondsFromStart: number) : Promise<void> {
        this.post(`${Config.ApiUrl}/shows/progress`, {
            id,
            secondsFromStart
        });
    }

    private static build(data: any) : Episode {
        const show = new Episode();
        Object.keys(data).forEach(k => show[k] = data[k]);
        return show;
    }
}