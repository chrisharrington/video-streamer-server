import * as amqp from 'amqplib';

import Config from '@root/config';

class Queue {
    channel: amqp.Channel;
    asserts: any = {};

    async send(queue: string, message: any) : Promise<void> {
        if (!this.channel) {
            let connection = await this.createConnection();
            this.channel = await connection.createChannel();
        }

        if (!this.asserts[queue]) {
            await this.channel.assertQueue(queue);
            this.asserts[queue] = true;
        }

        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }

    async receive<TModel>(queue: string, onMessage: (model: TModel) => Promise<void>, delay?: number) {
        delay = delay || 0;

        if (!this.channel) {
            let connection = await this.createConnection();
            this.channel = await connection.createChannel();
        }

        if (!this.asserts[queue]) {
            await this.channel.assertQueue(queue);
            this.asserts[queue] = true;
        }

        this.channel.prefetch(1, false);
        this.channel.consume(queue, async message => {
            await onMessage(JSON.parse(message.content.toString()) as TModel);
            this.channel.ack(message);
        });
    }

    private async createConnection(retries: number = 0) : Promise<amqp.Connection> {
        try {
            return await amqp.connect(Config.queueConnectionString);
        } catch {
            if (retries < 10) {
                return new Promise(resolve => {
                    setTimeout(async () => resolve(await this.createConnection(++retries)), 1000);
                });
            }
        }
    }
}

export default new Queue();