import * as mdns from 'mdns';

import Device from './device';

enum ServiceType {
    Chromecast = 'Chromecast'
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