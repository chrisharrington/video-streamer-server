import watch from 'node-watch';

import { File } from '@lib/models';

export enum WatcherEvent {
    Update = 'update',
    Remove = 'remove'
}

export class Watcher {
    private handlers: any;

    constructor(...directories: string[]) {
        this.handlers = {};
        this.handlers[WatcherEvent.Update] = [];
        this.handlers[WatcherEvent.Remove] = [];

        directories.forEach((directory: string) => watch(directory, { recursive: true }, (event: WatcherEvent, name: string) => this.onFileChanged(event, name)));
    }

    on(event: WatcherEvent, func: (file: File) => void) {
        this.handlers[event].push(func);
    }

    private onFileChanged(event: WatcherEvent, path: string) {
        this.handlers[event].forEach(handler => handler(new File(path)));
    }
}

// import watch from 'node-watch';
// import * as chokidar from 'chokidar';

// import { File } from '@lib/models';

// export enum WatcherEvent {
//     Add = 'add',
//     Update = 'update',
//     Remove = 'remove'
// }

// export class Watcher {
//     private handlers: any;
//     private watcher: any;

//     constructor(...directories: string[]) {
//         this.watcher = chokidar.watch(directories);

//         this.handlers = {};
//         this.handlers[WatcherEvent.Add] = [];
//         this.handlers[WatcherEvent.Update] = [];
//         this.handlers[WatcherEvent.Remove] = [];

//         this.watcher.on('add', (path: string) => this.onFileChanged(WatcherEvent.Add, path));
//         this.watcher.on('change', (path: string) => this.onFileChanged(WatcherEvent.Update, path));
//         this.watcher.on('unlink', (path: string) => this.onFileChanged(WatcherEvent.Remove, path));

//         // directories.forEach((directory: string) => watch(directory, { recursive: true }, (event: WatcherEvent, name: string) => this.onFileChanged(event, name)));
//         // directories.forEach((directory: string) => watch(directory, { recursive: true }, (event: WatcherEvent, name: string) => console.log(event)));
//     }

//     on(event: WatcherEvent, handler: (file: File) => void) {
//         this.handlers[event].push(handler);
//     }

//     private onFileChanged(event: WatcherEvent, path: string) {
//         this.handlers[event].forEach((handler: (file: File) => void) => handler(new File(path)));
//     }
// }