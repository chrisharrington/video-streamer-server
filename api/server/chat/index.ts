import { Express, Request, Response } from 'express';
import { WebhookClient } from 'dialogflow-fulfillment';

import { HandlerFactory } from './handler-factory';

export default class Chat {
    initialize(app: Express) {
        const handlerFactory = new HandlerFactory();

        app.post('/chat', (request: Request, response: Response) => {
            const agent = new WebhookClient({ request, response });
            agent.handleRequest(async (client: WebhookClient) => {
                try {
                    await handlerFactory.create(client).run();
                } catch (e) {
                    client.add(`An error occurred while performing the ${client.action} action. Please try again later.`);
                    console.error(e);
                }
            });
        });
    }
}