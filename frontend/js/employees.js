// This file contains logic specific to the employees page.

// Function to fetch and display employee data
function fetchEmployees() {
    fetch('/api/employees')
        .then(response => response.json())
        .then(data => {
            const employeeList = document.getElementById('employee-list');
            employeeList.innerHTML = '';
            data.forEach(employee => {
                const listItem = document.createElement('li');
                listItem.textContent = `${employee.name} - ${employee.position}`;
                employeeList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching employees:', error));
}

// Function to add a new employee
function addEmployee() {
    const name = document.getElementById('employee-name').value;
    const position = document.getElementById('employee-position').value;

    fetch('/api/employees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, position }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Employee added:', data);
        fetchEmployees(); // Refresh the employee list
    })
    .catch(error => console.error('Error adding employee:', error));
}

// Event listener for the add employee form
document.getElementById('add-employee-form').addEventListener('submit', function(event) {
    event.preventDefault();
    addEmployee();
});

// Initial fetch of employees when the page loads
document.addEventListener('DOMContentLoaded', fetchEmployees);