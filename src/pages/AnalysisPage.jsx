import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Crosshair, LoaderCircle, Bolt, BarChart2 } from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    ArcElement,
} from 'chart.js';
import { Radar, Line, Pie } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_BASE } from '../services/api';

let DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    ArcElement
);

// Helper component to control map view
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, {
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
};

const AnalysisPage = () => {
    const [mode, setMode] = useState("address");
    const [address, setAddress] = useState("");
    const [pincode, setPincode] = useState("");
    const [propertyId, setPropertyId] = useState("");
    const [assetValue, setAssetValue] = useState("");
    const [loanTerm, setLoanTerm] = useState("30");
    const [coords, setCoords] = useState("");
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center default
    const [markerPosition, setMarkerPosition] = useState([20.5937, 78.9629]);
    const [analysisData, setAnalysisData] = useState(null);

    const setPosition = (pos) => {
        setMapCenter(pos);
        setMarkerPosition(pos);
    };

    // Dynamic Chart Data mapping strictly to SQLite DB schema
    const radarData = {
        labels: ['Heat', 'Flood', 'Storm', 'Fire'],
        datasets: [{
            label: 'Risk Profile',
            data: analysisData ? [
                analysisData.heat_risk ?? 0,
                analysisData.flood_risk ?? 0,
                analysisData.storm_risk ?? 0,
                analysisData.fire_risk ?? 0
            ] : [0, 0, 0, 0],
            backgroundColor: 'rgba(255, 159, 67, 0.2)',
            borderColor: '#ff9f43',
            pointBackgroundColor: '#ff9f43',
        }]
    };

    const tempTrendData = {
        labels: analysisData?.temperature_trend?.map((_, i) => `Year ${i + 1}`) || (Array.isArray(analysisData?.projections) ? analysisData.projections.map(d => (d.year || `Year`)) : []),
        datasets: [{
            label: 'Temp Increase (°C)',
            data: analysisData?.temperature_trend || (Array.isArray(analysisData?.projections) ? analysisData.projections.map(d => (d.value !== undefined ? d.value : d)) : []),
            borderColor: '#f6b93b',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(246, 185, 59, 0.1)',
        }]
    };

    const compositionData = {
        labels: ['Built Up', 'Greenery', 'Water'],
        datasets: [{
            data: analysisData ? [
                analysisData.builtup_percent ?? 0,
                analysisData.greenery_percent ?? 0,
                analysisData.water_percent ?? 0
            ] : [0, 0, 0],
            backgroundColor: ['#e17055', '#00ff9d', '#0984e3'],
            borderWidth: 0,
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#bdbdbd',
                    font: { family: 'Inter', size: 10 }
                }
            }
        }
    };

    const radarOptions = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            legend: { display: false }
        },
        scales: {
            r: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20,
                    color: "#bdbdbd",
                    backdropColor: "transparent"
                },
                grid: { color: "rgba(255,255,255,0.08)" },
                angleLines: { color: "rgba(255,255,255,0.08)" },
                pointLabels: {
                    color: "#e0e0e0",
                    font: { size: 12, weight: "500", family: 'Outfit' }
                }
            }
        }
    };

    const lineOptions = {
        ...commonOptions,
        plugins: {
            legend: {
                labels: { color: "#f5b041", font: { weight: '600' } }
            }
        },
        scales: {
            x: {
                ticks: { color: "#ccc" },
                grid: { color: "rgba(255,255,255,0.05)" }
            },
            y: {
                ticks: { color: "#ccc" },
                grid: { color: "rgba(255,255,255,0.05)" }
            }
        }
    };

    const pieOptions = {
        ...commonOptions,
        plugins: {
            legend: { position: 'right' }
        }
    };

    const fetchAnalysis = async (latitude, longitude) => {
        setLoading(true);
        const payload = {
            property_id: propertyId,
            address: address,
            pincode: pincode,
            latitude: latitude,
            longitude: longitude,
            asset_value: Number(assetValue),
            loan_term: Number(loanTerm)
        };

        try {
            const res = await fetch(`${API_BASE}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Analysis fetch failed");

            const result = await res.json();
            setAnalysisData(result);
        } catch (err) {
            console.error("[ERROR] Analysis fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (markerPosition[0] !== 20.5937 || markerPosition[1] !== 78.9629) {
            fetchAnalysis(markerPosition[0], markerPosition[1]);
        }
    }, [markerPosition]);

    const handleLiveLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos = [latitude, longitude];
                    const coordsStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    setMapCenter(newPos);
                    setMarkerPosition(newPos);
                    setCoords(coordsStr);
                    setAddress(coordsStr);
                    setLoading(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Could not get your location. Please check permissions.");
                    setLoading(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const fetchLocation = async () => {
        if (mode === "address") {
            const query = address || pincode;
            if (!query) return;
            setLoading(true);
            const url = `${API_BASE}/api/geocode?q=${encodeURIComponent(query)}`;

            try {
                const res = await fetch(url);
                if (!res.ok) {
                    const errorData = await res.json();
                    alert(errorData.error || "Location not found");
                    return;
                }

                const data = await res.json();
                const lat = Number(data.lat);
                const lng = Number(data.lng);

                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error("Invalid coordinates received from API");
                }

                setPosition([lat, lng]);
                if (data.display_name && !address) setAddress(data.display_name);
            } catch (err) {
                console.error("[ERROR] Fetch error:", err);
                alert("Error fetching location.");
            } finally {
                setLoading(false);
            }
        } else {
            const [lat, lng] = coords.split(",").map(Number).filter(n => !isNaN(n));
            if (lat === undefined || lng === undefined) {
                alert("Invalid coordinates");
                return;
            }
            setPosition([lat, lng]);
        }
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            property_id: propertyId,
            address: address,
            pincode: pincode,
            latitude: markerPosition[0],
            longitude: markerPosition[1],
            asset_value: Number(assetValue),
            loan_term: Number(loanTerm)
        };

        try {
            const res = await fetch(`${API_BASE}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Analysis failed");

            const result = await res.json();

            navigate('/results', {
                state: {
                    climate_score: result.climate_score,
                    risk_profile: result.risk_profile,
                    temperature_trend: result.temperature_trend,
                    ai_insights: result.ai_insights || result.ai_explanation,
                    loan_recommendation: result.loan_recommendation,
                    id: result.id,
                    address: address,
                    property_name: propertyId,
                    asset_value: Number(assetValue),
                    loan_term: Number(loanTerm)
                }
            });
        } catch (err) {
            console.error("[ERROR] Analysis error:", err);
            alert("Failed to generate climate score.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="analysis-container">
            <div className="analysis-form-panel glass-card" style={{ borderRadius: 0, border: 'none', borderRight: 'var(--glass-border)' }}>
                <h2 style={{ marginBottom: '2rem' }}>Property Analysis</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Property ID</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. PROP-2024-001"
                            value={propertyId}
                            onChange={(e) => setPropertyId(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Search Mode</label>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="address"
                                    checked={mode === "address"}
                                    onChange={(e) => setMode(e.target.value)}
                                    style={{ accentColor: 'var(--accent-green)' }}
                                />
                                Address / Place
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="coordinates"
                                    checked={mode === "coordinates"}
                                    onChange={(e) => setMode(e.target.value)}
                                    style={{ accentColor: 'var(--accent-green)' }}
                                />
                                Coordinates
                            </label>
                        </div>
                    </div>

                    {mode === "address" ? (
                        <div className="form-group">
                            <label className="form-label">Property Address / Pincode</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="e.g. Patna Bihar 800001"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ padding: '0.75rem' }}
                                    onClick={handleLiveLocation}
                                    title="Use Current Location"
                                >
                                    <Crosshair size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">Coordinates (Lat, Lon)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={coords}
                                    onChange={(e) => setCoords(e.target.value)}
                                    placeholder="e.g. 19.0760, 72.8777"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ padding: '0.75rem' }}
                                    onClick={handleLiveLocation}
                                    title="Use Current Location"
                                >
                                    <Crosshair size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: '100%', marginBottom: '1.5rem', justifyContent: 'center' }}
                        onClick={fetchLocation}
                        disabled={loading}
                    >
                        {loading ? <LoaderCircle size={18} className="animate-spin" /> : 'Fetch Location'}
                    </button>
                    <div className="form-group">
                        <label className="form-label">Asset Value (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="Enter the asset value in INR"
                            value={assetValue}
                            onChange={(e) => setAssetValue(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Loan Term (Years)</label>
                        <select
                            className="form-input"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                        >
                            <option value="15">15 Years</option>
                            <option value="30">30 Years</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-cta" style={{ width: '100%', marginTop: '0.5rem' }}>
                        <Bolt size={18} /> Generate Score
                    </button>
                </form>

                {loading && (
                    <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--accent-green)' }}>
                        <LoaderCircle size={32} className="animate-spin" />
                        <p style={{ marginTop: '0.5rem' }}>Analyzing climate models...</p>
                    </div>
                )}
            </div>

            <div className="map-panel">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={markerPosition} />
                    <MapController center={mapCenter} />
                </MapContainer>
            </div>

            <div className="analysis-right-panel animate-fade-in">
                <GlassCard className="insight-card">
                    <h3>Regional Risk Profile</h3>
                    <div className="chart-container">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                    <p className="insight-meta">Aggregated risk factors from local climate models.</p>
                </GlassCard>

                <GlassCard className="insight-card">
                    <h3>Historical Temp. Trend</h3>
                    <div className="chart-container">
                        <Line data={tempTrendData} options={lineOptions} />
                    </div>
                </GlassCard>

                <GlassCard className="insight-card">
                    <h3>Environmental Composition</h3>
                    <div className="chart-container">
                        <Pie data={compositionData} options={pieOptions} />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AnalysisPage;
