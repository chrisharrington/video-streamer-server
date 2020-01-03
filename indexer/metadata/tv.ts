import * as fetch from 'node-fetch';
import * as dayjs from 'dayjs';

import Config from '@root/config';
import { Show, Season, Episode } from '@root/models';

import Metadata from './base';

class TvMetadata extends Metadata {
    async getShow(show: Show) : Promise<Show> {
        try {
            console.log(`[tv-metadata] Received TV show metadata message. ${show.name}.`);
            
            const search = (await this.showSearch(show.name)).results[0],
                details = await this.showDetails(search.id),
                configuration = await this.configuration;
                
            show.externalId = search.id;
            show.year = dayjs(details.first_air_date, 'yyyy-mm-dd').year();
            show.synopsis = details.overview;
            show.poster = `${configuration.base_url}w342${details.poster_path}`;
            show.backdrop = `${configuration.base_url}original${details.backdrop_path}`;
            return show;
        } catch (e) {
            console.log(`[tv-metadata] Error processing metadata for ${show.name}: ${e.toString()}`)
            console.error(e);
        }
    }

    async getSeason(season: Season, show: Show) : Promise<Season> {
        try {
            console.log(`[tv-metadata] Received TV season metadata message. ${season.show} / ${season.number}`);

            const details = await this.seasonDetails(season.number, show.externalId);

            season.externalId = details.id;
            season.synopsis = details.overview;
            season.year = dayjs(details.air_date, 'yyyy-mm-dd').year();
            season.poster = `${(await this.configuration).base_url}w342${details.poster_path}`;
            season.episodeCount = details.episodes.length;
            return season;
        } catch (e) {
            console.log(`[tv-metadata] Error processing metadata for ${season.show} / ${season.number}: ${e.toString()}`);
            console.error(e);
        }
    }

    async getEpisode(episode: Episode, season: Season, show: Show) : Promise<Episode> {
        try {
            console.log(`[tv-metadata] Received TV episode metadata message. ${season.show} / ${season.number} / ${episode.number}`);

            const details = await this.episodeDetails(episode.number, season.number, show.externalId);

            episode.externalId = details.id;
            episode.synopsis = details.overview;
            episode.airDate = dayjs(details.air_date, 'yyyy-mm-dd').toDate();
            episode.name = details.name;
            return episode;
        } catch (e) {
            console.log(`[tv-metadata] Error processing metadata for ${season.show} / ${season.number} / ${episode.number}: ${e.toString()}`);
            console.error(e);
        }
    }

    private async showSearch(name: string) : Promise<any> {
        const response = await fetch(`${Config.metadataApiUrl}search/tv?api_key=${Config.metadataApiKey}&query=${name}`);
        if (response.status !== 200)
            throw new Error(`[tv-indexer] Invalid response from metadata API /search/tv: ${response.status}`);

        const results = await response.json();
        if (!results || !results.results || results.results.length === 0)
            throw new Error(`[tv-indexer] Invalid result set from metadata API /search/tv: ${name} ${JSON.stringify(results)}`);

        return results;
    }

    private async showDetails(id: number) : Promise<any> {
        const response = await fetch(`${Config.metadataApiUrl}tv/${id}?api_key=${Config.metadataApiKey}`);
        if (response.status !== 200)
            throw new Error(`[tv-indexer] Invalid response from metadata API /tv/${id}: ${response.status}`);

        return await response.json();
    }

    private async seasonDetails(number: number, showId: string) : Promise<any> {
        const response = await fetch(`${Config.metadataApiUrl}tv/${showId}/season/${number}?api_key=${Config.metadataApiKey}`);
        if (response.status !== 200)
            throw new Error(`[tv-indexer] Invalid response from metadata API /tv/${showId}/season/${number}: ${response.status}`);

        return await response.json();
    }

    private async episodeDetails(number: number, season: number, showId: string) : Promise<any> {
        const response = await fetch(`${Config.metadataApiUrl}tv/${showId}/season/${season}/episode/${number}?api_key=${Config.metadataApiKey}`);
        if (response.status !== 200)
            throw new Error(`[tv-indexer] Invalid response from metadata API /tv/${showId}/season/${season}/episode/${number}: ${response.status}`);

        return await response.json();
    }
}

export default new TvMetadata();