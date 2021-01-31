import { Client, DefaultMediaReceiver } from 'castv2-client';

import { Castable } from '@lib/models';

interface Application {
    play: () => void;
    pause: () => void;
    stop: () => void;
    seek: (currentTime: number) => void;
}

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

    async cast(castable: Castable) : Promise<void> {
        return new Promise((resolve, reject) => {
            const client = new Client();

            client.on('error', error => console.log(error));

            client.connect(this.host, () => {
                client.launch(DefaultMediaReceiver, (error, player) => {
                    if (error)
                        throw new Error(error);       

                    const message = {
                        contentId: castable.url,
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

                    player.on('error', reject);

                    player.load(message, { autoplay: true }, error => {
                        if (error)
                            console.error(error);

                        resolve();
                    });
                });
            });
        });
    }

    async pause() : Promise<void> {
        await this.command((app: Application) => app.pause());
    }

    async play() : Promise<void> {
        await this.command((app: Application) => app.play());
    }

    async stop() : Promise<void> {
        await this.command((app: Application) => app.stop());
    }

    async status() : Promise<any> {
        return new Promise((resolve, reject) => {
            const client = new Client();
            client.connect(this.host, () => {
                client.getSessions((error, sessions) => {
                    if (error)
                        reject(error);

                    client.join(sessions[0], DefaultMediaReceiver, (error, app) => {
                        if (error)
                            reject(error);

                        app.getStatus((error, status) => {
                            if (error)
                                reject(error);

                            resolve({
                                time: status.currentTime,
                                duration: status.media.duration
                            });
                        });
                    });
                });
            });
        });
    }

    private async command(command: (app: Application) => void) {
        return new Promise((resolve, reject) => {
            const client = new Client();
            client.connect(this.host, () => {
                client.getSessions((error, sessions) => {
                    if (error)
                        reject(error);

                    client.join(sessions[0], DefaultMediaReceiver, (error, app) => {
                        if (error)
                            reject(error);

                        if (!app.media.currentSession){
                            app.getStatus(() => {
                                command(app);
                            });
                        } else
                            command(app);

                        resolve();                    
                    });
                });
            });
        });
    }
}