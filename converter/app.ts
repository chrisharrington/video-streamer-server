import 'module-alias/register';

import Queue from '@root/queue';
import Config from '@root/config';

import { Converter } from './converter';
import MovieConverter from './movie';
import TvConverter from './tv';

(async function() {
    const queue = new Queue('converter');

    Converter.initialize(queue);

    const movieConverter = new MovieConverter(queue),
        tvConverter = new TvConverter(queue);

    await Promise.all(Config.movieLibraries.map((library: string) => movieConverter.run(library)));
    await Promise.all(Config.tvLibraries.map((library: string) => tvConverter.run(library)));
})();