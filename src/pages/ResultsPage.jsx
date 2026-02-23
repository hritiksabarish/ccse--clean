import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FileText, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import { Line } from 'react-chartjs-2';

const ResultsPage = () => {
    const { state } = useLocation();
    const [showAI, setShowAI] = useState(false);

    const analysisId = state?.id;
    const score = state?.climate_score || state?.score || 72;
    const aiExplanation = state?.ai_explanation || state?.ai_insights || "Analysis complete. This score evaluates temperature trends and environmental proximity factors.";
    const loanRec = state?.loan_recommendation || {
        recommended_interest_adjustment: score >= 80 ? -0.15 : 0.25,
        risk_level: score >= 80 ? 'Low' : 'High',
        recommendation_text: score >= 80 ? 'Low climate risk. Standard interest rates apply.' : 'High exposure. Recommend risk premium on loan pricing.'
    };

    const getLevel = (val) => {
        if (val > 70) return "High";
        if (val > 40) return "Medium";
        return "Low";
    };

    const rawRisks = state?.risk_profile || state?.risks || {
        'flood': 50,
        'heat': 80,
        'storm': 30,
        'fire': 10
    };

    const projectionData = Array.isArray(state?.temperature_trend) ? state.temperature_trend.map((val, i) => ({
        year: 2024 + (i * 4),
        risk: (val + 1) * 30 // Scale for visualization
    })) : [
        { year: 2030, risk: 20 },
        { year: 2040, risk: 35 },
        { year: 2050, risk: 55 },
        { year: 2060, risk: 70 },
        { year: 2070, risk: 85 }
    ];

    const timelineData = {
        labels: projectionData.map(d => d.year.toString()),
        datasets: [{
            label: 'Projected Climate Impact',
            data: projectionData.map(d => d.risk),
            borderColor: '#ff9f43',
            backgroundColor: 'rgba(255, 159, 67, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ff9f43',
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#bdbdbd', font: { family: 'Inter', size: 12 } }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 9, 5, 0.9)',
                titleFont: { family: 'Outfit' },
                bodyFont: { family: 'Inter' },
                padding: 12,
                borderColor: 'rgba(255, 159, 67, 0.3)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: { color: '#888', font: { size: 10 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { color: '#888', font: { size: 10 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        },
        animation: {
            duration: 1500,
            easing: 'easeOutQuart'
        }
    };

    const handleDownload = () => {
        if (!analysisId) {
            window.print();
            return;
        }
        window.open(`http://localhost:5001/api/report/${analysisId}`, '_blank');
    };

    return (
        <div className="results-container">
            <div className="results-grid">
                <GlassCard className="score-card">
                    <h2 style={{ marginBottom: '2rem' }}>Climate Credit Score</h2>
                    <div className="score-circle" style={{ '--score': score }}>
                        <div className="score-inner">
                            <span>{Math.round(score)}</span>
                        </div>
                    </div>

                    <div className={`loan-impact ${loanRec.risk_level === 'Low' ? 'safe' : ''}`}>
                        <h3>Loan Recommendation</h3>
                        <p style={{ fontSize: '0.9rem', color: '#ff9f43', marginBottom: '0.5rem' }}>
                            Adjustment: {loanRec.recommended_interest_adjustment > 0 ? '+' : ''}{loanRec.recommended_interest_adjustment}%
                        </p>
                        <p>{loanRec.recommendation_text}</p>
                    </div>
                </GlassCard>

                <div className="right-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 8' }}>
                    <GlassCard className="risk-card" style={{ width: '100%' }}>
                        <h3>Top Risk Factors</h3>
                        <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                            {Object.entries(rawRisks).map(([risk, val]) => (
                                <li key={risk} style={{ marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ textTransform: 'capitalize', fontWeight: '500', color: '#eee' }}>
                                            {risk.replace('_', ' ')}
                                        </span>
                                        <span className={`badge ${getLevel(val).toLowerCase()}`}>{getLevel(val)}</span>
                                    </div>
                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${val}%`,
                                            height: '100%',
                                            background: getLevel(val) === 'High' ? 'var(--accent-red)' : getLevel(val) === 'Medium' ? 'var(--accent-green)' : '#00ff9d',
                                            boxShadow: `0 0 10px ${getLevel(val) === 'High' ? 'var(--accent-red)' : getLevel(val) === 'Medium' ? 'var(--accent-green)' : '#00ff9d'}`
                                        }} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    <GlassCard style={{ width: '100%', cursor: 'pointer' }} onClick={() => setShowAI(!showAI)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Why this score?</h3>
                            {showAI ? <ChevronUp /> : <ChevronDown />}
                        </div>
                        {showAI && (
                            <div style={{ marginTop: '1rem', color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                {aiExplanation}
                            </div>
                        )}
                    </GlassCard>
                </div>

                <GlassCard className="timeline-card" style={{ gridColumn: 'span 12' }}>
                    <h3>Climate Risk Projection</h3>
                    <div style={{ height: '300px', marginTop: '1rem' }}>
                        <Line data={timelineData} options={chartOptions} />
                    </div>
                </GlassCard>

                <div style={{ gridColumn: 'span 12', textAlign: 'center', marginTop: '2rem' }}>
                    <button onClick={handleDownload} className="btn btn-outline">
                        <FileText size={18} /> Download Report PDF
                    </button>
                    &nbsp;
                    <Link to="/analysis" className="btn btn-primary">
                        <RotateCcw size={18} /> Analyze Another Property
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
