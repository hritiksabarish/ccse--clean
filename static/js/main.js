document.addEventListener('DOMContentLoaded', () => {

    const analysisForm = document.getElementById('analysis-form');

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Analysis Form Handling
    if (analysisForm) {
        const locationInput = document.getElementById('location');

        // Live map update on blur (simple implementation)
        locationInput.addEventListener('blur', (e) => {
            if (e.target.value && typeof updateMapLocation === 'function') {
                updateMapLocation(e.target.value);
            }
        });

        analysisForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = analysisForm.querySelector('button[type="submit"]');
            const loading = document.getElementById('loading');

            btn.style.display = 'none';
            loading.style.display = 'block';

            // Real API Call
            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        location: locationInput.value,
                        // Add other form fields if needed
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    // Redirect to results with the new property ID
                    window.location.href = `/results?id=${data.id}`;
                } else {
                    alert("Analysis failed. Please try again.");
                    btn.style.display = 'block';
                    loading.style.display = 'none';
                }
            } catch (error) {
                console.error('Error:', error);
                alert("An error occurred. Please try again.");
                btn.style.display = 'block';
                loading.style.display = 'none';
            }
        });
    }

    // Portfolio Data Loading
    if (document.getElementById('portfolio-table-body')) {
        loadPortfolioData();
        if (typeof renderPortfolioPie === 'function') renderPortfolioPie();
    }
});

function loadPortfolioData() {
    const tbody = document.getElementById('portfolio-table-body');
    if (!tbody) return;

    fetch('/api/portfolio')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                // Fallback dummy data if DB empty
                data = [
                    { id: 'P-101', input: { location: 'Miami Beach, FL' }, result: { score: 45, risks: { flood: 'High' } } },
                    { id: 'P-102', input: { location: 'Austin, TX' }, result: { score: 72, risks: { heat: 'Medium' } } },
                    { id: 'P-103', input: { location: 'Denver, CO' }, result: { score: 92, risks: { storm: 'Low' } } },
                ];
            }

            tbody.innerHTML = '';
            data.forEach(item => {
                const score = item.result.score;
                let badgeClass = score >= 80 ? 'text-green' : (score >= 50 ? 'text-amber' : 'text-red');
                let riskLabel = score >= 80 ? 'Low' : (score >= 50 ? 'Medium' : 'High');

                const tr = document.createElement('tr');
                tr.style.cssText = "border-bottom: 1px solid rgba(255,255,255,0.05);";
                tr.innerHTML = `
                    <td style="padding: 1rem;">${item.id || 'N/A'}</td>
                    <td style="padding: 1rem;">${item.input.location}</td>
                    <td style="padding: 1rem;">
                        <span style="font-weight: bold; font-size: 1.1rem; color: var(--text-primary);">${score}</span>
                    </td>
                    <td style="padding: 1rem;">
                        <span class="${badgeClass}">${riskLabel}</span>
                    </td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">View</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Initialize portfolio map if needed
            if (typeof initMap === 'function') {
                initMap('portfolio-map', 39.8283, -98.5795); // Center of US
                // Add markers for portfolio items (mock)
                data.forEach(item => {
                    // Randomized spread for visual effect on single map
                    addMarker(39.8283 + (Math.random() * 10 - 5), -98.5795 + (Math.random() * 20 - 10), item.input.location);
                });
            }
        })
        .catch(err => console.error(err));
}
