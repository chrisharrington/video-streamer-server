import * as mongo from 'mongodb';

import Config from '@root/config';
import { Id } from '@root/models';
import { callbackify } from 'util';

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

    public async findOne(query: any) : Promise<TModel | null> {
        let result = await this.find(query);
        return result[0];
    }

    public async find(query: any) : Promise<TModel[]> {
        let collection = await this.connect();

        return new Promise<TModel[]>((resolve, reject) => {
            collection.find(query).toArray((error, result) => {
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
            let update = {};
            Object.keys(model).forEach(key => {
                if (key !== '_id')
                    update[key] = model[key];
            });
            collection.updateOne({
                _id: model._id
            }, {
                $set: update
            }, (error) => {
                if (error) reject(error);
                else resolve();
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