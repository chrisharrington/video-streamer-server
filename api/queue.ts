import * as amqp from 'amqplib';

import Config from '@root/config';

class Queue {
    async send(queue: string, message: any) {
        let channel = await this.getChannel(queue);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        await channel.close();
    }

    async receive<TModel>(queue: string, onMessage: (model: TModel) => void) {
        let channel = await this.getChannel(queue);
        channel.consume(queue, message => {
            onMessage(JSON.parse(message.content) as TModel);
        });
    }

    private async getChannel(queue: string) {
        let channel = await amqp.connect(Config.queueConnectionString);
        await channel.assertQueue(queue);
        return channel;
    }
}

export default new Queue();