export default class BaseService {
    static async get(url: string, params?: any) : Promise<any> {
        const response = await fetch(`${url}${buildQuery(params)}`, {
            method: 'GET',
            mode: 'cors'
        });

        if (response.status === 500)
            throw new Error(response.body ? response.body.toString() : '');

        return await response.json();
    }

    static async post(url: string, params?: any, headers?: any) {
        headers = headers || {};
        headers['Content-Type'] = 'application/json';
        return fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: new Headers(headers),
            body: JSON.stringify(params)
        });
    }
}

function buildQuery(params: any) : string {
    var query = '';
    for (let name in params)
        query += `&${name}=${params[name] ? encodeURIComponent(params[name]) : ''}`;
    return query ? `?${query.substring(1)}` : query;
}