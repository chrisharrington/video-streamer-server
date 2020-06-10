import 'module-alias/register';

import Config from '@lib/config';

import Metadata from './metadata';

if (Config.enabled.metadata)
    Metadata.initialize();
else
    console.log('[metadata] Disabled.');