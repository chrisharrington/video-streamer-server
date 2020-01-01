import { Show } from '@root/models';

import { Base } from './base';

class ShowService extends Base<Show> {
    constructor() {
        super('shows');
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
}

export default new ShowService();