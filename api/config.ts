class Config {
    metadataApiKey: string = 'c26c67ed161834067f4d91430df1024e';
    metadataApiUrl: string = 'https://api.themoviedb.org/3/';
    databaseConnectionString: string = 'mongodb://data:27017';
    queueConnectionString: string = 'amqp://queue:5672';

    serverPort: number = 8101;
}

export default new Config();