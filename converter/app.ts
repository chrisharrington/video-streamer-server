import 'module-alias/register';

import Files from './files';
import Converter from './converter';

import '@root/extensions';

const SUFFIX: string = '(converted)';

(async function() {
    // const files = await Files.find('/home/chrisharrington/media/movies', ['mkv', 'mp4', 'm4v', 'avi'], SUFFIX);
    const path = '/media/movies/2 Fast 2 Furious (2003)/2 Fast 2 Furious (2003) Bluray-1080p.mkv';
    await Converter.convert(path);
})();