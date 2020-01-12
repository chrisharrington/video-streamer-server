import * as React from 'react';

import './style.scss';

import { StringExtensions } from '@web/extensions';
import MovieService from '@web/data/movies';
import EpisodeService from '@web/data/episodes';

import { Playable, Status } from '@web/models';

interface PlayerProps {
    match: any;
}

interface PlayerState {
    playable: Playable | null;
    loading: boolean;
    error: boolean;
    playing: boolean;
    currentTime: string;
    maxTime: string;
    progress: number;
    subtitles: boolean;
}

export default class PlayerView extends React.Component<PlayerProps, PlayerState> {
    video: HTMLVideoElement;
    seekBar: HTMLDivElement;
    saveProgressHandler: any;

    state = {
        playable: null,
        loading: true,
        error: false,
        playing: true,
        currentTime: this.formatTime(0),
        maxTime: this.formatTime(0),
        progress: 0,
        subtitles: false
    }

    async componentDidMount() {
        try {
            const params = this.props.match.params;
            let playable: Playable;
            if (params.name && params.year)
                playable = await MovieService.getByYearAndName(params.year, StringExtensions.fromKebabCase(params.name));
            else if (params.name && params.season && params.episode)
                playable = await EpisodeService.getByShowSeasonAndEpisode(StringExtensions.fromKebabCase(params.name), params.season, params.episode);
            else
                throw new Error(`Unable to derive media type: ${params}`);

            this.setState({
                playable
            }, () => {
                this.video.load();

                if (playable.progress) {
                    this.video.currentTime = playable.progress;
                    this.setState({
                        progress: playable.progress / playable.runtime * 100
                    });
                }
            });

            this.saveProgressHandler = this.saveProgress.bind(this);
            window.addEventListener('beforeunload', this.saveProgressHandler);
        } catch (e) {
            console.error(e);
            this.setState({
                loading: false,
                error: true
            });
        }
    }

    async componentWillUnmount() {
        window.removeEventListener('beforeunload', this.saveProgressHandler);
        await this.saveProgress();
    }

    render() {
        const playable = this.state.playable as any as Playable;
        if (!playable)
            return <div />;

        return <div className={`player ${this.state.loading ? 'loading' : ''} ${this.state.playing ? 'playing' : 'paused'}`}>
            <video
                ref={c => this.video = c as HTMLVideoElement}
                autoPlay
                crossOrigin='anonymous'
                onClick={e => this.onTogglePlayback(e)}
                onSeeking={() => this.onLoading(true)}
                onSeeked={() => this.onLoading(false)}
                onWaiting={() => this.onLoading(true)}
                onPlaying={() => this.onLoading(false)}
                onTimeUpdate={() => this.onTimeUpdate()}
                onError={() => this.setState({ loading: false, error: true })}
            >
                <source src={playable.video()} />
                <track label='English' kind='subtitles' src={playable.subtitle()} srcLang='en' />
                Sorry, your browser doesn't support embedded videos.
            </video>

            <div className='play-pause'>
                <i className={`fas fa-play fa-lg`}></i>
            </div>
            <div className='loader'></div>
            <div className={`error-indicator ${this.state.error && 'visible'}`}>
                <i className={`fas fa-times fa-lg`}></i>
            </div>

            <div className='controls'>
                <div className='top-controls'>
                    <div className='time'>
                        <span>{this.state.currentTime} / {this.state.maxTime}</span>
                    </div>
                    <div className='actions'>
                        {playable.subtitlesStatus === Status.Fulfilled && <i className={`fas fa-closed-captioning fa-lg ${this.state.subtitles && 'active'}`} onClick={() => this.onToggleSubtiles()}></i>}
                    </div>
                </div>
                <div className='seek' onClick={e => this.onSeek(e)}>
                    <div ref={c => this.seekBar = c as HTMLDivElement} className='seek-bar'>
                        <div className='seek-bar-progress' style={{ width: this.state.progress + '%' }}></div>
                    </div>
                </div>
            </div>
        </div>;
    }

    private onToggleSubtiles() {
        const track = this.video.textTracks[0];
        if (!track)
            return;

        this.setState({
            subtitles: !this.state.subtitles
        }, () => {
            track.mode = this.state.subtitles ? 'showing' : 'hidden';
        });
    }

    private onTimeUpdate() {
        this.setState({
            currentTime: this.formatTime(this.video.currentTime),
            maxTime: this.formatTime(this.video.duration),
            progress: this.video.currentTime / this.video.duration * 100
        });
    }

    private onTogglePlayback(e) {
        if (e.isDefaultPrevented() || this.state.error)
            return;

        const playing = this.state.playing;
        if (playing)
            this.video.pause();
        else
            this.video.play();
        this.setState({ playing: !playing });
    }

    private async onSeek(e) {
        const playable = this.state.playable as Playable | null;
        if (!playable)
            return;

        e.preventDefault();

        const width = this.seekBar.clientWidth,
            position = e.clientX - e.target.getBoundingClientRect().left,
            seek = playable.runtime * position/width;

        this.setState({ progress: position/width*100 })
        this.video.currentTime = seek;

        await this.saveProgress();
    }

    private onLoading(loading: boolean) {
        if (this.state.error)
            return;

        this.setState({ loading });
    }

    private formatTime(total: number) : string {
        if (isNaN(total))
            return '00:00:00';
        
        const seconds = Math.floor(total%60),
            minutes = Math.floor(total/60%60),
            hours = Math.floor(total/60/60%60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    private async saveProgress() {
        const playable: Playable = this.state.playable as any as Playable;
        if (!playable)
            return;

        await playable.saveProgress(this.video.currentTime);
    }
}