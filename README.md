# Internship Management System

A full-stack web application for managing internship students, projects, tasks, and daily work logs.

## 🚀 Technologies

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Database | MongoDB |
| Frontend | React 18, Material-UI |
| Build Tools | Maven, npm |

## ✨ Features

### Admin Features
- 🔐 JWT Authentication & Authorization
- 👥 User Management (CRUD, Activate/Deactivate)
- 📁 Project Management (Create, Assign, Track)
- 📋 Task Management (TODO, IN_PROGRESS, COMPLETED)
- 📊 Dashboard with Real-time Statistics
- 📝 Daily Log Management with Feedback
- 📈 Reports & Analytics

### Intern Features
- 🔐 Secure Login
- 📁 View Assigned Projects
- 📋 View Assigned Tasks
- 📝 Update Task Status
- 📊 Submit Daily Work Logs
- 💬 View Supervisor Feedback

## 🛠️ Installation

### Prerequisites
- Java 17+
- MongoDB 7.0+
- Node.js 18+
- npm 9+

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run

###Frontend Setup
cd frontend
npm install
npm start

Default Admin Credentials
Email: admin@test.com
Password: admin123

