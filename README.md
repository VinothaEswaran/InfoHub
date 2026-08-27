# InfoHub — AI-Powered Privacy Management Platform

InfoHub is a web application that helps users manage and protect their personal data. It allows users to track companies holding their data, identify privacy risks, monitor data breaches, generate deletion requests, and get AI-powered privacy recommendations.

## Tech Stack

- Java 17
- Spring Boot 3
- React 18
- MySQL 8
- JWT Authentication
- iText PDF
- Recharts
- Tailwind CSS

## Key Features

- User Registration and Login
- JWT Authentication
- Personal Data and Company Tracking
- Privacy Risk Analysis
- Data Breach Monitoring
- AI-Powered Privacy Recommendations
- AI Policy Summarization
- GDPR, DPDP Act and CCPA Support
- PDF Deletion Request Generation
- Notifications and Alerts
- Account and Security Settings

## Privacy Regulations

- GDPR – Right to Erasure
- India DPDP Act – Right of Erasure
- CCPA – Right to Delete

## How to Run

### Backend

```bash
cd backend
mvnw spring-boot:run
```
Backend runs at:

http://localhost:8080

### Frontend

````bash
cd frontend
npm install
npm start
````
Frontend runs at:

http://localhost:3000

## Demo Mode

The application supports demo mode without external API keys.

- AI features use mock responses when an OpenAI API key is not provided.
- Breach monitoring uses demo breach data when an HIBP API key is not provided.

## Project Purpose

InfoHub provides a simple dashboard to help users understand, monitor, and control how their personal data is handled by organizations.
