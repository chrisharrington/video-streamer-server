import * as React from 'react';
import { Link } from 'react-router-dom';

import './style.scss';

export default class Header extends React.Component {
    render() {
        return <header>
            <ul>
                <li>
                    <h5>
                        <Link to='/movies'>Movies</Link>
                    </h5>
                </li>
                <li>
                    <h5>
                        <Link to='/kids-movies'>Kid's Movies</Link>
                    </h5>
                </li>
                <li>
                    <h5>
                        <Link to='/shows'>TV Shows</Link>
                    </h5>
                </li>
                <li>
                    <h5>
                        <Link to='/kids-tv'>Kid's TV Shows</Link>
                    </h5>
                </li>
            </ul>
        </header>;
    }
}