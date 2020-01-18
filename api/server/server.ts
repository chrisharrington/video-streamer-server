import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import Movies from './movies';
import Shows from './shows';
import Devices from './devices';

export default class Server {
    port: number;

    constructor(port: number) {
        this.port = port;
    }

    run() {
        const app = express();
        app.use(cors());
        app.use(bodyParser.json());

        new Movies().initialize(app);
        new Shows().initialize(app);
        new Devices().initialize(app);

        app.listen(this.port, () => console.log(`[api] Listening on port ${this.port}...`));
    }
}

