import * as React from 'react';
import { Row, Col } from 'react-grid-system';

import { StringExtensions } from '@web/extensions';

import EpisodeService from '@web/data/episodes';

import { Navigator, Views } from '@web/views';

import { Episode } from '@web/models';

interface SeasonDetailsProps {
    match: any;
}

interface SeasonDetailsState {
    episodes: Episode[];
}

export default class SeasonDetails extends React.Component<SeasonDetailsProps, SeasonDetailsState> {
    state = {
        episodes: []
    }

    async componentDidMount() {
        const show = this.props.match.params.name,
            season = this.props.match.params.season;

        console.log(this.props.match);
        if (!show || !season)
            return;

        this.setState({
            episodes: await EpisodeService.getByShowAndSeason(show, season)
        });
    }

    render() {
        const show: string = this.props.match.params.name,
            season: number = this.props.match.params.season,
            episodes: Episode[] = this.state.episodes;

        return !season ? <div /> : <div>
            <Row className='spacing-bottom'>
                <Col xs={12}>
                    <h3>{`Season ${season}`}</h3>
                </Col>
            </Row>
            {episodes.map((episode: Episode, index: number) => (
                <Row className='spacing-bottom-small' key={episode.name + index} onClick={() => Navigator.navigate(Views.EpisodePlayer, {
                    name: StringExtensions.toKebabCase(show),
                    season,
                    episode: episode.number
                })}>
                    <Col xs={12} className='episode-row'>
                        <div className='episode-header'>
                            <span>{episode.number}</span>
                            <h4>{episode.name}</h4>
                            <div className={`progress ${(!episode.progress || episode.progress === 0) ? 'none' : 'all'}`}></div>
                        </div>
                        {episode.synopsis && <div className='synopsis'>{episode.synopsis}</div>}
                    </Col>
                </Row>
            ))}
        </div>;
    }
}