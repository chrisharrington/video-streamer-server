import * as mongo from 'mongodb';

import Config from '@root/config';

export class Base<TModel> {
    private connectionString: string;
    private collection: string;

    constructor(collection: string) {
        this.connectionString = Config.databaseConnectionString;
        this.collection = collection;
    }

    protected async connect() : Promise<mongo.Collection> {
        return new Promise<mongo.Collection>((resolve, reject) => {
            mongo.MongoClient.connect(this.connectionString, (error, client) => {
                if (error) reject(error);
                else resolve(client.db('video-streamer-database').collection(this.collection));
            });
        });
    }

    public async add<TModel>(model: TModel) : Promise<void> {
        let collection = await this.connect();

        return new Promise<void>((resolve, reject) => {
            collection.insert(model, (error, result) => {
                let blah = result;
                console.log(blah);
                if (error) reject(error);
                else resolve();
            });
        });
    }
}