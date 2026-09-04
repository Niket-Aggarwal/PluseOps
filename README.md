# ⚡ PulseOps

### Real-time Uptime & Performance Monitoring for Modern Applications

PulseOps is a lightweight service monitoring platform that helps users monitor the **availability, response time, and health of their applications and APIs**.

Users can add a service URL, choose a monitoring interval, and view real-time monitoring results through a clean dashboard. PulseOps automatically checks services in the background, records monitoring history, tracks failures, and provides a public status page.

## 🚀 Features

* 🔐 **Google Authentication**
* 📊 **Monitoring Dashboard**
* 🌐 **API/Website Monitoring**
* ⏱️ **Custom Monitoring Intervals**
* 🟢 **UP / DOWN / UNKNOWN Status**
* ⚡ **Response Time Tracking**
* 📈 **Monitoring History**
* 🔁 **Automatic Background Checks**
* 🚨 **Failure Tracking & Alerts**
* 📋 **Project Management**
* 🔗 **Public Status Pages**
* 📱 **Responsive UI**
* 🔒 **JWT-secured API access**
* 🛡️ **Basic protection against unsafe monitoring targets**

# 🏗️ Architecture

PulseOps consists of three main application parts:

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │      PulseOps       │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Node + Express    │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                               ▼
                         ┌───────────┐
                         │  MongoDB  │
                         └─────▲─────┘
                               │
                               │
                    ┌──────────┴──────────┐
                    │    Node Worker      │
                    │   Cron Scheduler    │
                    └──────────┬──────────┘
                               │
                               ▼
                       Monitored Services
```

### Frontend

The React frontend provides:

* Login
* Dashboard
* Project management
* Monitoring status
* History
* Public status pages

### Backend

The Node.js/Express backend handles:

* Authentication
* JWT verification
* Project APIs
* Database operations
* Ownership and authorization
* Monitoring data retrieval
* Public status APIs

### Worker

The worker runs independently from the backend.

It handles:

* Scheduling checks
* HTTP requests to monitored services
* Response-time measurement
* UP/DOWN detection
* History creation
* Project status updates
* Failure tracking
* Alert handling

# 📁 Project Structure

```text
PulseOps/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── worker/
│   ├── services/
│   ├── scheduler/
│   ├── utils/
│   ├── worker.js
│   └── package.json
│
└── README.md
```

> The exact folder names may vary depending on the implementation.

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* JavaScript
* React Router
* CSS
* Fetch API

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Google Authentication

## Worker

* Node.js
* node-cron
* HTTP/HTTPS requests

## Database

* MongoDB

## Notifications

* Nodemailer
* SMTP email service

---

# 🔐 Authentication

PulseOps uses Google authentication for users.

After successful authentication, the application uses a JWT to authorize protected backend requests.

Authenticated requests use:

```http
Authorization: Bearer <JWT>
```

The frontend does not manually send a `userId`.

The backend identifies the authenticated user from the JWT.

---

# 📊 Monitoring

A user can create a project by providing:

```text
Project Name
Base URL
Monitoring Interval
Description
```

For example:

```text
Name: My API
URL: https://example.com
Interval: 5 minutes
Description: Production API
```

The worker checks services according to their individual schedules.

---

# 🟢 Monitoring Status

PulseOps supports three primary project states:

### UP

The monitored service responded successfully.

Generally, a successful 2xx HTTP response is considered UP.

### DOWN

The service failed to respond successfully.

Examples include:

* HTTP 4xx/5xx responses
* Timeout
* DNS failure
* Network failure

### UNKNOWN

The service has not yet produced a monitoring result or its state is not currently known.

---

# ⏱️ Response Time

For each monitoring check, PulseOps records the approximate response time.

Example:

```text
Status: UP
Response Time: 142 ms
HTTP Status: 200
```

This allows users to monitor not only availability but also performance.

---

# 📜 Monitoring History

Each monitoring check can create a history record containing information such as:

```text
Checked At
Status
HTTP Status
Response Time
Message
Error Type
Timeout
Response Received
```

History is displayed newest first.

The frontend uses pagination instead of loading unlimited records.

PulseOps does not store complete monitored API response bodies or sensitive headers.

---

# 🚨 Failure Tracking

PulseOps tracks consecutive failures for each project.

Example:

```text
Failure 1 → No alert
Failure 2 → No alert
Failure 3 → Alert
Failure 4 → No duplicate alert
Failure 5 → No duplicate alert
```

When the service recovers:

```text
DOWN → UP
```

the consecutive failure count is reset.

This prevents repeated alerts for the same outage.

---

# 🔗 Public Status Page

Each project can have a public status page.

Example:

```text
/status/<publicStatusId>
```

The public page can show:

* Service name
* Current status
* Last checked
* Response time
* Uptime if available
* Safe status message
* Last update

Sensitive information is not exposed.

The public status page does **not** require authentication.

---

# 🔒 Security

PulseOps follows several basic security practices:

* JWT authentication for protected APIs
* Backend ownership checks
* No user-controlled `userId` for authorization
* Sensitive credentials stored in environment variables
* No MongoDB credentials in frontend code
* No JWT secrets in frontend code
* No sensitive monitoring response bodies stored
* Public status pages expose only safe information
* HTTP/HTTPS URL validation
* Basic protection against localhost/private network monitoring targets

---

# ⚙️ Environment Variables

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Backend

The exact variables depend on the backend implementation.

Typical configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FRONTEND_URL=http://localhost:5173
```

