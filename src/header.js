import React from 'react';
import { IconButton } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Login from './components/Login';
import './header.css'; // Assuming you have a CSS file for styling
import { useAuth } from './context/AuthContext';

const Header = () => {
    const logoSrc = `${process.env.PUBLIC_URL || ''}/logo.png?v=20260407a`;
    const {
        user,
        authDialogOpen,
        openAuthDialog,
        closeAuthDialog,
        logout,
        isAdmin
    } = useAuth();

    return (
        <header className="header">
            <div className="logo">
                <img 
                    src={logoSrc}
                    alt="Phoenix Trips Logo"
                    className="logo-img" // Added class for styling
                />
                <span className="logo-text">Phoenix Trips</span>
            </div>
            <nav className="nav">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/flights" className="nav-link">Flights</Link>
                <Link to="/hotels" className="nav-link">Hotels</Link>
            </nav>
            <div className="user-actions">
                <select className="language-select">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                </select>
                <Link to="/support" className="nav-link">Support</Link>
                <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                {isAdmin ? <Link to="/admin" className="nav-link">Admin</Link> : null}
                {user ? (
                    <button
                        type="button"
                        onClick={logout}
                        className="nav-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Logout
                    </button>
                ) : null}
                <IconButton 
                    className="profile-button"
                    onClick={openAuthDialog}
                >
                    <AccountCircle />
                </IconButton>
            </div>

            <Login open={authDialogOpen} onClose={closeAuthDialog} />
        </header>
    );
};

export default Header;
