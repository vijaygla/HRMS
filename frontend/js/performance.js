// This file contains logic specific to the performance page.

// Function to fetch performance data
async function fetchPerformanceData() {
    try {
        const response = await fetch('/api/performance');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displayPerformanceData(data);
    } catch (error) {
        console.error('Error fetching performance data:', error);
    }
}

// Function to display performance data
function displayPerformanceData(data) {
    const performanceContainer = document.getElementById('performance-data');
    performanceContainer.innerHTML = ''; // Clear previous data

    data.forEach(performance => {
        const performanceItem = document.createElement('div');
        performanceItem.className = 'performance-item';
        performanceItem.innerHTML = `
            <h3>${performance.employeeName}</h3>
            <p>Score: ${performance.score}</p>
            <p>Comments: ${performance.comments}</p>
        `;
        performanceContainer.appendChild(performanceItem);
    });
}

// Event listener for page load
document.addEventListener('DOMContentLoaded', () => {
    fetchPerformanceData();
});