import { WebhookClient } from 'dialogflow-fulfillment';

import IntentHandler from './base';

export default class WatchIntentHandler extends IntentHandler {
    constructor(client: WebhookClient) {
        super(client);
    }

    async run() {
        
    }
}