export interface IPromise<TReturn> {
    resolve: (result: TReturn) => void;
    reject: (error?: Error) => void;
    promise: Promise<TReturn>
}

export class Async {
    protected promise<TReturn>() : IPromise<TReturn> {
        let resolve,
            reject,
            promise = new Promise<TReturn>((r, e) => {
                resolve = r;
                reject = e;
            });

        return {
            resolve,
            reject,
            promise
        } as IPromise<TReturn>;
    } 
}