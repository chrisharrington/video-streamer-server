import BaseService from './base';

import Config from '@web/config';

import { Season, Episode } from '@web/models';

interface SeasonData {
    season: Season;
    episodes: Episode[];
}

export default class SeasonService extends BaseService {
    static async getByShowName(show: string) : Promise<Season[]> {
        const data = await this.get(`${Config.ApiUrl}/shows/${show}/seasons`);
        return data.map(this.build);
    }

    static async getByShowNameAndNumber(show: string, number: number) : Promise<SeasonData> {
        return await this.get(`${Config.ApiUrl}/shows/${show}/${number}`);
    }

    private static build(data: any) : Season {
        const show = new Season();
        Object.keys(data).forEach(k => show[k] = data[k]);
        return show;
    }
}