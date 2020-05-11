import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import Config from '@root/config';

import Chat from './chat';
import Webhook from './webhook';
import Movies from './api/movies';
import Shows from './api/shows';
import Devices from './api/devices';
import Auth from './api/auth';

export default class Server {
    private port: number;

    constructor(port: number) {
        this.port = port;
    }

    run() {
        const app = express();
        app.use(cors({ origin: 'https://www.showveo.com', credentials: true }));
        app.use(this.authorize);
        app.use(bodyParser.json());
        app.use(cookieParser());
        
        app.listen(this.port, () => console.log(`[api] Listening on port ${this.port}...`));

        new Chat().initialize(app);
        new Webhook().initialize(app);

        const prefix = '/data';
        Movies.initialize(app, prefix);
        Shows.initialize(app, prefix);
        Devices.initialize(app, prefix);
        Auth.initialize(app, prefix);
    }

    private authorize(request: express.Request, response: express.Response, next: () => void) {
        const auth = request.headers['authorization'];
        if (auth === Config.serverApiKey || !auth)
            next();
        else
            response.sendStatus(403);
    }
}