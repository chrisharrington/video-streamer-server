import * as mdns from 'mdns';

import Device from './device';

enum ServiceType {
    Chromecast = 'Chromecast'
}

interface DeviceMap {
    [name: string] : Device;
}

class Cast {
    private initialized: Promise<void>;
    private deviceMap: DeviceMap;

    constructor() {
        console.log('[api] Initializing cast devices.');

        var browser = mdns.createBrowser(mdns.tcp('googlecast'), { resolverSequence: [
            mdns.rst.DNSServiceResolve(),
            'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [0] }),
            mdns.rst.makeAddressesUnique()
        ]});

        this.deviceMap = {};
        this.initialized = new Promise(resolve => setTimeout(resolve, 100));

        browser.on('serviceUp', raw => {
            if (!raw.txtRecord)
                return;

            console.log(`[api] Device found: ${raw.txtRecord.fn}`);
            const device = Device.fromRaw(raw);
            // if (device.type === ServiceType.Chromecast)
                this.deviceMap[device.name] = device;
        });

        browser.on('serviceDown', raw => {
            if (!raw.txtRecord)
                return;

            console.log(`[api] Device lost: ${raw.txtRecord.fn}`);
            const device = Device.fromRaw(raw);
            delete this.deviceMap[device.name];
        });

        browser.on('error', error => {
            console.error(`[api] Device error: `, error);
        });

        browser.start();
    }

    async devices() : Promise<Device[]> {
        await this.initialized;
        return Object.values(this.deviceMap).sort((first: Device, second: Device) => first.name.localeCompare(second.name));
    }
}

export default new Cast();