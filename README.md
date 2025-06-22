# HRMS Project

## Overview
The HRMS (Human Resource Management System) project is designed to manage various HR-related functions such as employee management, payroll processing, recruitment, leave management, and performance tracking. This project is structured into two main components: a backend built with Spring Boot and a frontend built with HTML, CSS, and JavaScript.

## Project Structure
The project is organized as follows:

```
HRMS/
├── backend/                # Backend application
│   ├── src/                # Source code
│   │   └── main/
│   │       ├── java/       # Java source files
│   │       │   └── com/
│   │       │       └── hrms/
│   │       │           ├── HrmsApplication.java
│   │       │           ├── config/                # Configuration classes
│   │       │           ├── controller/             # REST controllers
│   │       │           ├── model/                  # Entity models
│   │       │           ├── repository/             # Data repositories
│   │       │           ├── service/                # Business logic services
│   │       │           └── dto/                    # Data transfer objects
│   │       └── resources/   # Resource files
│   ├── pom.xml            # Maven configuration
│   └── target/            # Compiled classes and artifacts
├── frontend/               # Frontend application
│   ├── index.html         # Main HTML file
│   ├── login.html         # Login page
│   ├── dashboard.html      # Dashboard page
│   ├── employees.html      # Employees page
│   ├── payroll.html        # Payroll page
│   ├── recruitment.html     # Recruitment page
│   ├── leaves.html         # Leaves page
│   ├── performance.html     # Performance page
│   ├── css/                # CSS stylesheets
│   ├── js/                 # JavaScript files
│   └── assets/             # Image and icon assets
└── README.md               # Project documentation
```

## Backend
The backend is built using Spring Boot and provides RESTful APIs for the frontend to interact with. It includes:

- **Controllers**: Handle incoming requests and return responses.
- **Services**: Contain business logic.
- **Repositories**: Interface with the database.
- **Models**: Represent the data structure.

## Frontend
The frontend is a web application that allows users to interact with the HRMS. It includes:

- **HTML files**: Structure the web pages.
- **CSS files**: Style the web pages.
- **JavaScript files**: Add interactivity and handle client-side logic.

## Getting Started
To run the project, follow these steps:

1. **Backend**:
   - Navigate to the `backend` directory.
   - Use Maven to build the project: `mvn clean install`.
   - Run the application: `mvn spring-boot:run`.

2. **Frontend**:
   - Open the `frontend` directory in a web browser.
   - Access the application through the appropriate HTML files.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.

## 