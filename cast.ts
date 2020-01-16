import { Cast } from './api/cast';

(async () => {
    const cast = new Cast(),
        devices = await cast.devices(),
        device = devices['Basement'];

    if (!device)
        return;

    device.cast(`http://192.168.1.101:8101/movies/play/2010/She's%20Out%20of%20My%20League`);
})();
