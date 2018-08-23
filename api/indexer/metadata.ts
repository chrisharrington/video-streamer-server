import { File } from '@root/models';

import Queue from '@root/queue';

class Metadata {
    private queueName: string = 'metadata';

    async queue(file: File) {
        await Queue.send(this.queueName, file);
    }

    async receive<TModel>(onMessage: (model: TModel) => void) {
        await Queue.receive(this.queueName, onMessage.bind(this));
    }
}

export default new Metadata();