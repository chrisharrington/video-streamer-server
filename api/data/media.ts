import { Base } from './base';
import { Media } from '@root/models/media';

class MediaService extends Base<Media> {
    constructor() {
        super('media');
    }

    get() : Promise<Media[]> {
        return Promise.resolve([]);
    }
}

export default new MediaService();