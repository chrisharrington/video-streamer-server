import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Container, Row, Col } from 'react-grid-system';

import { StringExtensions } from '@web/extensions';

import SeasonService from '@web/data/seasons';
import ShowService from '@web/data/shows';

import { Season, Show } from '@web/models';

import { Views } from '@web/views';

import ShowDetails from './details';
import SeasonDetails from './season';

import './style.scss';

interface ShowViewProps {
    match: any;
    onShowLoaded: (show: Show) => void;
    onSeasonClicked: (show: Show, season: Season) => void;
}

interface ShowViewState {
    show: Show;
    seasons: Season[];
}

export default class ShowView extends React.Component<ShowViewProps, ShowViewState> {
    state = {
        show: new Show(),
        seasons: []
    }

    async componentDidMount() {
        const name = StringExtensions.fromKebabCase(this.props.match.params.name);
        const [ show, seasons ] = await Promise.all([
            ShowService.getByName(name),
            SeasonService.getByShowName(name)
        ]);

        this.setState({ seasons, show });

        this.props.onShowLoaded(show);
    }

    render() {
        const show: Show = this.state.show,
            seasons: Season[] = this.state.seasons;

        return <div className='view show'>
            <Container>
                <Row className='spacing-bottom'>
                    <Col xs={12}>
                        <h1>{show.name}</h1>
                    </Col>
                </Row>
                <Row className='spacing-bottom'>
                    <Col xs={12}>
                        <span>{show.synopsis}</span>
                    </Col>
                </Row>
                <Route render={({ location }) => (
                    <Switch location={location}>
                        <Route exact path={Views.Show}>
                            <ShowDetails
                                show={show}
                                seasons={seasons}
                            /> 
                        </Route>

                        <Route exact path={Views.Season} render={props => <SeasonDetails {...props} />} />
                    </Switch>
                )} />
                
            </Container>
        </div>;
    }
}