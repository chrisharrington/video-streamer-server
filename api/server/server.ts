import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import Config from '@root/config';

import Chat from './chat';
import Webhook from './webhook';
import Movies from './api/movies';
import Shows from './api/shows';
import Devices from './api/devices';

export default class Server {
    private port: number;

    constructor(port: number) {
        this.port = port;
    }

    run() {
        const app = express();
        app.use(cors());
        app.use(this.authorize);
        app.use(bodyParser.json());
        
        app.listen(this.port, () => console.log(`[api] Listening on port ${this.port}...`));

        new Chat().initialize(app);
        new Webhook().initialize(app);

        const prefix = '/data';
        new Movies().initialize(app, prefix);
        new Shows().initialize(app, prefix);
        new Devices().initialize(app, prefix);
    }

    private authorize(request: express.Request, response: express.Response, next: () => void) {
        const auth = request.headers['authorization'];
        if (auth === Config.serverApiKey || !auth)
            next();
        else
            response.sendStatus(403);
    }
}