import { Base } from './base';
import { Movie } from '@root/models';

class MediaService extends Base<Movie> {
    constructor() {
        super('movies');
    }

    get() : Promise<Movie[]> {
        return Promise.resolve([]);
    }

    async load(movies: Movie[]) : Promise<Movie[]> {
        let collection = await this.connect();
        return new Promise<Movie[]>((resolve, reject) => {
            collection.bulkWrite(movies.map(m => {
                return {
                    updateOne: {
                        filter: { path: m.path },
                        update: { $set: m },
                        upsert: true
                    }
                }
            }), (error, result) => {
                if (error) return reject(error);

                let keys = Object.keys(result.upsertedIds).map(key => result.upsertedIds[key]);
                collection.find({
                    '_id': {
                        $in: Object.keys(result.upsertedIds).map(key => result.upsertedIds[key])
                    }
                }).toArray((e, docs) => {
                    if (e) reject(e);
                    else resolve(docs as Movie[]);
                });
            });
        });
    }
}

export default new MediaService();