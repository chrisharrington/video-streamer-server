import * as React from 'react';

import { Media } from '@web/models';

import Poster from './poster';

const BASE_POSTER_WIDTH = 210;
const PADDING = 25;

interface IMediaListProps {
    media: Media[];
    onClickMedia: (media: Media) => void;
}

interface IMediaListState {
    posterWidth: number
}

export default class List extends React.Component<IMediaListProps, IMediaListState> {
    state = {
        posterWidth: 0
    }

    async componentDidMount() {
        const width = document.documentElement.scrollWidth - PADDING;
        const count = Math.round(width/BASE_POSTER_WIDTH);
        this.setState({
            posterWidth: width/count
        });
    }

    render() {
        return <div>
            {this.props.media.map((m: Media) => <Poster
                media={m}
                key={m.name}
                width={this.state.posterWidth}
                onClick={() => this.props.onClickMedia(m)}
            />)}
            <div className='clearfix'></div>
        </div>;
    }
}