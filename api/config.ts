class Config {
    movieDatabaseApiKey: string = 'c26c67ed161834067f4d91430df1024e';
    movieDatabaseApiUrl: string = 'https://api.themoviedb.org/3/';
    databaseConnectionString: string = 'mongodb://localhost:27017';
    queueConnectionString: string = 'amqp://localhost:5672';

    serverPort: number = 8101;
}

export default new Config();