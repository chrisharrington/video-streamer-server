import * as React from 'react';

import { Media } from '@web/models';

import MovieService from '@web/data/movies';

import { Navigator, Views } from '@web/views';

import List from './list';

import './style.scss';

interface IMediaViewProps {
    media: Media[];
    onMediaClicked: (media: Media) => void;
}

export default class MediaView extends React.Component<IMediaViewProps> {
    async componentDidMount() {
        this.setState({
            media: await MovieService.getAll()
        });
    }

    render() {
        return <div className='view media'>
            <List
                media={this.props.media}
                onClickMedia={(media: Media) => this.props.onMediaClicked(media)}
            />
        </div>;
    }

    onClickMedia(selected: Media) {
        Navigator.navigate(Views.MoviePlayer, { ...selected });
    }
}