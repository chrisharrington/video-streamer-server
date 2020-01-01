import * as express from 'express';
import * as fs from 'fs';

import ShowService from '@root/data/show';
import { Show } from '@root/models';

export default class Shows {
    app: express.Application;

    static initialize(app) {
        app.get('/shows/all', this.getShows.bind(this));
    }

    private static async getShows(_, response: express.Response) {
        console.log('[server] Request received: GET /shows');

        try {
            let shows = await ShowService.get();
            console.log(`[server] Request succeeded. GET /shows. Found ${shows.length} shows.`);
            response.status(200).send(shows);
        } catch (e) {
            console.error(`[server] Request failed: GET /shows. ${e.toString()}`);
            response.status(500).send(e);
        }
    }

    // private static async getShowByYearAndName(request: express.Request, response: express.Response) {
    //     console.log('[server] Request received: GET /shows/:year/:name');
    
    //     try {
    //         let show = await ShowService.getByYearAndName(parseInt(request.params.year), request.params.name);
    //         console.log(`[server] Request succeeded. GET /shows/:year/:name. Found show:`, JSON.stringify(show, null, 4));
    //         response.status(200).send(this.sanitize(show));
    //     } catch (e) {
    //         console.error(`[server] Request failed: GET /shows/:year/:name. ${e.toString()}`);
    //         response.status(500).send(e);
    //     }
    // }
}