import * as React from 'react';
import { Link } from 'react-router-dom';

import './style.scss';

export default class Sidebar extends React.Component {
    render() {
        return <div className='sidebar'>
            <ul>
                <li>
                    <Link to='/movies'>
                        <i className='fas fa-film fa-lg'></i>
                        <span>Movies</span>
                    </Link>
                    <Link to='/kids-movies'>
                        <i className='fas fa-film fa-lg'></i>
                        <span>Kid's Movies</span>
                    </Link>
                    <Link to='/tv'>
                        <i className='fas fa-tv fa-lg'></i>
                        <span>TV Shows</span>
                    </Link>
                    <Link to='/kids-tv'>
                        <i className='fas fa-tv fa-sm'></i>
                        <span>Kid's TV Shows</span>
                    </Link>
                </li>
            </ul>
        </div>;
    }
}