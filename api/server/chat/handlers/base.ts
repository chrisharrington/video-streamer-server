import { WebhookClient } from 'dialogflow-fulfillment';

export default abstract class IntentHandler {
    protected client: WebhookClient;

    constructor(client: WebhookClient) {
        this.client = client;
    }

    abstract async run();
}