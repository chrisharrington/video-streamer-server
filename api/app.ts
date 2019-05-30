import 'module-alias/register';
import * as ffmpeg from 'fluent-ffmpeg';

import Config from '@root/config';
import Server from '@root/server/server';
import { MovieIndexer } from '@root/indexer/movie';

Server.initialize(Config.serverPort);

// const mediaLibrary: string = '\\\\192.168.1.101\\movies';
// let indexer = new MovieIndexer([mediaLibrary]);
// indexer.run().catch(e => {
//     console.error(e);
// });