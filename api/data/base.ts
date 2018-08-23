import * as mongo from 'mongodb';

import Config from '@root/config';
import { Id } from '@root/models';

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

    public async find(query: any) : Promise<TModel | null> {
        let collection = await this.connect();

        return new Promise<TModel | null>((resolve, reject) => {
            collection.findOne(query, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    }

    public async insertOne(model: TModel) : Promise<void> {
        return await this.insertMany([model]);
    }

    public async updateOne(model: Id) : Promise<void> {
        let collection = await this.connect();

        return new Promise<void>((resolve, reject) => {
            collection.updateOne({
                id: model.id
            }, {
                
            })
        });
    }

    public async insertMany(models: TModel[]) : Promise<void> {
        let collection = await this.connect();

        return new Promise<void>((resolve, reject) => {
            collection.insertMany(models, (error, result) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }
}