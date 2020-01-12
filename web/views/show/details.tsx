import * as React from 'react';
import { Row, Col } from 'react-grid-system';

import { StringExtensions } from '@web/extensions';

import { Show, Season } from '@web/models';
import { Navigator, Views } from '@web/views';

interface ShowDetailsProps {
    show: Show;
    seasons: Season[];
}

export default class ShowDetails extends React.Component<ShowDetailsProps> {
    render() {
        const show = this.props.show,
            seasons = this.props.seasons;

        return <div>
            {seasons.map((season: Season) => (
                <Row className='spacing-bottom-small' key={season.number}>
                    <Col xs={12} className='season-row' onClick={() => Navigator.navigate(Views.Season, { name: StringExtensions.toKebabCase(show.name), season: season.number })}>
                        <h4>{`Season ${season.number}`}</h4>
                        <span>{`${season.episodeCount} episodes`}</span>
                    </Col>
                </Row>
            ))}
        </div>;
    }
}