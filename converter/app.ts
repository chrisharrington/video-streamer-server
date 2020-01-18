import 'module-alias/register';

import Config from '@root/config';

import Converter from './converter';

if (Config.enabled.converter)
    Converter.initialize();
else
    console.log('[converter] Disabled.');