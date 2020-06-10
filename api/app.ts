import 'module-alias/register';

import Config from '@lib/config';
import Server from '@api/server/server';

if (!Config.enabled.api) {
    console.log('[api] Disabled.');
} else {
    new Server(Config.serverPort).run();
}