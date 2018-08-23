import * as express from 'express';

import Movies from './movies';

class Server {
    initialize(port: number) {
        const app = express();

        Movies.initialize(app);

        app.listen(port, () => console.log(`[server] Listening on port ${port}...`));
    }
}

export default new Server();

