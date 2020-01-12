import { History as RouterHistory, createBrowserHistory } from 'history';

export abstract class Views {
    static BasePath = '';

    static Movies = `${Views.BasePath}/movies`;
    static MoviePlayer = `${Views.Movies}/player/:year/:name`;

    static Shows = `${Views.BasePath}/shows`;
    static Show = `${Views.BasePath}/shows/:name`;
    static Season = `${Views.BasePath}/shows/:name/:season`;
    static EpisodePlayer = `${Views.BasePath}/shows/:name/:season/:episode`;
}

class NavigatorClass {
    history: RouterHistory;
    back: boolean;

    constructor() {
        this.back = false;
        this.history = createBrowserHistory() as RouterHistory;
    }

    getKey(pathname: string, ordinal: number = 0) : string {
        pathname = pathname.replace(`${Views.BasePath}/`, '');
        return pathname.split('/')[ordinal];
    }

    navigate(view: Views, params?: any, back?: boolean) {
        if (back !== undefined)
            this.back = back;

        let location = view.toString();
        Object.keys(params || {}).forEach(k => location = location.replace(`:${k}`, params[k]));

        window.scrollTo(0, 0);
        this.history.push(location);
        setTimeout(() => this.back = false, 0);
    }

    replace(view: Views, back?: boolean) {
        if (back !== undefined)
            this.back = back;
            
        window.scrollTo(0, 0);
        this.history.replace(view.toString());
        setTimeout(() => this.back = false, 0);
    }

    isBack() {
        return this.back || this.history.action === 'POP';
    }
}

export const Navigator = new NavigatorClass();