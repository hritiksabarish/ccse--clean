import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Building2, User, CircleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MeteorBackground from '../components/MeteorBackground';

const LoginPage = () => {
    const [role, setRole] = useState('official');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Mock validation based on original app.py
        const validUsers = {
            'bank_official': 'official123',
            'admin': 'admin123',
            'borrower': 'borrower123',
            'user1': 'user123'
        };

        if (validUsers[username] === password) {
            login(username, role);
            navigate(from, { replace: true });
        } else {
            setError('Invalid credentials or wrong role selected.');
        }
    };

    return (
        <div className="login-page-root" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            <MeteorBackground />
            <div className="login-content-container" style={{ position: 'relative', zIndex: 10 }}>
                <div className="login-page">
                    <div className="login-wrapper">
                        <div className="login-brand">
                            <div className="brand-logo">
                                <Globe size={24} />
                                <span>ClimateCredit</span>
                            </div>

                            <div className="brand-tagline">
                                <h2>Measure the <span>climate risk</span> of every loan.</h2>
                                <p>A banking-grade engine that evaluates long-term climate exposure for properties and generates an accurate credit score adjustment.</p>
                            </div>

                            <div className="brand-stats">
                                <div className="stat-item">
                                    <div className="stat-value">50+</div>
                                    <div className="stat-label">Risk Factors</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">0–100</div>
                                    <div className="stat-label">Score Range</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">Real-time</div>
                                    <div className="stat-label">Analysis</div>
                                </div>
                            </div>
                        </div>

                        <div className="login-form-panel">
                            <div className="form-header">
                                <h3>Welcome back</h3>
                                <p>Select your role and sign in to continue</p>
                            </div>

                            {error && (
                                <div className="flash-message">
                                    <CircleAlert size={16} />&nbsp; {error}
                                </div>
                            )}

                            <div className="role-selector">
                                <button
                                    className={`role-btn ${role === 'official' ? 'active' : ''}`}
                                    onClick={() => setRole('official')}
                                >
                                    <Building2 />
                                    Bank Official
                                </button>
                                <button
                                    className={`role-btn ${role === 'borrower' ? 'active' : ''}`}
                                    onClick={() => setRole('borrower')}
                                >
                                    <User />
                                    Loan Borrower
                                </button>
                            </div>

                            <form className="login-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Username / Email</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button type="submit" className="login-submit">
                                    Sign In {role === 'official' ? 'as Bank Official' : 'as Borrower'}
                                </button>
                            </form>

                            <div className="form-footer">
                                Secured by ClimateCredit &nbsp;·&nbsp; All data encrypted
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
