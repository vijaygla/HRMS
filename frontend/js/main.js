// This file contains the main logic for the frontend application.

document.addEventListener("DOMContentLoaded", function() {
    // Initialize application
    console.log("HRMS Frontend Initialized");

    // Add event listeners for navigation
    document.getElementById("loginLink").addEventListener("click", function() {
        window.location.href = "login.html";
    });

    document.getElementById("dashboardLink").addEventListener("click", function() {
        window.location.href = "dashboard.html";
    });

    document.getElementById("employeesLink").addEventListener("click", function() {
        window.location.href = "employees.html";
    });

    document.getElementById("payrollLink").addEventListener("click", function() {
        window.location.href = "payroll.html";
    });

    document.getElementById("recruitmentLink").addEventListener("click", function() {
        window.location.href = "recruitment.html";
    });

    document.getElementById("leavesLink").addEventListener("click", function() {
        window.location.href = "leaves.html";
    });

    document.getElementById("performanceLink").addEventListener("click", function() {
        window.location.href = "performance.html";
    });
});