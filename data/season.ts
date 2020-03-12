import { Season, Episode } from '@root/models';

import { Base } from './base';

class SeasonService extends Base<Season> {
    constructor() {
        super('seasons');
    }

    async get() : Promise<Season[]> {
        let collection = await this.connect();
        return new Promise<Season[]>((resolve, reject) => {
            collection.find({}).sort({ number: 1 }).toArray((error, movies) => {
                if (error) reject(error);
                else resolve(movies);
            });
        });
    }

    async getSeasonsWithNoEpisodes() : Promise<Season[]> {
        let seasonCollection = await this.connect(),
            episodeCollection = await this.connect('episodes');

        return new Promise<Season[]>((resolve, reject) => {
            episodeCollection.find({}).toArray((_, episodes) => {
                seasonCollection.find({}).toArray(async (_, seasons) => {
                    const episodeCounts = {};
                    episodes.forEach((episode: Episode) => {
                        const key = `${episode.show}/${episode.season}`;
                        if (!episodeCounts[key])
                            episodeCounts[key] = 0;
                        episodeCounts[key]++;
                    });

                    const seasonDictionary = {};
                    seasons.forEach((season: Season) => {
                        const key = `${season.show}/${season.number}`;
                        seasonDictionary[key] = season;
                    });

                    resolve(seasons.filter((season: Season) => !episodeCounts[`${season.show}/${season.number}`]));
                });
            });
        });
    }
}

export default new SeasonService();