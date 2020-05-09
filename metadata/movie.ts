import * as fetch from 'node-fetch';

import Config from '@root/config';
import { Movie } from '@root/models';
import { StringExtensions } from '@root/extensions';

import Downloader from './downloader';
import Metadata from './base';

class MovieMetadata extends Metadata {
    async getMovie(movie: Movie) : Promise<Movie> {
        try {
            console.log(`[movie-indexer] Received metadata message. ${movie.name}`);
            if (!movie.name || !movie.year)
                throw new Error(`[movie-indexer] Movie missing either name or year. ${JSON.stringify(movie)}`);
                
            const search = (await this.movieSearch(movie)).results[0],
                configuration = await this.configuration;

            const [ details, { backdrops, posters } ] = await Promise.all([
                this.movieDetails(search.id),
                this.movieImages(search.id)
            ]);

            movie.externalId = search.id;
            movie.poster = posters.length === 0 ? null : await Downloader.image(`${configuration.base_url}w342${posters[0].file_path}`);
            movie.backdrop = backdrops.length === 0 ? null : await Downloader.image(`${configuration.base_url}original${backdrops[0].file_path}`);
            movie.synopsis = details.overview;
            movie.genres = details.genres.map(genre => genre.name);

            return movie;
        } catch (e) {
            console.log(`[movie-metadata] Error processing metadata for ${movie.name}: ${e.toString()}`)
            console.error(e);
        }
    }

    private async movieSearch(movie: Movie) : Promise<any> {
        const response = await fetch(`${Config.metadataApiUrl}search/movie?api_key=${Config.metadataApiKey}&query=${StringExtensions.escapeForUrl(movie.name)}&year=${movie.year}`);
        if (response.status !== 200)
            throw new Error(`[movie-indexer] Invalid response from metadata API /search/movie?query=${StringExtensions.escapeForUrl(movie.name)}&year=${movie.year}: ${response.status}`);

        return await response.json();
    }

    private async movieDetails(id: string) : Promise<any> {
        const response = await fetch(`${Config.metadataApiUrl}movie/${id}?api_key=${Config.metadataApiKey}`);
        if (response.status !== 200)
            throw new Error(`[movie-indexer] Invalid response from metadata API /movie/${id}: ${response.status}`);

        return await response.json();
    }

    private async movieImages(id: string) : Promise<any> {
        const response = await fetch(`${Config.metadataApiUrl}movie/${id}/images?api_key=${Config.metadataApiKey}&include_image_language=en,null`);
        if (response.status !== 200)
            throw new Error(`[movie-indexer] Invalid response from metadata API /movie/${id}/images: ${response.status}`);

        const images = await response.json(),
            backdrops = images.backdrops.sort((first, second) => second.vote_average - first.vote_average),
            posters = images.posters.sort((first, second) => second.vote_average - first.vote_average);

        return { backdrops, posters };
    }
}

export default new MovieMetadata();