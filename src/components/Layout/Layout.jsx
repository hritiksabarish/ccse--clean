import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <footer className="footer">
                <p>&copy; 2026 Climate Credit Score Engine. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
