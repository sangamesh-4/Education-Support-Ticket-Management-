EduSupport

Student Support & Ticket Management System

EduSupport is a full-stack student support and ticket management system
for educational institutions.

Students can raise requests for fees, attendance, ID cards, documents,
certificates, and other administrative matters. Staff can assign,
prioritize, process, and resolve tickets, while managers get visibility
into the overall support workload.

The prototype focuses on clear ownership, SLA visibility, traceability,
and a practical implementation that can be demonstrated and extended.

1. Project Overview

Problem

Student support requests can become difficult to manage when they do not
have clear ownership, priority, status, SLA tracking, or history.
Students may not know the state of a request, staff may miss important
requests, and managers may lack visibility into the workload.

Solution

EduSupport represents every request as a trackable ticket.

A student creates a ticket with:

Category

Subject

Description

Priority

The system automatically records the ticket number, owner, creation
time, SLA, due time, and initial status.

Staff can:

View and assign tickets

Change priority and status

Process requests

Mark tickets as pending

Resolve and close tickets

Review activity history

Managers can view operational metrics and intervene in ticket
processing.

Key Features

JWT authentication and role-based access

Student, Staff, and Manager dashboards

Ticket creation and tracking

Ticket assignment and ownership

Priority management

SLA and due-date calculation

Overdue ticket detection

Pending workflow

Resolution and closure tracking

Activity history

Management dashboard

Backend validation and authorization

2. User Roles & Permissions

Operation            Student   Staff   Manager

Login                    Yes     Yes       Yes
Create ticket            Yes      No        No
View own tickets         Yes     Yes       Yes
View all tickets          No     Yes       Yes
View activity            Own     Yes       Yes
Assign ticket             No     Yes       Yes
Change priority           No     Yes       Yes
Change status             No     Yes       Yes
View dashboard            No     Yes       Yes

Student

Students can create and track their own support requests, including
status, priority, SLA, due date, and activity history.

Students cannot assign tickets, change staff-controlled ticket fields,
or access another student's ticket.

Staff

Staff manage the support queue, assign tickets, update priority and
status, review SLA information, and process requests through the ticket
lifecycle.

Manager

Managers have operational visibility through dashboard metrics and can
also review and intervene in ticket processing.

3. Ticket Workflow

Categories

FEES

ATTENDANCE

ID_CARD

DOCUMENTS

CERTIFICATES

OTHER

Status Lifecycle

OPEN → ASSIGNED → IN_PROGRESS → PENDING → RESOLVED → CLOSED

Status        Meaning

OPEN          Ticket created but not assigned
ASSIGNED      Ticket assigned to staff
IN_PROGRESS   Staff is actively working on it
PENDING       Waiting for information or action
RESOLVED      Requested support action completed
CLOSED        Support lifecycle completed

Assigning an OPEN ticket automatically moves it to ASSIGNED.

PENDING is used when progress depends on information or action from
the student or another party.

Priority & SLA

Priority          SLA

LOW          72 hours
MEDIUM       48 hours
HIGH         24 hours
URGENT        8 hours

The due time is calculated when the ticket is created:

Due Time = Created Time + SLA Hours

A ticket is considered overdue when its due time has passed and its
status is not RESOLVED or CLOSED.

Overdue tickets are surfaced through the dashboard.

Escalation

The prototype uses lightweight escalation rather than background workers
or notification infrastructure.

Managers can identify overdue tickets from the dashboard and intervene
through assignment or status updates.

A production version could add automatic escalation, SLA warnings,
notifications, and reassignment.

4. Architecture

┌─────────────────────────────┐
│          Frontend           │
│       React + Vite          │
│                             │
│ Student / Staff / Manager   │
│ Dashboards & Ticket UI      │
└──────────────┬──────────────┘
               │ REST / JSON
               ▼
┌─────────────────────────────┐
│           Backend           │
│           FastAPI           │
│                             │
│ Auth / RBAC                 │
│ Ticket Management           │
│ Assignment / SLA            │
│ Activity / Dashboard        │
└──────────────┬──────────────┘
               │ SQLAlchemy
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
│                             │
│ users                       │
│ tickets                     │
│ ticket_activities           │
└─────────────────────────────┘

Technology Stack

Frontend - React - Vite - JavaScript - CSS - Fetch API

Backend - Python - FastAPI - SQLAlchemy - Pydantic - JWT - Passlib /
Bcrypt

Database & Infrastructure - PostgreSQL - Docker - Docker Compose

Why This Stack?

React provides a simple component-based UI.

FastAPI provides REST APIs, validation, dependency injection, and
automatic API documentation.

PostgreSQL fits the relational nature of users, tickets, and
activities.

SQLAlchemy provides the ORM layer.

JWT provides authentication for protected API requests.

Docker provides a consistent local PostgreSQL environment.

5. Database Design

Users

Stores system users and their roles.

id
name
email
password_hash
role
department
created_at

Roles:

STUDENT
STAFF
MANAGER

Passwords are stored as hashes.

Tickets

Stores support requests.

id
ticket_number
student_id
assigned_to
category
subject
description
status
priority
created_at
updated_at
due_at
resolved_at
closed_at
sla_hours

student_id identifies the ticket owner and assigned_to identifies
the current staff owner.

Ticket Activities

Stores important ticket events.

id
ticket_id
user_id
activity_type
description
created_at

This provides a chronological activity trail for creation, assignment,
status changes, and priority changes.

Relationships

Users
 ├── student_id ──┐
 └── assigned_to ─┤
                  ▼
               Tickets
                  │
                  │ ticket_id
                  ▼
          Ticket Activities

6. Backend & API

Authentication

POST /auth/login

The backend:

Finds the user.

Verifies the password hash.

Creates a JWT containing the user ID and role.

