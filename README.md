# InfoHub — AI-Powered Personal Data Rights & Privacy Management Platform

> Take back control of your personal data. Monitor where your data lives, understand privacy risks,
> detect breaches, and generate legally compliant deletion requests — all from one intelligent dashboard.

**Tech Stack:** Java 17 · Spring Boot 3 · React 18 · MySQL 8 · JWT · iText PDF · Recharts · Tailwind CSS  
**Font:** Times New Roman (all UI text)  
**Compliance:** GDPR · India DPDP Act · CCPA

---

## Project Structure

```
infohub/
├── backend/                  Spring Boot 3 (Java 17)
│   ├── src/main/java/com/infohub/backend/
│   │   ├── entity/           JPA entities
│   │   ├── repository/       Spring Data JPA repos
│   │   ├── service/          Business logic
│   │   ├── controller/       REST API controllers
│   │   ├── security/         JWT filter + UserDetails
│   │   ├── config/           Security + CORS + Jackson
│   │   └── dto/              Request/Response DTOs
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                 React 18 SPA
│   ├── src/
│   │   ├── pages/            All page components
│   │   ├── services/         Axios API client
│   │   ├── context/          AuthContext
│   │   └── index.css         Times New Roman + Tailwind
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml        Full stack orchestration
```

---

## Quick Start

### Prerequisites

- Java 17+
- Node.js 20+
- MySQL 8.x running locally  OR  Docker + Docker Compose

---

### Option A — Run with Docker Compose (Recommended)

```bash
# 1. Clone / open the project
cd infohub

# 2. (Optional) Set API keys
set OPENAI_API_KEY=sk-...
set HIBP_API_KEY=your-hibp-key

# 3. Start everything
docker-compose up --build

# App is live at:
#   Frontend  →  http://localhost:3000
#   Backend   →  http://localhost:8080
```

---

### Option B — Run Locally (Development)

#### Backend

```bash
# 1. Make sure MySQL is running on port 3306
#    Create database: infohub_db  (auto-created on first run)

cd infohub/backend

# 2. Edit src/main/resources/application.properties
#    Set spring.datasource.password=<your mysql root password>

# 3. Run
mvnw spring-boot:run
# Backend starts on http://localhost:8080
```

#### Frontend

```bash
cd infohub/frontend

npm install

npm start
# Frontend starts on http://localhost:3000
# Proxies /api/* → http://localhost:8080
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key for policy summarisation | `demo-key` (uses mock data) |
| `HIBP_API_KEY` | HaveIBeenPwned API key | `demo-key` (uses demo breaches) |
| `MAIL_USERNAME` | SMTP email address | `demo@infohub.app` |
| `MAIL_PASSWORD` | SMTP password | — |
| `SPRING_DATASOURCE_PASSWORD` | MySQL root password | `root` |

> **Demo mode:** When `OPENAI_API_KEY=demo-key`, the AI policy summary returns a realistic mock response.  
> When `HIBP_API_KEY=demo-key`, breach monitor returns 3 demo breaches (Adobe, LinkedIn, Dropbox).

---

## API Reference

All endpoints are prefixed `/api/`. Protected endpoints require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | Register new user |
| POST | `/api/auth/login` | ✗ | Login, returns JWT |
| GET | `/api/dashboard/summary` | ✓ | KPI summary |
| GET | `/api/dashboard/activity` | ✓ | Recent activity |
| GET | `/api/companies` | ✓ | Paginated company list |
| POST | `/api/companies` | ✓ | Add company |
| PUT | `/api/companies/{id}` | ✓ | Update company |
| DELETE | `/api/companies/{id}` | ✓ | Delete company |
| GET | `/api/risk/summary` | ✓ | Overall risk score |
| GET | `/api/risk/breakdown` | ✓ | Per-company risk |
| GET | `/api/risk/recommendations` | ✓ | AI recommendations |
| GET | `/api/breaches` | ✓ | All breaches |
| POST | `/api/breaches/check` | ✓ | Trigger HIBP check |
| PUT | `/api/breaches/{id}/acknowledge` | ✓ | Acknowledge breach |
| POST | `/api/deletion/generate` | ✓ | Generate PDF letter |
| GET | `/api/deletion/requests` | ✓ | All deletion requests |
| PUT | `/api/deletion/requests/{id}/status` | ✓ | Update status |
| GET | `/api/deletion/requests/{id}/pdf` | ✓ | Download PDF |
| POST | `/api/ai/summarize` | ✓ | AI policy summary |
| GET | `/api/notifications` | ✓ | All notifications |
| PUT | `/api/notifications/read-all` | ✓ | Mark all read |
| GET | `/api/settings` | ✓ | User preferences |
| PUT | `/api/settings/account` | ✓ | Update account |
| PUT | `/api/settings/security` | ✓ | Change password / 2FA |
| PUT | `/api/settings/notifications` | ✓ | Notification prefs |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero · Features · Stats/CTA (3 scrollable sections) |
| `/login` | Login | Animated network canvas · JWT auth |
| `/register` | Register | Account creation |
| `/dashboard` | Dashboard | KPI cards · charts · activity feed |
| `/data-ledger` | Data Ledger | CRUD table of all tracked companies |
| `/risk-analysis` | Risk Analysis | Risk gauge · company comparison · AI recs |
| `/breach-monitor` | Breach Monitor | HIBP integration · acknowledge alerts |
| `/deletion-requests` | Deletion Requests | PDF generation · status tracking · GDPR/DPDP/CCPA |
| `/notifications` | Notifications | Breach alerts · reminders · AI tips |
| `/settings` | Settings | Account · security · preferences · data export |
| `/policy-summary` | AI Policy Summary | URL → AI plain-language summary |

---

## Deletion Request Jurisdictions

| Jurisdiction | Legal Basis | Response Deadline |
|---|---|---|
| GDPR (EU) | Article 17 — Right to Erasure | 30 days |
| DPDP Act (India) | Section 13 — Right of Erasure | 30 days |
| CCPA (California) | Section 1798.105 — Right to Delete | 45 days |

---

## Design Decisions

- **Font:** Times New Roman across all UI for professional, document-grade typography
- **Colour palette:** Deep navy background (`#0a0f1e`) · Primary indigo (`#6C3FC5`) · Accent teal (`#00BFA6`)
- **Auth:** Stateless JWT (15-min access token pattern configurable in `application.properties`)
- **PDF:** iText 5 with Times Roman font to match UI branding
- **AI fallback:** Full mock responses when no OpenAI key is supplied — demo-ready out of the box
- **HIBP fallback:** 3 realistic demo breaches served when no HIBP key is supplied

---

## License

© 2026 InfoHub. All rights reserved.
