import { Base } from './base';
import { Media } from '@root/models';

class MediaService extends Base<Media> {
    constructor() {
        super('media');
    }

    get() : Promise<Media[]> {
        return Promise.resolve([]);
    }

    async load(media: Media[]) {
        let collection = await this.connect();
        return new Promise((resolve, reject) => {
            collection.bulkWrite(media.map(m => {
                return {
                    updateOne: {
                        filter: { path: m.path },
                        update: { $set: { id: m.id, path: m.path } },
                        upsert: true
                    }
                }
            }), (error, result) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}

export default new MediaService();