---

## Worker

Typical configuration:

```env
MONGODB_URI=your_mongodb_connection_string

EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_sender_email
```

Never commit real credentials to GitHub.

Use `.env.example` files to document required variables.

---

# 🚀 Installation

Clone the repository:

```bash
git clone <repository-url>
cd PulseOps
```

Then install dependencies separately.

## Frontend

```bash
cd frontend
npm install
```

## Backend

```bash
cd ../backend
npm install
```

## Worker

```bash
cd ../worker
npm install
```

---

# ▶️ Running the Project

PulseOps requires the **frontend, backend, and worker** to run as separate processes.

## 1. Start MongoDB

Make sure your MongoDB database is running or use a MongoDB Atlas database.

---

## 2. Start Backend

```bash
cd backend
npm run dev
```

The backend will normally run on:

```text
http://localhost:5000
```

The actual port depends on your environment configuration.

---

## 3. Start Worker

Open another terminal:

```bash
cd worker
npm run dev
```

The worker should remain running in the background so that scheduled monitoring checks can execute.

---

## 4. Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite will provide a local development URL, commonly:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# 🔄 Application Flow

The basic user flow is:

```text
User
 │
 ▼
PulseOps Login
 │
 ▼
Google Authentication
 │
 ▼
JWT Authentication
 │
 ▼
Dashboard
 │
 ▼
Create Monitoring Project
 │
 ▼
Backend stores project
 │
 ▼
Worker detects scheduled check
 │
 ▼
Worker sends HTTP request
 │
 ▼
Result stored in MongoDB
 │
 ▼
Backend provides result
 │
 ▼
Frontend displays:
UP / DOWN / UNKNOWN
 │
 ▼
History & Public Status Page
```

---

# 🔌 API Endpoints

The backend provides APIs for project management and monitoring data.

### Projects

```http
POST   /projects
GET    /projects
GET    /projects/:id
PUT    /projects/:id
PATCH  /projects/:id/toggle
DELETE /projects/:id
```

### Monitoring

```http
GET /projects/:id/latest
GET /projects/:id/history?page=1&limit=50
GET /projects/:projectId/history/:historyId
```

### Public Status

```http
GET /public/status/:publicStatusId
```

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

The public status endpoint does not require authentication.

---

# 🧪 Testing Checklist

Before deployment, verify:

### Authentication

* [ ] Google login works
* [ ] JWT is received correctly
* [ ] Protected routes require authentication
* [ ] Logout works

### Projects

* [ ] Create project
* [ ] View projects
* [ ] View project details
* [ ] Edit project
* [ ] Enable/disable monitoring
* [ ] Delete project

### Monitoring

* [ ] Worker starts correctly
* [ ] Scheduled checks execute
* [ ] UP services are detected
* [ ] DOWN services are detected
* [ ] Response time is recorded
* [ ] Failures are counted
* [ ] Alerts do not duplicate

### History

* [ ] Latest check appears
* [ ] History is stored
* [ ] History pagination works
* [ ] History details work

### Public Status

* [ ] Public status page works
* [ ] Authentication is not required
* [ ] Sensitive information is not exposed

---

# 🛡️ Important Design Principle

PulseOps separates responsibilities:

```text
Frontend
→ Displays data and interacts with users

Backend
→ Authentication, APIs, authorization and database access

Worker
→ Monitoring, scheduling and background processing

MongoDB
→ Persistent data storage
```

The frontend does **not** perform monitoring itself.

The worker does **not** handle frontend requests.

The backend acts as the API layer between the frontend and database.

---

# 💡 Why PulseOps?

Modern applications depend on many APIs and services.

A service can become:

* unavailable
* slow
* unreliable
* intermittently failing

PulseOps provides a simple way to monitor these services and understand their health from a single dashboard.

Instead of manually checking services, users can let PulseOps monitor them automatically.

---

# 🎯 Hackathon Focus

PulseOps focuses on:

* Simple setup
* Automated monitoring
* Real-time visibility
* Performance awareness
* Failure detection
* Useful monitoring history
* Shareable public status pages
* Lightweight architecture

The goal is to provide a practical monitoring experience without requiring complicated infrastructure.

---

# 📌 Future Improvements

Possible future enhancements include:

* Advanced uptime analytics
* Response-time graphs
* Maintenance windows
* Multiple notification channels
* Slack/Discord notifications
* Team collaboration
* Incident management
* Custom alert rules
* More detailed performance metrics
* Deployment integrations
* Mobile application

---

# 👥 Team

**Project:** PulseOps

**Built for:** Hackathon Project

### Contributors

* Frontend: PulseOps Team
* Backend: PulseOps Team
* Worker/Monitoring: PulseOps Team

---

# 📄 License

This project is created for educational and hackathon purposes.

Add an appropriate open-source license if the project is later released publicly.

---

## ⚡ PulseOps

**Monitor smarter. Detect faster. Stay online.**