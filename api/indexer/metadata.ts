import { Movie } from '@root/models';

import Queue from '@root/queue';

class Metadata {
    private queueName: string = 'metadata';

    async movie(movie: Movie) {
        await Queue.send(this.queueName, movie);
    }

    async receive<TModel>(onMessage: (model: TModel) => void) {
        await Queue.receive(this.queueName, onMessage.bind(this), 300);
    }
}

export default new Metadata();