import { Application, Request, Response } from 'express';

import { Cast } from '@api/cast';

import Base from './base';

export default class Devices extends Base {
    cast: Cast;

    constructor() {
        super();
        this.cast = new Cast();
    }

    initialize(app: Application) {
        app.get('/devices', this.getDevices.bind(this));

        app.post('/devices/play', this.play.bind(this));
        app.post('/devices/pause', this.pause.bind(this));
        app.post('/devices/stop', this.stop.bind(this));
        app.post('/devices/seek', this.seek.bind(this));
    }

    private async getDevices(_: Request, response: Response) {
        console.log('[api] Request received: GET /devices');

        try {
            response.status(200).send(await this.cast.devices());
        } catch (e) {
            console.error(`[api] Request failed: GET /devices.`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async play(request: Request, response: Response) {

    }

    private async pause(request: Request, response: Response) {

    }

    private async stop(request: Request, response: Response) {

    }

    private async seek(request: Request, response: Response) {

    }
}