EduSupport — Student Support & Ticket Management System

A role-based student support platform for raising, assigning, tracking, and resolving student requests.

Live Demo

Frontend: https://education-support-ticket-management.vercel.app

Backend API: https://education-support-ticket-management.onrender.com

GitHub: https://github.com/sangamesh-4/Education-Support-Ticket-Management-.git

Overview

EduSupport manages student support requests across areas such as:

Fees

Attendance

ID Cards

Documents

Certificates

Other administrative requests

The system provides ownership, priority, SLA tracking, status management, activity history, and management visibility.

Roles

Role

Main Capabilities

Student

Create and view own support requests

Staff

View, assign, prioritize, update, resolve and close tickets

Manager

View ticket operations and management dashboard

Ticket Workflow

OPEN → ASSIGNED → IN_PROGRESS → PENDING → RESOLVED → CLOSED

Priorities & SLA

Priority

SLA

LOW

72 hours

MEDIUM

48 hours

HIGH

24 hours

URGENT

8 hours

Overdue active tickets are highlighted for operational follow-up.

Key Features

JWT authentication

Role-based access control

Student ticket creation

Staff assignment and ownership

Priority and status management

SLA due-date calculation

Overdue ticket visibility

Ticket activity/history tracking

Resolution and closure tracking

Staff and manager dashboards

PostgreSQL persistence

Responsive React interface

Architecture

React + Vite
     │
     │ REST / JSON
     ▼
FastAPI
     │
     ├── Authentication & RBAC
     ├── Ticket Management
     ├── Assignment
     ├── Status & Priority
     ├── SLA & Ageing
     ├── Activity History
     └── Dashboard
     │
     ▼
PostgreSQL

Tech Stack

Frontend

React

Vite

JavaScript

Backend

FastAPI

SQLAlchemy

JWT

Pydantic

Database

PostgreSQL

Deployment

Vercel — frontend

Render — backend and PostgreSQL

Demo Credentials

Role

Email

Password

Student

student@edusupport.com

student123

Staff

staff@edusupport.com

staff123

Manager

manager@edusupport.com

manager123

Local Setup

1. Clone the repository

git clone https://github.com/sangamesh-4/Education-Support-Ticket-Management-.git
cd Education-Support-Ticket-Management-

2. Backend

cd backend
python -m venv venv

Windows:

.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend runs at:

http://127.0.0.1:8000

3. Frontend

cd frontend
npm install
npm run dev

Frontend runs at:

http://localhost:5173

A PostgreSQL database is required for local execution. The project configuration uses PostgreSQL on port 5433 for the Docker-based local database setup.

Validation

The deployed system was tested across all three roles:

Student login and ticket creation

Staff ticket visibility and management

Assignment and priority changes

Full ticket status lifecycle

Activity history

Resolution and closure

Manager dashboard visibility

Production database persistence

Frontend-to-backend communication

Authentication and role-based access

Product Decisions & Scope

The prototype intentionally keeps the architecture simple and practical:

REST-based monolithic backend

PostgreSQL relational data model

Manual staff/manager escalation for overdue tickets

No external notification infrastructure

No microservices or complex event infrastructure

No autonomous AI dependency for core ticket operations

These choices keep the core workflow reliable and easy to explain while leaving room for future extensions.

Known Limitation

Overdue tickets are surfaced through dashboard indicators and can be manually escalated or reassigned. Email/WhatsApp notifications are outside the current prototype scope.

AI Usage

AI assistance was used during development for implementation guidance, debugging, and code suggestions. Generated code was reviewed, modified where necessary, and validated through local and deployed testing.

See AI_USAGE_REPORT.md for the detailed AI Usage Report required by the assignment.

Project Structure

EduSupport/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   └── schemas/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── AI_USAGE_REPORT.md
└── README.md

Status

Working prototype — deployed and validated.
