import React, { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import Login from './components/Login';
import './header.css'; // Assuming you have a CSS file for styling
import { useAuth } from './context/AuthContext';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const logoSrc = `${process.env.PUBLIC_URL || ''}/logo.png?v=20260407a`;
    const {
        user,
        authDialogOpen,
        openAuthDialog,
        closeAuthDialog,
        logout,
        isAdmin
    } = useAuth();

    useEffect(() => {
        const closeOnResize = () => {
            if (window.innerWidth > 900) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', closeOnResize);
        return () => window.removeEventListener('resize', closeOnResize);
    }, []);

    const closeMobileMenu = () => setMobileMenuOpen(false);

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
            <button
                type="button"
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <nav className={`nav-shell ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="nav">
                    <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
                    <Link to="/flights" className="nav-link" onClick={closeMobileMenu}>Flights</Link>
                    <Link to="/hotels" className="nav-link" onClick={closeMobileMenu}>Hotels</Link>
                </div>
                <div className="user-actions">
                <select className="language-select">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                </select>
                <Link to="/support" className="nav-link" onClick={closeMobileMenu}>Support</Link>
                <Link to="/my-bookings" className="nav-link" onClick={closeMobileMenu}>My Bookings</Link>
                {isAdmin ? <Link to="/admin" className="nav-link" onClick={closeMobileMenu}>Admin</Link> : null}
                {user ? (
                    <button
                        type="button"
                        onClick={() => {
                            closeMobileMenu();
                            logout();
                        }}
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
            </nav>

            <Login open={authDialogOpen} onClose={closeAuthDialog} />
        </header>
    );
};

export default Header;
