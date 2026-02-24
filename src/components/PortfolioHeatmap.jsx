import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// Critical fix: Vite modules isolate `L`. 
// leaflet.heat requires a global window.L to attach .heatLayer
if (typeof window !== 'undefined') {
    window.L = L;
}
import "leaflet.heat";

function PortfolioHeatmap({ portfolioData }) {
    const map = useMap();

    useEffect(() => {
        if (!portfolioData || portfolioData.length === 0) return;

        const heatData = portfolioData.map(item => {
            const lat = Number(item.latitude);
            const lng = Number(item.longitude);

            // Force score to be parsed securely, fallback to 0
            let score = 0;
            if (item.ml_risk_score !== undefined) score = Number(item.ml_risk_score);
            else if (item.overall_risk_score !== undefined) score = Number(item.overall_risk_score);
            else if (item.climate_score !== undefined) score = Number(item.climate_score);

            // Intensity must be firmly between 0.0 and 1.0
            const intensity = Math.max(0, Math.min(1, score / 100));

            return [lat, lng, intensity];
        }).filter(point => !isNaN(point[0]) && !isNaN(point[1]));

        console.log(`[HeatMap Debug] Rendering ${heatData.length} valid data points into the thermal canvas.`);

        const heatLayer = L.heatLayer(heatData, {
            radius: 35, // Increased radius for visibility from country-wide zoom
            blur: 25,
            maxZoom: 17,
            minOpacity: 0.4, // Prevents scattered lonely points from becoming totally transparent
            gradient: {
                0.0: "#22c55e", // Green
                0.5: "#eab308", // Yellow
                1.0: "#ef4444"  // Red
            }
        });

        // Add a slight delay to ensure React Leaflet map is fully initialized before attaching the canvas layer
        const timer = setTimeout(() => {
            try {
                heatLayer.addTo(map);
            } catch (err) {
                console.error("Heatmap attach error:", err);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            // check if map still exists before removing to prevent unmount crash
            if (map && heatLayer) {
                try {
                    map.removeLayer(heatLayer);
                } catch (e) { }
            }
        };
    }, [portfolioData, map]);

    return null;
}

export default PortfolioHeatmap;
