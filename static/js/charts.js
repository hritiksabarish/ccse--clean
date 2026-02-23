function renderTimelineChart(data) {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2030', '2040', '2050', '2070'],
            datasets: [{
                label: 'Projected Risk Level',
                data: data,
                borderColor: '#64ffda',
                backgroundColor: 'rgba(100, 255, 218, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0a192f',
                pointBorderColor: '#64ffda',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#8892b0' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#8892b0' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#8892b0' }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function renderPortfolioPie(data) {
    const ctx = document.getElementById('riskPieChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High Risk', 'Medium Risk', 'Low Risk'],
            datasets: [{
                data: [12, 35, 53], // Dummy data
                backgroundColor: ['#ef4444', '#f6e05e', '#64ffda'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#fff' } }
            }
        }
    });
}

function updateLoanAdjustment(score) {
    const el = document.getElementById('loan-adjustment');
    if (!el) return;

    let text = "";
    if (score > 80) text = "✅ No Rate Adjustment (Safe)";
    else if (score >= 60) text = "⚠️ +0.5% Interest Rate Adjustment";
    else if (score >= 40) text = "⚠️ +1.0% Interest Rate Adjustment";
    else text = "🛑 +1.5% Interest Rate Adjustment (High Risk)";

    el.innerText = text;
}
