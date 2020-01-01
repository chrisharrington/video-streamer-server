import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import Movies from './movies';

export default class Server {
    port: number;

    constructor(port: number) {
        this.port = port;
    }

    run() {
        const app = express();
        app.use(cors());
        app.use(bodyParser.json());

        Movies.initialize(app);

        app.listen(this.port, () => console.log(`[server] Listening on port ${this.port}...`));
    }
}

