import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import Chat from './chat';
import Movies from './movies';
import Shows from './shows';
import Devices from './devices';

export default class Server {
    private port: number;

    constructor(port: number) {
        this.port = port;
    }

    run() {
        const app = express();
        app.use(cors());
        app.use(bodyParser.json());
        
        app.listen(this.port, () => console.log(`[api] Listening on port ${this.port}...`));

        new Chat().initialize(app);

        const prefix = '/data';
        new Movies().initialize(app, prefix);
        new Shows().initialize(app, prefix);
        new Devices().initialize(app, prefix);
    }
}