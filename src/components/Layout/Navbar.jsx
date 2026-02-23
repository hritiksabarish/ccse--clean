import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <Globe />
                <span>ClimateCredit</span>
            </Link>

            <div className="nav-links">
                <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>Home</Link>
                <Link to="/analysis" className={`nav-item ${isActive('/analysis') ? 'active' : ''}`}>Analysis</Link>
                {user && (
                    <Link to="/portfolio" className={`nav-item ${isActive('/portfolio') ? 'active' : ''}`}>Portfolio</Link>
                )}
            </div>

            <div className="nav-actions">
                {user ? (
                    <div className="nav-user">
                        <span className="nav-user-badge">{user.role}</span>
                        <span className="nav-user-name">{user.displayName}</span>
                        <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}>
                            <LogOut size={14} /> Log Out
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
