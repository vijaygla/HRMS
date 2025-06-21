// This file contains logic specific to the leaves page.

// Function to fetch leave requests
function fetchLeaveRequests() {
    fetch('/api/leaves')
        .then(response => response.json())
        .then(data => {
            displayLeaveRequests(data);
        })
        .catch(error => {
            console.error('Error fetching leave requests:', error);
        });
}

// Function to display leave requests
function displayLeaveRequests(leaves) {
    const leavesTable = document.getElementById('leavesTable');
    leavesTable.innerHTML = '';

    leaves.forEach(leave => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${leave.id}</td>
            <td>${leave.employeeName}</td>
            <td>${leave.startDate}</td>
            <td>${leave.endDate}</td>
            <td>${leave.status}</td>
        `;
        leavesTable.appendChild(row);
    });
}

// Function to submit a new leave request
function submitLeaveRequest(event) {
    event.preventDefault();

    const leaveData = {
        employeeId: document.getElementById('employeeId').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        reason: document.getElementById('reason').value
    };

    fetch('/api/leaves', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(leaveData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Leave request submitted:', data);
        fetchLeaveRequests(); // Refresh the leave requests
    })
    .catch(error => {
        console.error('Error submitting leave request:', error);
    });
}

// Event listener for the leave request form
document.getElementById('leaveRequestForm').addEventListener('submit', submitLeaveRequest);

// Initial fetch of leave requests
fetchLeaveRequests();