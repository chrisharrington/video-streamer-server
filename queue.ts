import * as amqp from 'amqplib';

import Config from '@root/config';
import { Message } from '@root/models';

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

    async send(message: Message) : Promise<boolean> {
        return await this.sendInternal(this.queue, message);
    }

    async sendError(message: Message) : Promise<boolean> {
        return await this.sendInternal(this.errorQueue, message);
    }

    async receive(onMessage: (model: Message) => Promise<void>, delay?: number) {
        await this.receiveInternal(this.queue, onMessage, delay);
    }

    async receiveError(onMessage: (model: Message) => Promise<void>, delay?: number) {
        await this.receiveInternal(this.errorQueue, onMessage, delay);
    }

    private async sendInternal(queue: string, message: Message) : Promise<boolean> {
        await this.initialized;
        return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    }

    private async receiveInternal(queue: string, onMessage: (model: Message) => Promise<void>, delay?: number) {
        await this.initialized;
        this.channel.consume(queue, async m => {
            const message = JSON.parse(m.content.toString()) as Message;
            try {
                if (delay)
                    await this.delay(delay);
                await onMessage(message);
                this.channel.ack(m);
            } catch (e) {
                this.sendError(message);
            }
        });
    }

    private async initialize(queue: string) : Promise<void> {
        const connection = await amqp.connect(Config.queueConnectionString),
            channel = await connection.createChannel();

        await Promise.all([queue, queue + '-error'].map((q: string) => channel.assertQueue(q, { durable: true })));
        this.channel = channel;
        this.channel.prefetch(1);
    }

    private async delay(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }
}