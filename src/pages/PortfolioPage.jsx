import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Upload, FileDown, ShieldCheck, AlertTriangle, TrendingDown, Target } from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import { Pie } from 'react-chartjs-2';
import Papa from 'papaparse';
import { API_BASE } from '../services/api';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to handle map auto-bounds
const MapAutoBounds = ({ properties }) => {
    const map = useMap();
    useEffect(() => {
        if (properties.length > 0) {
            const coords = properties
                .filter(p => p.latitude && p.longitude)
                .map(p => [p.latitude, p.longitude]);

            if (coords.length > 0) {
                const bounds = L.latLngBounds(coords);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            }
        }
    }, [properties, map]);
    return null;
};

const PortfolioPage = () => {
    const [properties, setProperties] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({
        avgScore: 0,
        highRiskCount: 0,
        medRiskCount: 0,
        lowRiskCount: 0,
        totalValue: 0
    });
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);

    // Default India Center
    const INDIA_CENTER = [20.5937, 78.9629];
    const DEFAULT_ZOOM = 5;

    // Fetch real data and alerts from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetsRes, alertsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/assets`),
                    fetch(`${API_BASE}/api/alerts`)
                ]);

                if (assetsRes.ok) {
                    const data = await assetsRes.json();
                    setProperties(data);
                }

                if (alertsRes.ok) {
                    const alertData = await alertsRes.json();
                    setAlerts(alertData.alerts || []);
                }
            } catch (err) {
                console.error("[ERROR] Portfolio fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate stats whenever properties update
    useEffect(() => {
        if (properties.length === 0) return;

        const totalScore = properties.reduce((acc, p) => acc + (p.climate_score || 0), 0);
        const totalValue = properties.reduce((acc, p) => acc + (p.asset_value || 0), 0);

        const counts = properties.reduce((acc, p) => {
            const score = p.climate_score || 0;
            if (score >= 80) acc.low++;
            else if (score >= 50) acc.med++;
            else acc.high++;
            return acc;
        }, { high: 0, med: 0, low: 0 });

        setStats({
            avgScore: Math.round(totalScore / properties.length),
            highRiskCount: counts.high,
            medRiskCount: counts.med,
            lowRiskCount: counts.low,
            totalValue: totalValue
        });
    }, [properties]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                const validData = results.data.filter(p => p.lat && p.lng && p.score);
                if (validData.length > 0) {
                    setProperties(validData);
                } else {
                    alert("No valid property data found in CSV. Required columns: lat, lng, score, location, id");
                }
            }
        });
    };

    const getRiskLevel = (score) => {
        if (score >= 80) return { label: 'Low', color: '#00ff9d', class: 'low' };
        if (score >= 50) return { label: 'Medium', color: '#ff9f43', class: 'medium' };
        return { label: 'High', color: '#eb4d4b', class: 'high' };
    };

    const pieData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [{
            data: [stats.lowRiskCount, stats.medRiskCount, stats.highRiskCount],
            backgroundColor: ['#00ff9d', '#ff9f43', '#eb4d4b'],
            borderWidth: 0
        }]
    };

    const formatINR = (val) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="portfolio-container" style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <div className="dashboard-header" style={{ padding: 0, marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Portfolio Overview</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Global climate risk exposure and asset distribution.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        style={{ display: 'none' }}
                    />
                    <button className="btn btn-outline" onClick={() => fileInputRef.current.click()}>
                        <Upload size={18} /> Import Assets (CSV)
                    </button>
                    <button className="btn btn-cta">
                        <FileDown size={18} /> Export PDF
                    </button>
                </div>
            </div>

            {alerts.length > 0 && alerts[0] !== "All portfolio assets currently within stable climate risk parameters." && (
                <div className="alert-banner animate-fade-in" style={{
                    marginBottom: '2rem',
                    background: 'rgba(235, 77, 75, 0.1)',
                    border: '1px solid rgba(235, 77, 75, 0.3)',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <AlertTriangle color="#eb4d4b" />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#eb4d4b', margin: 0 }}>Portfolio Risk Warning</h4>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                            {alerts.map((msg, i) => (
                                <span key={i} style={{ fontSize: '0.9rem', color: '#ccc' }}>• {msg}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Stat Cards */}
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem', gap: '1.5rem' }}>
                <GlassCard className="stat-summary-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="icon-badge" style={{ background: 'rgba(255, 159, 67, 0.1)', color: '#ff9f43' }}>
                            <Target size={24} />
                        </div>
                        <h3>Portfolio Score</h3>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: getRiskLevel(stats.avgScore).color }}>
                        {stats.avgScore || 0}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Weighted average of {properties.length} properties
                    </p>
                </GlassCard>

                <GlassCard className="stat-summary-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="icon-badge" style={{ background: 'rgba(0, 255, 157, 0.1)', color: '#00ff9d' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <h3>Total Asset Value</h3>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 700 }}>
                        {formatINR(stats.totalValue)}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Combined portfolio market estimation</p>
                </GlassCard>

                <GlassCard className="stat-summary-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="icon-badge" style={{ background: 'rgba(235, 77, 75, 0.1)', color: '#eb4d4b' }}>
                            <TrendingDown size={24} />
                        </div>
                        <h3>Critical Assets</h3>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 700 }}>
                        {stats.highRiskCount}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Properties with score &lt; 50
                    </p>
                </GlassCard>
            </div>

            <div className="portfolio-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Map Section */}
                <GlassCard style={{ height: '600px', padding: 0, overflow: 'hidden', position: 'relative' }}>
                    <MapContainer center={INDIA_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        {properties.map(p => (
                            <Marker key={p.id} position={[p.latitude, p.longitude]}>
                                <Popup>
                                    <div style={{ color: '#000', padding: '0.5rem' }}>
                                        <h4 style={{ margin: 0 }}>{p.property_name}</h4>
                                        <p style={{ margin: '0.5rem 0' }}>{p.address}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Score:</span>
                                            <strong style={{ color: getRiskLevel(p.climate_score).color }}>{p.climate_score}</strong>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        <MapAutoBounds properties={properties} />
                    </MapContainer>
                    <div className="map-overlay-info" style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000 }}>
                        <div className="glass-card" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'rgba(15, 9, 5, 0.8)' }}>
                            <span style={{ fontSize: '0.9rem' }}>Mapping {properties.length} Active Assets</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Chart Section */}
                <GlassCard>
                    <h3 style={{ marginBottom: '2rem' }}>Risk Distribution</h3>
                    <div style={{ height: '280px', marginBottom: '2rem' }}>
                        <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                    <div className="risk-legend">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eb4d4b' }}></div>
                                <span>High Risk</span>
                            </div>
                            <strong>{stats.highRiskCount} Assets</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff9f43' }}></div>
                                <span>Medium Risk</span>
                            </div>
                            <strong>{stats.medRiskCount} Assets</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00ff9d' }}></div>
                                <span>Low Risk</span>
                            </div>
                            <strong>{stats.lowRiskCount} Assets</strong>
                        </div>
                    </div>
                </GlassCard>

                {/* Table Section */}
                <GlassCard style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3>Asset Inventory</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="search-box" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.5rem 1rem' }}>
                                <input type="text" placeholder="Search ID or Location..." style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
                            </div>
                        </div>
                    </div>
                    <table className="portfolio-table">
                        <thead>
                            <tr>
                                <th>Asset ID</th>
                                <th>Location</th>
                                <th>Market Value</th>
                                <th>Credit Score</th>
                                <th>Risk Level</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map(p => {
                                const risk = getRiskLevel(p.climate_score);
                                return (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600 }}>{p.id}</td>
                                        <td>{p.address}</td>
                                        <td>{formatINR(p.asset_value)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="score-bar-mini" style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                                    <div style={{ width: `${p.climate_score}%`, height: '100%', background: risk.color, borderRadius: '3px' }}></div>
                                                </div>
                                                <span style={{ minWidth: '30px' }}>{p.climate_score}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${risk.class}`} style={{ background: `${risk.color}15`, color: risk.color, border: `1px solid ${risk.color}30` }}>
                                                {risk.label}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>View Details</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </GlassCard>
            </div>
        </div>
    );
};

export default PortfolioPage;
