import { Request, Response } from 'express';

import AuthService from '@lib/data/auth';

export default class Middlewares {
    public static async auth(request: Request, response: Response, next: any) {
        // const user = await AuthService.findOne({ token: request.cookies.token });
        // if (!user)
        //     response.status(401).send('{}');
        // else
        //     next();

        next();
    }
}