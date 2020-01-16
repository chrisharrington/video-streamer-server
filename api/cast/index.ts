import * as mdns from 'mdns';
import { Client, DefaultMediaReceiver } from 'castv2-client';

enum ServiceType {
    Chromecast = 'Chromecast'
}

class Device {
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

    async cast(url: string) {
        console.log(DefaultMediaReceiver);

        const client = new Client();

        client.on('error', error => console.log(error));

        client.connect(this.host, () => {
            client.launch(DefaultMediaReceiver, (error, player) => {
                if (error)
                    throw new Error(error);

                var media = {
                    contentId: 'http://chrisharrington.me:8101/movies/play/2014/Chef',
                    contentType: 'video/mp4',
                    streamType: 'BUFFERED',
                    metadata: {
                        type: 0,
                        metadataType: 0,
                        title: "Big Buck Bunny", 
                        images: [
                            { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
                        ]
                    }
                };

                player.on('status', function(status) {
                    console.log('status broadcast playerState=%s', status.playerState);
                });

                player.on('error', function(error) {
                    console.log(error);
                });

                player.load(media, { autoplay: true }, (error, status) => {
                    if (error)
                        throw new Error(error);

                    console.log(status);
                });
            });
        });
    }
}

interface DeviceMap {
    [name: string] : Device;
}

export class Cast {
    private initialized: Promise<void>;
    private deviceMap: DeviceMap;

    constructor() {
        var browser = mdns.createBrowser(mdns.tcp('googlecast'), { resolverSequence: [
            mdns.rst.DNSServiceResolve(),
            'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [0] }),
            mdns.rst.makeAddressesUnique()
        ]});

        this.deviceMap = {};
        this.initialized = new Promise(resolve => setTimeout(resolve, 100));

        browser.on('serviceUp', raw => {
            const device = Device.fromRaw(raw);
            if (device.type === ServiceType.Chromecast)
                this.deviceMap[device.name] = device;
        });

        browser.on('serviceDown', raw => {
            const device = Device.fromRaw(raw);
            delete this.deviceMap[device.name];
        });

        browser.start();
    }

    async devices() : Promise<DeviceMap> {
        await this.initialized;
        return this.deviceMap;
    }
}

// function ondeviceup(host) {
//     var client = new Client();
//     client.connect(host, function() {
//         console.log('Connected');

//         // create various namespace handlers
//         var connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
//         var heartbeat  = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
//         var receiver   = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

//         // establish virtual connection to the receiver
//         connection.send({ type: 'CONNECT' });

//         // start heartbeating
//         setInterval(function() {
//             heartbeat.send({ type: 'PING' });
//         }, 5000);

//         // launch YouTube app
//         receiver.send({ type: 'LAUNCH', appId: 'YouTube', requestId: 1 });

//         // display receiver status updates
//         receiver.on('message', function(data, broadcast) {
//             if(data.type = 'RECEIVER_STATUS') {
//                 console.log(data);
//             }
//         });
//     });
 
// }