// map.js
let map;
let marker;
let locationInputId;

function initMap(elementId, inputId) {
    if (map) return; // Prevent re-initialization

    locationInputId = inputId;

    // Default: Center of India
    const defaultLat = 22.5937;
    const defaultLng = 78.9629;

    map = L.map(elementId, {
        center: [defaultLat, defaultLng],
        zoom: 5,
        minZoom: 4
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        className: 'dark-map-tiles'
    }).addTo(map);

    // Initial marker on New Delhi
    updateMarker(28.6139, 77.2090, "New Delhi, India");

    // Click to pin
    map.on('click', async function (e) {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng, "Loading address...");

        try {
            const address = await reverseGeocode(lat, lng);
            if (address && locationInputId) {
                document.getElementById(locationInputId).value = address;
                marker.setPopupContent(address).openPopup();
            }
        } catch (err) {
            console.error(err);
            marker.setPopupContent("Location set").openPopup();
        }
    });

    // Setup input listeners
    setupInputListeners();
}

function updateMarker(lat, lng, title) {
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        const customIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: '<div class="marker-pin"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });

        marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    }

    marker.bindPopup(title).openPopup();
    map.flyTo([lat, lng], 13);
}

function setupInputListeners() {
    if (!locationInputId) return;

    const input = document.getElementById(locationInputId);
    const locateBtn = document.getElementById('locate-btn'); // Assuming button ID is fixed or passed

    // "Enter" key on input
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchLocation(input.value);
        }
    });

    // Blur event (optional, might be annoying if typing slow)
    // input.addEventListener('blur', () => searchLocation(input.value));

    // Locate Me button
    if (locateBtn) {
        locateBtn.addEventListener('click', getCurrentLocation);
    }
}

async function searchLocation(query) {
    if (!query) return;

    // Nominatim Search API
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'ClimateCreditScoreEngine/1.0'
            }
        });
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const displayName = data[0].display_name;

            updateMarker(lat, lng, displayName);
        } else {
            console.warn("Location not found");
            // Optionally show UI feedback
        }
    } catch (e) {
        console.error("Geocoding error:", e);
    }
}

async function reverseGeocode(lat, lng) {
    // Nominatim Reverse Geocoding API
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'ClimateCreditScoreEngine/1.0'
            }
        });
        const data = await response.json();
        return data.display_name;
    } catch (e) {
        console.error("Reverse geocoding error:", e);
        return null;
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            updateMarker(lat, lng, "My Location");

            // Reverse geocode to fill input
            const address = await reverseGeocode(lat, lng);
            if (address && locationInputId) {
                document.getElementById(locationInputId).value = address;
                if (marker) marker.setPopupContent(address).openPopup();
            }
        },
        () => {
            alert("Unable to retrieve your location");
        }
    );
}

// Export functions if needed, or keeping global for simple use
window.initMap = initMap;

