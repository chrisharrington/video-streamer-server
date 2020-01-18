import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

import ShowService from '@root/data/show';
import SeasonService from '@root/data/season';
import EpisodeService from '@root/data/episode';
import { Episode, Status } from '@root/models';
import { StringExtensions } from '@root/extensions';

import Base from './base';

export default class Shows extends Base {
    app: express.Application;

    initialize(app) {
        app.get('/shows/subtitle/:id', this.getSubtitlesForEpisode.bind(this));
        app.get('/shows/play/:show/:season/:episode', this.playEpisode.bind(this));
        app.get('/shows/all', this.getShows.bind(this));

        app.get('/shows/:show', this.getShow.bind(this));
        app.get('/shows/:show/seasons', this.getSeasons.bind(this));
        app.get('/shows/:show/:season', this.getSeason.bind(this));
        app.get('/shows/:show/:season/episodes', this.getEpisodes.bind(this));
        app.get('/shows/:show/:season/:episode', this.getEpisode.bind(this));

        app.post('/shows/progress', this.saveProgress.bind(this));
    }

    private async getShows(_, response: express.Response) {
        console.log('[api] Request received: GET /shows');

        try {
            const shows = await ShowService.get();
            console.log(`[api] Request succeeded. GET /shows. Found ${shows.length} shows.`);
            response.status(200).send(shows);
        } catch (e) {
            console.error(`[api] Request failed: GET /shows.`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async getShow(request: express.Request, response: express.Response) {
        const name = request.params.show;
        console.log(`[api] Request received: GET /shows/${name}`);

        try {
            const show = await ShowService.findOne({ name: new RegExp(StringExtensions.escapeForRegEx(name), 'i') });
            if (!show)
                throw new Error('No show found.');

            console.log(`[api] Request succeeded. GET /shows/${name}. Found ${show.name}`);
            response.status(200).send(show);
        } catch (e) {
            console.error(`[api] Request failed: GET /shows/${name}`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async getSeasons(request: express.Request, response: express.Response) {
        const show = request.params.show;
        console.log(`[api] Request received: GET /shows/${show}`);

        try {
            const seasons = await SeasonService.find({ show: new RegExp(StringExtensions.escapeForRegEx(show), 'i') }, { number: 1 });
            if (!seasons || seasons.length === 0)
                throw new Error('No seasons found.');

            console.log(`[api] Request succeeded. GET /shows/${show}/seasons. Found ${seasons.length} seasons.`);
            response.status(200).send(seasons);
        } catch (e) {
            console.error(`[api] Request failed: GET /shows/${show}/seasons`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async getSeason(request: express.Request, response: express.Response) {
        const show = request.params.show,
            number = parseInt(request.params.season);

        console.log(`[api] Request received: GET /shows/${show}/${number}`);

        try {
            const regex = new RegExp(StringExtensions.escapeForRegEx(show), 'i')
            const [ season, episodes ] = await Promise.all([
                await SeasonService.findOne({ show: regex, number }),
                await EpisodeService.find({ show: regex, season: number }, { number: 1 })
            ]);

            if (!season)
                throw new Error('No season found.');
            if (!episodes || episodes.length === 0)
                throw new Error('No episodes found.');

            console.log(`[api] Request succeeded. GET /shows/${show}/${number}. Found one season.`);
            response.status(200).send({ season, episodes });
        } catch (e) {
            console.error(`[api] Request failed: GET /shows/${show}/${number}`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async getEpisodes(request: express.Request, response: express.Response) {
        const show = request.params.show,
            season = parseInt(request.params.season);

        console.log(`[api] Request received: GET /shows/${show}/${season}/episodes`);

        try {
            console.log(StringExtensions.escapeForRegEx(show), season);
            const episodes = await EpisodeService.find({ show: new RegExp(StringExtensions.escapeForRegEx(show), 'i'), season }, { number: 1 });
            if (!episodes || episodes.length === 0)
                throw new Error('No episodes found.');

            response.status(200).send(episodes);
        } catch (e) {
            console.error(`[api] Request failed: GET /shows/${show}/${season}/episodes`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async getEpisode(request: express.Request, response: express.Response) {
        const show = request.params.show,
            season = parseInt(request.params.season),
            number = parseInt(request.params.episode);

        console.log(`[api] Request received: GET /shows/${show}/${season}/${number}`);

        try {
            const episode = await EpisodeService.findOne({ show: new RegExp(StringExtensions.escapeForRegEx(show), 'i'), season, number });
            if (!episode)
                throw new Error('No episode found.');

            response.status(200).send(episode);
        } catch (e) {
            console.error(`[api] Request failed: GET /shows/${show}/${season}/${number}`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async playEpisode(request: express.Request, response: express.Response) {
        const show = request.params.show,
            season = parseInt(request.params.season),
            number = parseInt(request.params.episode);

        console.log(`[api] Request received: GET /shows/${show}/${season}/${number}`);

        try {
            const episode = await EpisodeService.findOne({ show: new RegExp(StringExtensions.escapeForRegEx(show), 'i'), season, number });
            if (!episode)
                throw new Error('No episode found.');

            this.stream(request, response, episode.path);
        } catch (e) {
            console.error(`[api] Request failed: GET /shows/${show}/${season}/${number}`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async saveProgress(request: express.Request, response: express.Response) {
        console.log('[api] Request received: POST /movies/progress', request.body);

        try {
            let episode: Episode = await EpisodeService.findById(request.body.id);
            if (!episode) {
                console.error(`[api] Error: no episode found: ${request.body.id}.`);
                response.sendStatus(404);
                return;
            }

            episode.progress = parseInt(request.body.secondsFromStart);
            if (isNaN(episode.progress)) {
                console.error(`[api] Invalid progress: ${request.body.secondsFromStart}`);
                response.sendStatus(400);
                return;
            }

            await EpisodeService.updateOne(episode);
            response.sendStatus(200);
        } catch (e) {
            console.error(`[api] Request failed: POST /episode/progress.`);
            console.error(e);
            response.status(500).send(e);
        }
    }

    private async getSubtitlesForEpisode(request: express.Request, response: express.Response) {
        const id = request.params.id;
        console.log(`[api] Request received: GET /shows/subtitle/${id}`);

        try {
            const episode = await EpisodeService.findById(id);
            if (!episode) {
                console.error(`[api] Episode not found:`, id);
                response.sendStatus(404);
                return;
            }

            console.log(episode.path, path.basename(episode.path).substr(0, 6));

            const file = `${path.dirname(episode.path)}/${path.basename(episode.path).substr(0, 6)}.vtt`;
            if (episode.subtitlesStatus !== Status.Fulfilled || !fs.existsSync(file)) {
                console.error(`[api] Subtitles for episode not found: ${file}`);
                response.sendStatus(404);
                return;
            }

            response.writeHead(200, {
                'Content-Length': fs.statSync(file).size,
                'Content-Type': 'text/vvt',
            });
            fs.createReadStream(file).pipe(response);
        } catch (e) {
            console.error(`[server] Request failed: GET /shows/subtitle/${id}`);
            console.error(e);
            response.sendStatus(500);
        }
    }
}