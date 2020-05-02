import { WebhookClient } from 'dialogflow-fulfillment';

import IntentHandler from './handlers/base';
import WatchIntentHandler from './handlers/watch';

export class HandlerFactory {
    private handlers: any;

    constructor() {
        this.handlers = {};
        this.handlers[Handlers.Watch] = WatchIntentHandler;
    }

    create(client: WebhookClient) : IntentHandler {
        const Handler = this.handlers[client.action];
        if (!Handler)
            throw new Error(`[api] Action "${client.action}" corresponds to no handler.`);

        return new Handler(client);
    }
}

export enum Handlers {
    Watch = 'watch'
}