Returns the access token.

Protected requests use the token for authentication.

Authorization

Permissions are enforced at the backend API level.

Examples:

require_roles("STUDENT")

for student-only operations and:

require_roles("STAFF", "MANAGER")

for staff/manager operations.

Students can only retrieve tickets they own.

Ticket APIs

POST   /tickets/
GET    /tickets/
GET    /tickets/{ticket_id}
PATCH  /tickets/{ticket_id}
GET    /tickets/{ticket_id}/activities

Students create tickets through POST /tickets/.

Staff and Managers can update:

Status

Priority

Assignment

Dashboard API

GET /dashboard/summary

Returns counts for:

Total tickets

Open

Assigned

Unassigned

In progress

Pending

Resolved

Closed

Overdue

Urgent

Backend Validation

The backend validates:

Authentication

Role permissions

Ticket existence

Student ticket ownership

Valid priority

Valid status

Assigned user existence

Assigned user role

A ticket can only be assigned to a STAFF user.

7. Frontend

Login

Users enter their email and password. After successful authentication,
the frontend reads the role from the JWT and loads the appropriate
dashboard.

Student Dashboard

Students can:

View their tickets

Create new requests

View status and priority

View SLA and due time

View ticket details

View activity history

Staff Dashboard

Staff can view the support queue and manage:

Assignment

Status

Priority

SLA information

Ticket activity

Manager Dashboard

Managers can view operational metrics and inspect:

Tickets

Assignment

Priority

Status

SLA

Due date

Activity history

Ticket Details

The ticket detail view displays:

Ticket number

Subject

Description

Category

Status

Priority

Assigned staff

SLA

Due time

Activity history

8. Product Decisions & Trade-offs

Assumptions

The student who creates a ticket is its owner.

A ticket has one assigned staff member at a time.

Managers can intervene in ticket operations.

SLA starts when the ticket is created.

PENDING is a temporary workflow state.

Key Decisions

Separate activity table:
Ticket history is stored separately so one ticket can have many activity
records.

Backend authorization:
Permissions are enforced by the API rather than relying only on frontend
controls.

Priority-driven SLA:
Priority directly determines the expected response window.

Database-driven dashboard:
Dashboard metrics are calculated from actual ticket records rather than
static frontend values.

Trade-offs

The prototype uses a single FastAPI backend instead of microservices
because it is easier to build, test, and explain for this scope.

Escalation is dashboard-based rather than automated to avoid unnecessary
scheduler/worker infrastructure.

Database tables are initialized with SQLAlchemy for the prototype. A
production deployment should use migrations such as Alembic.

The demo assignment control uses the configured demonstration staff
member. A production system would load available staff dynamically from
an API.

Current Limitations

No email, SMS, or WhatsApp notifications

No automated escalation worker

No dynamic staff directory

No advanced analytics

No mobile application

No WebSocket-based real-time updates

No production migration framework

No external institutional integrations

Future Improvements

SLA warning and overdue notifications

Automated escalation and reassignment

Staff workload and resolution-time analytics

SLA compliance reporting

Ticket ageing reports

Alembic migrations

Environment-based secrets

Rate limiting and security logging

Production deployment configuration

Institutional system integrations

9. Testing & Validation

The application was tested through actual browser interaction and API
testing.

Authentication

Student login --- PASS

Staff login --- PASS

Manager login --- PASS

Protected APIs --- PASS

Student Workflow

Login
  ↓
View Tickets
  ↓
Create Ticket
  ↓
Ticket Persisted
  ↓
Ticket Appears in Dashboard

Staff Workflow

Login
  ↓
View Support Queue
  ↓
Open Ticket
  ↓
Assign Staff
  ↓
IN_PROGRESS
  ↓
PENDING
  ↓
RESOLVED
  ↓
CLOSED

Manager Workflow

Login
  ↓
View Dashboard
  ↓
View Metrics
  ↓
View Tickets
  ↓
Inspect Ticket
  ↓
View Activity History

Edge Cases Tested

Unauthenticated access

Student ownership restrictions

Invalid status

Invalid priority

Non-existent ticket

Invalid assignment

Assignment to a non-staff user

Priority-based SLA calculation

Activity history after ticket changes

10. Running the Project

Prerequisites

Python 3.x

Node.js and npm

Docker Desktop

1. Start PostgreSQL

From the project root:

docker compose up -d

Database configuration:

Database: edusupport
Username: edusupport_user
Password: edusupport_password
Host Port: 5433
Container Port: 5432

Port 5433 is used on the host to avoid conflict with another
PostgreSQL service using port 5432.

2. Start Backend

cd backend
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Health check:

http://127.0.0.1:8000/health

API documentation:

http://127.0.0.1:8000/docs

3. Start Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

11. Demo Credentials

Role      Email                      Password

Student   student@edusupport.com   student123
Staff     staff@edusupport.com     staff123
Manager   manager@edusupport.com   manager123

These credentials are intended for local demonstration of the assignment
prototype.

12. Project Structure

Edu Support/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── README.md
├── AI_USAGE_REPORT.md
└── .gitignore

Final Summary

EduSupport provides an end-to-end student support workflow:

STUDENT
   ↓
Create Request
   ↓
OPEN
   ↓
ASSIGNED
   ↓
IN_PROGRESS
   ↓
PENDING
   ↓
RESOLVED
   ↓
CLOSED

Throughout the lifecycle, the system maintains:

Ownership

Assignment

Priority

SLA

Due date

Status

Activity history

Resolution and closure

Management visibility

The project uses:

React + Vite
      +
FastAPI
      +
SQLAlchemy
      +
PostgreSQL
      +
Docker

The implementation focuses on the core support-management problem while
keeping the architecture simple enough to build, test, demonstrate, and
extend.
