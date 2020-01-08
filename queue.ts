import * as amqp from 'amqplib';

import Config from '@root/config';

export default class Queue {
    channel: amqp.Channel;
    errorChannel: amqp.Channel;
    queue: string;
    errorQueue: string;
    initialized: Promise<void>;

    constructor(queue: string) {
        this.queue = queue;
        this.errorQueue = queue + '-error';

        this.initialized = this.initialize(queue);
    }

    async send<TModel>(message: TModel) : Promise<boolean> {
        return await this.sendInternal(this.queue, message);
    }

    async sendError<TModel>(message: TModel) : Promise<boolean> {
        return await this.sendInternal(this.errorQueue, message);
    }

    async receive<TModel>(onMessage: (model: TModel) => Promise<void>) {
        await this.receiveInternal(this.queue, onMessage);
    }

    async receiveError<TModel>(onMessage: (model: TModel) => Promise<void>) {
        await this.receiveInternal(this.errorQueue, onMessage);
    }

    private async sendInternal<TModel>(queue: string, message: TModel) : Promise<boolean> {
        await this.initialized;
        return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }

    private async receiveInternal<TModel>(queue: string, onMessage: (model: TModel) => Promise<void>) {
        await this.initialized;
        this.channel.consume(queue, async message => {
            try {
                await onMessage(JSON.parse(message.content.toString()) as TModel);
                this.channel.ack(message);
            } catch (e) {
                this.send(message);
            }
        });
    }

    private async initialize(queue: string) : Promise<void> {
        const connection = await amqp.connect(Config.queueConnectionString),
            channel = await connection.createChannel();

        await Promise.all([queue, queue + '-error'].map((q: string) => channel.assertQueue(q)));
        this.channel = channel;
        this.channel.prefetch(1, false);
    }
}