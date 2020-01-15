import watch from 'node-watch';

import { File } from '@root/models';

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