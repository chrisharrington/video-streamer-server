import * as fetch from 'node-fetch';

import Config from '@root/config';

interface Configuration {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string;
    logo_sizes: string;
    poster_sizes: string;
    profile_sizes: string;
    still_sizes: string;
}

export default class Metadata {
    protected configuration: Promise<Configuration>;

    constructor() {
        this.configuration = this.getConfiguration();
    }

    private async getConfiguration() : Promise<Configuration> {
        const response = await fetch(`${Config.metadataApiUrl}configuration?api_key=${Config.metadataApiKey}`);
        if (response.status !== 200)
            throw new Error(`[tv-indexer] Invalid response from metadata API /configuration: ${response.status}`);
        
        return (await response.json()).images;
    }

}