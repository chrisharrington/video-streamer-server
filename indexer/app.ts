import 'module-alias/register';

import Config from '@root/config';

import Indexer from './indexer';

(async () => {
    if (Config.enabled.indexer)
        await Indexer.initialize();
    else
        console.log('[indexer] Disabled.');
})();