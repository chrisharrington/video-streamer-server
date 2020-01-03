import { Season } from '@root/models';

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
}

export default new SeasonService();