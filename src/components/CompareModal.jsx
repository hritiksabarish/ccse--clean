import React, { useState } from 'react';
import { X, LoaderCircle, BarChart2 } from 'lucide-react';
import GlassCard from './UI/GlassCard';
import { API_BASE } from '../services/api';

const CompareModal = ({ isOpen, onClose }) => {
    const [locA, setLocA] = useState("");
    const [locB, setLocB] = useState("");
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);

    const handleCompare = async () => {
        if (!locA || !locB) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location_a: locA, location_b: locB })
            });
            const data = await res.json();
            if (res.ok) {
                setComparisonData(data);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Compare error:", err);
            alert("Failed to compare locations.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <GlassCard style={{ width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BarChart2 className="text-accent" /> Compare Locations
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Location A</label>
                        <input
                            className="form-input"
                            placeholder="Address, City or Pincode"
                            value={locA}
                            onChange={(e) => setLocA(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location B</label>
                        <input
                            className="form-input"
                            placeholder="Address, City or Pincode"
                            value={locB}
                            onChange={(e) => setLocB(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginBottom: '2rem' }}
                    onClick={handleCompare}
                    disabled={loading}
                >
                    {loading ? <LoaderCircle className="animate-spin" /> : 'Compare Now'}
                </button>

                {comparisonData && (
                    <div className="comparison-results animate-fade-in">
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Risk Factor</th>
                                    <th style={{ textAlign: 'center', padding: '1rem', color: '#ff9f43' }}>{comparisonData.location_a.location_name}</th>
                                    <th style={{ textAlign: 'center', padding: '1rem', color: '#00ff9d' }}>{comparisonData.location_b.location_name}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>Climate Score</td>
                                    <td style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>{comparisonData.location_a.climate_score}</td>
                                    <td style={{ textAlign: 'center', padding: '1rem', fontWeight: 'bold' }}>{comparisonData.location_b.climate_score}</td>
                                </tr>
                                {['flood', 'heat', 'storm', 'fire'].map(factor => (
                                    <tr key={factor} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{factor} Risk</td>
                                        <td style={{ textAlign: 'center', padding: '1rem' }}>{comparisonData.location_a.risk_profile[factor]}%</td>
                                        <td style={{ textAlign: 'center', padding: '1rem' }}>{comparisonData.location_b.risk_profile[factor]}%</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ padding: '1rem' }}>Loan Recommendation</td>
                                    <td style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8rem' }}>{comparisonData.location_a.loan_recommendation.recommendation_text}</td>
                                    <td style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8rem' }}>{comparisonData.location_b.loan_recommendation.recommendation_text}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default CompareModal;
