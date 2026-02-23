import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Waves, ThermometerSun, LineChart } from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import StarfieldBackground from '../components/StarfieldBackground';
import MeteorBackground from '../components/MeteorBackground';

const HomePage = () => {
    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
            <StarfieldBackground />
            <MeteorBackground />

            <div className="main-content" style={{ position: 'relative', zIndex: 10 }}>
                <section className="hero-section">
                    <div className="hero-content animate-fade-in relative z-10 mx-auto max-w-4xl flex flex-col items-center justify-center text-center" style={{ padding: '2.5rem', borderRadius: '16px', background: 'transparent' }}>
                        <h1 className="hero-title">Future-Proof Your Portfolio<br />Against Climate Risk</h1>
                        <p className="hero-subtitle">Advanced AI-driven climate credit scoring for modern financial institutions. Assess flood, heat, and storm risks with precision.</p>
                        <div className="cta-group" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            <Link to="/analysis" className="btn btn-cta flex justify-center items-center gap-4">
                                Start Analysis <ArrowRight size={18} />
                            </Link>
                            <a href="#features" className="btn btn-outline flex justify-center items-center gap-4">Learn More</a>
                        </div>
                    </div>
                </section>

                <section id="features" style={{ padding: '4rem 5%' }}>
                    <div className="grid-3">
                        <GlassCard className="feature-card">
                            <Waves size={32} style={{ color: 'var(--accent-green)', marginBottom: '1rem' }} />
                            <h3>Flood & Storm Risk</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Precise hydrological modeling to predict flood plains and storm surge impacts over the next 50 years.</p>
                        </GlassCard>
                        <GlassCard className="feature-card">
                            <ThermometerSun size={32} style={{ color: 'var(--accent-amber)', marginBottom: '1rem' }} />
                            <h3>Heatwave Exposure</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Analyze heat island effects and long-term temperature projections affecting property value and insurability.</p>
                        </GlassCard>
                        <GlassCard className="feature-card">
                            <LineChart size={32} style={{ color: 'var(--accent-red)', marginBottom: '1rem' }} />
                            <h3>Financial Impact</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Directly translate climate data into credit scores and loan adjustment recommendations.</p>
                        </GlassCard>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
