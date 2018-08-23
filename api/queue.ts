import * as amqp from 'amqplib';

import Config from '@root/config';
import { createConnection } from 'net';

class Queue {
    async send(queue: string, message: any) {
        let connection = await amqp.connect(Config.queueConnectionString);
        let channel = await connection.createChannel();
        await channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        await channel.close();
        await connection.close();
    }

    async receive<TModel>(queue: string, onMessage: (model: TModel) => void, delay?: number) {
        delay = delay || 0;

        let connection = await amqp.connect(Config.queueConnectionString);
        let channel = await connection.createChannel();
        channel.prefetch(1, false);
        await channel.assertQueue(queue);
        channel.consume(queue, message => {
            onMessage(JSON.parse(message.content.toString()) as TModel);
            setTimeout(() => channel.ack(message), delay);
        });
    }
}

export default new Queue();