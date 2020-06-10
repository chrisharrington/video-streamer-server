import { Collection } from 'mongodb';

import { Show, Season } from '@lib/models';

import { Base } from './base';

class ShowService extends Base<Show> {
    constructor() {
        super('shows', { name: 'text' });
    }

    async get() : Promise<Show[]> {
        let collection = await this.connect();
        return new Promise<Show[]>((resolve, reject) => {
            collection.find({}).sort({ name: 1 }).toArray((error, movies) => {
                if (error) reject(error);
                else resolve(movies);
            });
        });
    }

    async getShowsWithNoSeasons() : Promise<Show[]> {
        let showCollection = await this.connect(),
            seasonCollection = await this.connect('seasons');

        return new Promise<Show[]>((resolve) => {
            seasonCollection.find({}).toArray((_, seasons) => {
                showCollection.find({}).toArray(async (_, shows) => {
                    const seasonCounts = {};
                    seasons.forEach((season: Season) => {
                        const key = season.show;
                        if (!seasonCounts[key])
                            seasonCounts[key] = 0;
                        seasonCounts[key]++;
                    });

                    const seasonDictionary = {};
                    shows.forEach((show: Show) => {
                        seasonDictionary[show.name] = show;
                    });

                    resolve(shows.filter((show: Show) => !seasonCounts[show.name]));
                });
            });
        });
    }
}

export default new ShowService();