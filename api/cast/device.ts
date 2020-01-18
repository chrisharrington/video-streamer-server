import { Client, DefaultMediaReceiver } from 'castv2-client';

import { Castable } from '@root/models';

export default class Device {
    id: string;
    name: string;
    type: string;
    host: string;

    static fromRaw(raw: any) : Device {
        const device = new Device();
        device.id = raw.txtRecord.id;
        device.name = raw.txtRecord.fn;
        device.type = raw.txtRecord.md;
        device.host = raw.host;
        return device;
    }

    async cast(castable: Castable) {
        const client = new Client();

        client.on('error', error => console.log(error));

        client.connect(this.host, () => {
            client.launch(DefaultMediaReceiver, (error, player) => {
                if (error)
                    throw new Error(error);

                const message = {
                    contentId: castable.path,
                    contentType: 'video/mp4',
                    streamType: 'BUFFERED',
                    metadata: {
                        type: 0,
                        metadataType: 0,
                        title: castable.name, 
                        images: [
                            { url: castable.backdrop }
                        ]
                    }
                };

                player.on('status', function(status) {
                    console.log('status broadcast playerState=%s', status.playerState);
                });

                player.on('error', function(error) {
                    console.log(error);
                });

                player.load(message, { autoplay: true }, (error, status) => {
                    if (error)
                        throw new Error(error);

                    console.log(status);
                });
            });
        });
    }
}