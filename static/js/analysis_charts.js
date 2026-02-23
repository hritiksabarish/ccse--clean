// analysis_charts.js
let riskRadarChart, tempTrendChart, compositionChart;

function initAnalysisCharts() {
    const radarCtx = document.getElementById('riskRadarChart').getContext('2d');
    const lineCtx = document.getElementById('tempTrendChart').getContext('2d');
    const doughnutCtx = document.getElementById('compositionChart').getContext('2d');

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } },
                ticks: { display: false },
                suggestedMin: 0,
                suggestedMax: 100
            }
        }
    };

    // Radar Chart
    riskRadarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['Flood', 'Heat', 'Storm', 'Drought', 'Sea Level'],
            datasets: [{
                label: 'Risk Level',
                data: [65, 59, 90, 81, 56],
                fill: true,
                backgroundColor: 'rgba(255, 159, 67, 0.2)',
                borderColor: '#ff9f43',
                pointBackgroundColor: '#ff9f43',
                pointBorderColor: '#fff',
            }]
        },
        options: commonOptions
    });

    // Line Chart
    tempTrendChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['2000', '2010', '2020', '2030', '2040'],
            datasets: [{
                data: [28, 29, 31, 33, 35],
                borderColor: '#ffbe76',
                backgroundColor: 'rgba(255, 190, 118, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: { display: false },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } }
                }
            }
        }
    });

    // Doughnut Chart
    compositionChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Urban', 'Forest', 'Water', 'Agri'],
            datasets: [{
                data: [40, 25, 15, 20],
                backgroundColor: [
                    'rgba(255, 159, 67, 0.8)',
                    'rgba(0, 255, 157, 0.6)',
                    'rgba(0, 243, 255, 0.6)',
                    'rgba(255, 215, 0, 0.6)'
                ],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: { color: 'rgba(255, 255, 255, 0.5)', boxWidth: 10, font: { size: 10 } }
                }
            }
        }
    });
}

function updateAnalysisCharts(location) {
    // Simulated data change based on location string hash
    const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Update Radar
    riskRadarChart.data.datasets[0].data = [
        40 + (hash % 50),
        30 + (hash % 60),
        50 + (hash % 40),
        20 + (hash % 70),
        10 + (hash % 80)
    ];

    // Update Line
    const startTemp = 25 + (hash % 5);
    tempTrendChart.data.datasets[0].data = [
        startTemp, startTemp + 1, startTemp + 2, startTemp + 4, startTemp + 6
    ];

    // Update Doughnut
    const urban = 20 + (hash % 40);
    const forest = 10 + (hash % 30);
    const water = 5 + (hash % 20);
    const agri = 100 - (urban + forest + water);
    compositionChart.data.datasets[0].data = [urban, forest, water, agri];

    riskRadarChart.update();
    tempTrendChart.update();
    compositionChart.update();
}

window.initAnalysisCharts = initAnalysisCharts;
window.updateAnalysisCharts = updateAnalysisCharts;
