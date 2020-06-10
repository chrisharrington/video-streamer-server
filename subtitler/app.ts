import 'module-alias/register';

import Config from '@lib/config';

import { Subtitler } from './subtitler';

if (Config.enabled.subtitler)
    Subtitler.initialize();
else
    console.log('[subtitler] Disabled.');