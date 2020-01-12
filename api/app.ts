import 'module-alias/register';

import Config from '@root/config';
import Server from '@api/server/server';

[
    new Server(Config.serverPort)
].forEach(async task => {
    try {
        await task.run();
    } catch (e) {
        console.error(e);
    }
});