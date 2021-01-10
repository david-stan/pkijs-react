import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <div className="header">
            <Link to="/">Home</Link>
            <Link to="/encrypt">Encryption Tool</Link>
            <Link to="/decrypt">Decryption Tool</Link>
        </div>
    )
}

export default Header;