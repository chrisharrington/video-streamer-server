import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, Switch, Redirect } from 'react-router-dom';

import { StringExtensions } from '@web/extensions';

import { Movie, Show, Media, Season } from '@web/models';

import Header from '@web/components/header';

import MovieService from '@web/data/movies';
import ShowService from '@web/data/shows';

import { Navigator, Views } from '@web/views';

import PlayerView from '@web/views/player';
import MediaView from '@web/views/media';
import ShowView from '@web/views/show';

import './app.scss';

interface AppState {
    movies: Movie[];
    shows: Show[];
    show: Show;
}

class App extends React.Component<{}, AppState> {
    state = {
        movies: [],
        shows: [],
        show: new Show()
    }

    async componentDidMount() {
        this.setState({
            movies: await MovieService.getAll(),
            shows: await ShowService.getAll(),
        });
    }

    render() {
        return <div>
            <Router history={Navigator.history}>
                <Header />

                <Route exact path={[Views.Show, Views.Season]}>
                    {this.state.show.backdrop && <div className='backdrop' style={{ backgroundImage: `url(${this.state.show.backdrop})`}}>
                        <div className='backdrop-shader'></div>
                    </div>}
                </Route>

                <Route render={({ location }) => (
                    <Switch location={location}>
                        <Route exact path={Views.Movies}>
                            <MediaView
                                media={this.state.movies}
                                onMediaClicked={(movie: Movie) => this.onNavigateToMedia(Views.MoviePlayer, movie)}
                            />
                        </Route>

                        <Route exact path={[Views.MoviePlayer, Views.EpisodePlayer]} component={PlayerView} />

                        <Route exact path={Views.Shows}>
                            <MediaView
                                media={this.state.shows}
                                onMediaClicked={(show: Show) => this.onNavigateToMedia(Views.Show, show)}
                            />
                        </Route>

                        <Route path={Views.Show} render={(props) => <ShowView
                            {...props}
                            onShowLoaded={(show: Show) => this.setState({ show })}
                            onSeasonClicked={(show: Show, season: Season) => this.onNavigateToSeason(show, season)}
                        />} />

                        <Route path={Views.BasePath}>
                            <Redirect to={Views.Shows} />
                        </Route>
                    </Switch>
                )} />
            </Router>
        </div>;
    }

    onNavigateToMedia(view: string, media: Media) {
        media.name = StringExtensions.toKebabCase(media.name);
        Navigator.navigate(view, media);
    }

    onNavigateToSeason(show: Show, season: Season) {
        Navigator.navigate(Views.Season, {
            name: StringExtensions.toKebabCase(show.name),
            season: season.number 
        });
    }
}

ReactDOM.render(<App />, document.querySelector('#container'));