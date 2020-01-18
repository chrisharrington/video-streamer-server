import 'module-alias/register';

import Config from '@root/config';

import { Subtitler } from './subtitler';

if (Config.enabled.subtitler)
    Subtitler.initialize();
else
    console.log('[subtitler] Disabled.');