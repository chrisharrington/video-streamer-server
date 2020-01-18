export default class Config {
    static enabled = {
        api: true,
        converter: false,
        indexer: true,
        metadata: true,
        subtitler: false
    };

    static metadataApiKey: string = 'c26c67ed161834067f4d91430df1024e';
    static metadataApiUrl: string = 'https://api.themoviedb.org/3/';
    static databaseConnectionString: string = 'mongodb://data:27017';
    static queueConnectionString: string = 'amqp://queue:5672';
    static subtitlesUserAgent: string = 'Showveo';

    static serverPort: number = 8101;

    static movieLibraries: string[] = ['/media/movies', '/media/kids-movies'];
    static tvLibraries: string[] = ['/media/tv', '/media/kids-tv'];
}