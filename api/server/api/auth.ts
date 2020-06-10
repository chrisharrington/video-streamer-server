import { Application, Request, Response } from 'express';

import AuthService from '@lib/data/auth';

export default class Auth {
    static initialize(app: Application, prefix: string = '') {
        app.post(prefix + '/auth', this.authorize.bind(this));
        app.get(prefix + '/auth', this.isAuthorized.bind(this));
    }

    private static async authorize(request: Request, response: Response) {
        console.log(`[api] Request received: POST /auth`);

        try {
            const email = request.body.email,
                password = request.body.password,
                user = await AuthService.signIn(email, password);

            if (user) {
                response
                    .cookie('token', user.token, { domain: 'showveo.com', secure: true, expires: new Date(Date.now() + 28*24*60*60*1000) })
                    .status(200)
                    .send(user);
            } else
                response.sendStatus(401);
        } catch (e) {
            console.error(`[api] Request failed: POST /auth`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private static async isAuthorized(request: Request, response: Response) {
        console.log(`[api] Request received: GET /auth`);

        try {
            const token = request.query.token,
                user = await AuthService.findOne({ token });

            response.status(user ? 200 : 401).send('{}');
        } catch (e) {
            console.error(`[api] Request failed: GET /auth`);
            console.error(e);
            response.status(500).send(e);
        }
    }
}