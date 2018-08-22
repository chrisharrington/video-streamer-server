import * as mongo from 'mongodb';

import Config from '@root/config';

export class Base {
    private connectionString: string;

    constructor() {
        this.connectionString = Config.databaseConnectionString;
    }

    async connect() : Promise<mongo.MongoClient> {
        return new Promise<mongo.MongoClient>((resolve, reject) => {
            mongo.MongoClient.connect(this.connectionString, (error, client) => {
                if (error) reject(error);
                else resolve(client);
            });
        });
    }
}