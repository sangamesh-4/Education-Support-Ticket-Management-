# EduSupport
## Student Support & Ticket Management System

EduSupport is a full-stack student support and ticket management system designed for educational institutions.

The system allows students to raise support requests for administrative issues such as fees, attendance, ID cards, documents, certificates, and other institutional matters. Support staff can take ownership of requests, assign tickets, manage priorities, process requests through defined statuses, monitor SLA deadlines, and record resolution activity. Managers receive operational visibility into the overall support workload.

The solution was designed as a practical prototype with a focus on usability, clear ownership, traceability, SLA visibility, and a simple implementation that can be demonstrated and extended.

---

# 1. Project Overview

## 1.1 Problem Statement

Educational institutions receive a large number of student support requests covering different administrative areas.

Typical requests include:

- Fee-related issues
- Attendance-related issues
- ID card requests
- Document requests
- Certificate requests
- Other administrative requests

When these requests are handled through informal channels, several operational problems can occur:

- Requests may not have a clear owner.
- Staff may not know which requests require immediate attention.
- Students may not know the current status of their request.
- Pending requests can remain unresolved.
- SLA deadlines can be missed.
- Managers may not have visibility into the support workload.
- There may be no reliable history of what happened to a request.

EduSupport addresses these problems by representing every support request as a trackable ticket.

The ticket becomes the central unit of the support workflow.

---

## 1.2 Proposed Solution

EduSupport provides a centralized ticket management workflow.

A student creates a ticket containing:

- Category
- Subject
- Description
- Priority

The system automatically records:

- Ticket number
- Student ownership
- Creation timestamp
- SLA duration
- Due timestamp
- Initial status

Staff members can then:

- View tickets
- Assign tickets
- Change priority
- Process tickets
- Put tickets into pending state
- Resolve tickets
- Close tickets

Managers can monitor the overall support operation using dashboard metrics.

Every important ticket operation is recorded in an activity history.

The overall workflow is:

```text
Student
   |
   | Creates request
   v
Ticket Created
   |
   v
OPEN
   |
   | Assignment
   v
ASSIGNED
   |
   v
IN_PROGRESS
   |
   | Waiting for information/action
   v
PENDING
   |
   v
RESOLVED
   |
   v
CLOSED
1.3 Project Objectives

The main objectives of the system are:

Provide students with a simple way to raise support requests.
Give support staff clear ownership of requests.
Allow tickets to be prioritized based on urgency.
Track SLA deadlines for support requests.
Provide a clear ticket lifecycle.
Support a pending-action workflow.
Maintain an activity history for ticket changes.
Track resolution and closure.
Provide management-level visibility.
Prevent unauthorized access to tickets and operations.
Persist ticket information using PostgreSQL.
Provide a simple frontend connected to a real backend API.
1.4 Key Features
Authentication
JWT-based login
Role-aware access
Protected API endpoints
Password hashing
Ticket Management
Ticket creation
Ticket listing
Ticket details
Ticket assignment
Priority management
Status management
SLA Management
Priority-based SLA
Automatic due-date calculation
Overdue ticket detection
Activity History
Ticket creation activity
Assignment activity
Status change activity
Priority change activity
Dashboard
Total tickets
Open tickets
Assigned tickets
Unassigned tickets
In-progress tickets
Pending tickets
Resolved tickets
Closed tickets
Overdue tickets
Urgent tickets
Role-Based Experience
Student dashboard
Staff support queue
Manager dashboard
2. User Roles & Permissions

The system uses three primary roles:

STUDENT
STAFF
MANAGER

Each role has different responsibilities.

2.1 Student

The Student is the requester.

Students can:

Log in
Create support tickets
Select a category
Select priority
Provide a subject
Provide a description
View their own tickets
Open ticket details
View ticket status
View priority
View SLA
View due date
View activity history

Students cannot:

Assign tickets
Change ticket priority after creation
Change ticket status through staff operations
Access another student's ticket

The student dashboard is focused on request visibility and tracking.

2.2 Staff

Staff members are responsible for processing support requests.

Staff can:

Log in
View the support queue
View all tickets
Open ticket details
Assign tickets
Change priority
Change status
Review SLA information
Review activity history
Process tickets through the lifecycle

The Staff dashboard is focused on operational ticket management.

2.3 Manager

Managers provide operational oversight.

Managers can:

Log in
View all tickets
View dashboard metrics
Monitor open requests
Monitor pending requests
Monitor resolved requests
Monitor closed requests
Monitor overdue tickets
Assign tickets
Change priority
Change status
Review ticket activity history

The Manager interface shares the operational ticket controls with Staff because managers may need to intervene in ticket processing.

The main additional responsibility is management visibility through the dashboard metrics.

2.4 Permission Matrix
Operation	Student	Staff	Manager
Login	Yes	Yes	Yes
Create ticket	Yes	No	No
View own tickets	Yes	Yes	Yes
View all tickets	No	Yes	Yes
View ticket activity	Own tickets	Yes	Yes
Assign ticket	No	Yes	Yes
Change priority	No	Yes	Yes
Change status	No	Yes	Yes
View dashboard metrics	No	Yes	Yes
Assign to staff	No	Yes	Yes
3. Ticket Management Workflow
3.1 Ticket Categories

The system supports the following categories:

FEES
ATTENDANCE
ID_CARD
DOCUMENTS
CERTIFICATES
OTHER

These categories represent the common administrative support areas described in the problem.

The OTHER category allows the system to handle requests that do not fit the predefined categories.

3.2 Ticket Creation

A student creates a ticket by providing:

Category
Subject
Description
Priority

When the ticket is created, the backend automatically determines:

Ticket Number
Student
Status
SLA Hours
Creation Time
Due Time

New tickets start with:

Status = OPEN

The student who creates the ticket becomes the owner.

3.3 Status Lifecycle

The system supports:

OPEN
ASSIGNED
IN_PROGRESS
PENDING
RESOLVED
CLOSED

The normal operational lifecycle is:

OPEN
  |
  v
ASSIGNED
  |
  v
IN_PROGRESS
  |
  v
PENDING
  |
  v
RESOLVED
  |
  v
CLOSED

The implementation allows Staff and Managers to update ticket status according to the support workflow.

3.4 Status Definitions
OPEN

The ticket has been created but has not yet been assigned to a staff member.

ASSIGNED

The ticket has been assigned to a support staff member.

Assignment automatically moves an OPEN ticket to ASSIGNED.

IN_PROGRESS

The assigned staff member is actively working on the request.

PENDING

The request cannot currently proceed because some information or action is required.

Examples:

Waiting for information from the student
Waiting for a document
Waiting for another department
RESOLVED

The requested support action has been completed.

The system records the resolution timestamp.

CLOSED

The ticket has completed its support lifecycle.

The system records the closure timestamp.

3.5 Priority

The supported priorities are:

LOW
MEDIUM
HIGH
URGENT

Priority indicates how quickly the support team should process the request.

3.6 SLA Rules

Each priority has a defined SLA.

Priority	SLA
LOW	72 hours
MEDIUM	48 hours
HIGH	24 hours
URGENT	8 hours

The SLA is calculated when the ticket is created.

The calculation is:

Due Time = Created Time + SLA Hours

For example:

Priority: HIGH
SLA: 24 hours

The ticket receives a due time exactly 24 hours after creation.

3.7 Ageing

Ticket ageing is represented through the time between:

Created Time

and:

Current Time

The SLA due time provides a practical boundary for identifying tickets that require attention.

The dashboard identifies tickets whose SLA has already expired.

3.8 Overdue Tickets

A ticket is considered overdue when:

Current Time > Due Time

and the ticket status is not:

RESOLVED
CLOSED

Overdue tickets are included in the dashboard summary.

This allows Staff and Managers to identify requests that have exceeded their expected SLA.

3.9 Pending Workflow

PENDING is used when support cannot continue immediately.

For example:

Student requests certificate
        |
        v
Staff reviews request
        |
        v
Required information missing
        |
        v
PENDING
        |
        v
Information received
        |
        v
IN_PROGRESS
        |
        v
RESOLVED

The prototype does not introduce a separate notification system for pending requests.

3.10 Escalation

The prototype uses a lightweight escalation approach.

Instead of implementing background workers or automated notifications, overdue tickets are surfaced through the dashboard.

Managers can then review and intervene.

This approach keeps the implementation simple while still demonstrating escalation visibility.

A production version could add:

Automatic escalation
Manager notifications
SLA warning notifications
Automatic reassignment
Escalation levels
4. System Architecture
4.1 Architecture Overview

EduSupport uses a three-layer architecture:

┌─────────────────────────────────────┐
│            FRONTEND                 │
│                                     │
│ React + Vite                        │
│                                     │
│ Student Dashboard                   │
│ Staff Dashboard                     │
│ Manager Dashboard                   │
│ Ticket Creation                     │
│ Ticket Details                      │
│ Activity History                    │
└──────────────────┬──────────────────┘
                   |
                   | REST / JSON
                   |
                   v
┌─────────────────────────────────────┐
│             BACKEND                 │
│                                     │
│ FastAPI                             │
│                                     │
│ Authentication                      │
│ Authorization                       │
│ Ticket Management                   │
│ Assignment                          │
│ Status Workflow                     │
│ Priority & SLA                      │
│ Activity History                    │
│ Dashboard                           │
└──────────────────┬──────────────────┘
                   |
                   | SQLAlchemy
                   |
                   v
┌─────────────────────────────────────┐
│             DATABASE                │
│                                     │
│ PostgreSQL                          │
│                                     │
│ users                               │
│ tickets                             │
│ ticket_activities                   │
└─────────────────────────────────────┘
4.2 Technology Stack
Frontend
React
Vite
JavaScript
CSS
Fetch API
Backend
Python
FastAPI
SQLAlchemy
Pydantic
JWT
Passlib
Bcrypt
Database
PostgreSQL
Infrastructure
Docker
Docker Compose
4.3 Why These Technologies?
React + Vite

React provides a component-based frontend suitable for implementing separate role-aware dashboards and interactive ticket controls.

Vite provides a lightweight development environment.

FastAPI

FastAPI provides:

REST API development
Request validation
Automatic API documentation
Dependency injection
Easy integration with SQLAlchemy
PostgreSQL

The problem is relational in nature.

Tickets have relationships with:

Students
Staff
Activities

PostgreSQL provides reliable relational persistence for these relationships.

SQLAlchemy

SQLAlchemy provides an ORM layer between the Python backend and PostgreSQL.

JWT

JWT provides a simple mechanism for authenticating API requests and carrying the authenticated user's role.

4.4 Project Structure
Edu Support/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── dependencies.py
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── ticket.py
│   │   │   └── ticket_activity.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── ticket.py
│   │   │   └── ticket_activity.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── tickets.py
│   │   │   └── dashboard.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
4.5 Data Flow

A typical ticket request flows through the system as follows:

Student Browser
      |
      | POST /tickets/
      v
FastAPI
      |
      | Validate JWT
      |
      | Validate request
      |
      | Determine SLA
      |
      | Create Ticket
      |
      | Create Activity
      v
SQLAlchemy
      |
      v
PostgreSQL
      |
      v
FastAPI Response
      |
      v
React Dashboard
5. Database Design
5.1 Users Table

The users table stores system users.

Fields:

id
name
email
password_hash
role
department
created_at

The role field determines the user's permissions.

Supported values:

STUDENT
STAFF
MANAGER

Passwords are stored as hashes.

5.2 Tickets Table

The tickets table stores support requests.

Fields:

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

Important relationships:

student_id
    ↓
users.id

and:

assigned_to
    ↓
users.id
5.3 Ticket Activities Table

The ticket_activities table records events associated with tickets.

Fields:

id
ticket_id
user_id
activity_type
description
created_at

This creates a chronological audit trail.

For example:

Ticket Created
      ↓
Ticket Assigned
      ↓
Status Changed
      ↓
Priority Changed
      ↓
Status Changed
5.4 Database Relationships

The basic relationship is:

                    ┌─────────────┐
                    │    USERS    │
                    └──────┬──────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
       student_id                   assigned_to
             │                           │
             └─────────────┬─────────────┘
                           │
                           v
                    ┌─────────────┐
                    │   TICKETS   │
                    └──────┬──────┘
                           │
                       ticket_id
                           │
                           v
                  ┌──────────────────┐
                  │ TICKET_ACTIVITIES│
                  └──────────────────┘
6. Backend & API Design
6.1 Authentication

Authentication is handled by:

POST /auth/login

The login request contains:

email
password

The backend:

Finds the user.
Verifies the password hash.
Creates a JWT.
Includes the user ID and role in the token.
Returns the access token.

The frontend uses this token for protected requests.

6.2 Authorization

Protected endpoints use JWT validation.

The backend identifies the current user from the token.

Role restrictions are applied at the API level.

For example:

require_roles("STUDENT")

is used for student-only ticket creation.

Staff/Manager operations use:

require_roles("STAFF", "MANAGER")

This ensures role restrictions are enforced by the backend rather than only by the frontend.

6.3 Ticket APIs
Create Ticket
POST /tickets/

Used by students.

Request example:

{
  "category": "DOCUMENTS",
  "subject": "Bonafide certificate request",
  "description": "I need a bonafide certificate for my internship application.",
  "priority": "HIGH"
}

The backend automatically creates:

Ticket Number
Student ID
OPEN status
SLA
Due Date
Creation Activity
List Tickets
GET /tickets/

Behavior:

Student
→ Only own tickets

Staff
→ All tickets

Manager
→ All tickets
Get Ticket
GET /tickets/{ticket_id}

Returns detailed ticket information.

Students are only allowed to retrieve tickets they own.

Get Activities
GET /tickets/{ticket_id}/activities

Returns the activity history for the ticket.

Update Ticket
PATCH /tickets/{ticket_id}

Staff and managers can update:

status
priority
assigned_to
6.4 Dashboard API
GET /dashboard/summary

Returns:

{
  "total_tickets": 0,
  "open_tickets": 0,
  "assigned_tickets": 0,
  "unassigned_tickets": 0,
  "in_progress_tickets": 0,
  "pending_tickets": 0,
  "resolved_tickets": 0,
  "closed_tickets": 0,
  "overdue_tickets": 0,
  "urgent_tickets": 0
}

These values are calculated from the actual ticket records.

6.5 Backend Validation

The backend validates:

Authentication
Role permissions
Ticket existence
Student ticket ownership
Priority values
Status values
Assigned user existence
Assigned user role

Examples:

Invalid Priority

Rejected if priority is not:

LOW
MEDIUM
HIGH
URGENT
Invalid Status

Rejected if status is not:

OPEN
ASSIGNED
IN_PROGRESS
PENDING
RESOLVED
CLOSED
Invalid Assignment

A ticket cannot be assigned to:

STUDENT
MANAGER

Only a STAFF user can be assigned.

7. Frontend Design
7.1 Login Screen

The application starts with a login screen.

Users enter:

Email
Password

After successful authentication, the frontend reads the role from the JWT and loads the corresponding dashboard experience.

The frontend stores the session token in sessionStorage.

7.2 Student Dashboard

The Student dashboard displays:

Student role
Student email
Ticket list
Ticket status
Ticket priority
Ticket category
Creation time
Ticket details
Activity history

Students can also click:

+ New request

to create a ticket.

7.3 New Ticket Form

The ticket form contains:

Category
Subject
Description
Priority

Example:

Category: DOCUMENTS
Subject: Bonafide certificate request
Description: I need a bonafide certificate for my internship application.
Priority: HIGH

After submission, the ticket is sent to the FastAPI backend and persisted in PostgreSQL.

7.4 Staff Dashboard

The Staff dashboard provides:

Total Tickets
Open
In Progress
Pending
Resolved
Overdue

The support queue displays:

Ticket Number
Subject
Category
Created Time
Status
Priority

Staff can select a ticket to open its detail panel.

7.5 Manager Dashboard

The Manager dashboard provides the same core operational ticket view but is intended for management oversight.

The dashboard exposes:

Total Tickets
Open
In Progress
Pending
Resolved
Overdue

The manager can also inspect:

Ticket details
Assignment
Priority
Status
SLA
Activity history
7.6 Ticket Details

The ticket details panel shows:

Ticket Number
Subject
Status
Priority
Description
Category
Assigned Staff
SLA
Due Time

For Staff and Managers, the panel additionally provides controls for:

Status
Priority
Assignment
7.7 Activity Timeline

The activity section shows the history of important changes.

Example:

Status Changed
Status changed from OPEN to ASSIGNED

Status Changed
Status changed from ASSIGNED to IN_PROGRESS

Status Changed
Status changed from IN_PROGRESS to PENDING

Status Changed
Status changed from PENDING to RESOLVED

This gives users a clear history of how the ticket progressed.

8. Product Decisions, Assumptions & Trade-offs
8.1 Product Assumptions
Assumption 1 — One Student Owns the Request

The student who creates the ticket is considered its owner.

Assumption 2 — One Staff Owner

A ticket can have one assigned staff member at a time.

Assumption 3 — Manager Oversight

Managers are allowed to intervene in ticket operations.

Assumption 4 — SLA Begins at Creation

The SLA starts when the ticket is created.

Assumption 5 — Pending Is Temporary

Pending indicates that the ticket is waiting for information/action and is not a final state.

8.2 Design Decisions
Separate Activity Table

Activity history is stored separately rather than inside the ticket record.

Reason:

One ticket
    ↓
Many activities

This provides a cleaner audit trail.

Backend Authorization

Permissions are enforced by the backend.

This prevents a user from bypassing frontend restrictions by directly calling APIs.

Priority-Driven SLA

SLA is tied directly to priority.

This makes the priority field operational rather than purely informational.

Dashboard Metrics

Management metrics are calculated from database records.

This avoids static or mock values in the frontend.

8.3 Trade-offs
Simple Architecture vs Distributed Architecture

A monolithic FastAPI backend was chosen instead of microservices.

Advantage:

Easier to build
Easier to test
Easier to explain
Lower infrastructure overhead

Trade-off:

Less independent scalability than a distributed architecture
Manual Escalation vs Automated Escalation

Manual manager intervention was selected for the prototype.

Advantage:

No scheduler required
No worker infrastructure required
Easy to demonstrate

Trade-off:

No automatic notifications or reassignment
Prototype Database Initialization

The prototype uses:

Base.metadata.create_all(bind=engine)

to create tables.

For production, a migration system such as Alembic would be more appropriate.

Fixed Demo Staff Assignment

The current frontend uses the configured demonstration staff member in the assignment control.

A production system would dynamically load available staff from an API.

8.4 Limitations

Current limitations include:

No email notification system
No SMS/WhatsApp integration
No automated escalation worker
No dynamic staff directory
No advanced analytics
No mobile application
No real-time WebSocket communication
No production migration framework
No external institutional integrations

These are intentional scope decisions for the prototype.

8.5 Future Improvements

Potential production improvements include:

Notifications
Assignment notification
Pending notification
Resolution notification
SLA warning
Overdue notification
Automated Escalation
Automatic manager escalation
Escalation levels
Automatic reassignment
Reporting
Average resolution time
SLA compliance
Ticket ageing buckets
Staff workload
Category trends
Monthly ticket volume
Production Hardening
Alembic migrations
Environment variables for secrets
HTTPS
Rate limiting
Security logging
Production deployment configuration
9. Testing, Validation & Running the Project
9.1 Validation Performed

The complete application was tested through actual browser interaction and API testing.

The following workflows were validated.

Authentication
Student Login     → PASS
Staff Login       → PASS
Manager Login     → PASS
Protected APIs    → PASS
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

Validated successfully.

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

Validated successfully.

Manager Workflow
Login
  ↓
View Management Dashboard
  ↓
View Metrics
  ↓
View Tickets
  ↓
Open Ticket
  ↓
View Activity History

Validated successfully.

9.2 Edge Cases Tested
Unauthenticated Access

Protected endpoints reject requests without valid authentication.

Student Ticket Ownership

A student cannot access another student's ticket.

Invalid Status

Invalid status values are rejected.

Invalid Priority

Invalid priority values are rejected.

Invalid Assignment

Assignment to non-existent users is rejected.

Assignment to users who are not Staff is rejected.

Ticket Not Found

Requests for non-existent tickets return:

404 Ticket not found
SLA Calculation

Priority-specific SLA values were verified.

Activity History

Status and assignment changes were verified through the activity timeline.

9.3 Demonstration Flow

A recommended demonstration can be completed using one ticket.

Step 1 — Student

Login:

student@edusupport.com
student123

Create:

Category:
DOCUMENTS

Subject:
Bonafide certificate request

Description:
I need a bonafide certificate for my internship application.

Priority:
HIGH

Expected:

Status: OPEN
Priority: HIGH
SLA: 24 hours
Step 2 — Staff

Logout and login:

staff@edusupport.com
staff123

Open the newly created ticket.

Assign:

Staff #3

The ticket becomes:

OPEN
 ↓
ASSIGNED

Continue:

ASSIGNED
 ↓
IN_PROGRESS
 ↓
PENDING
 ↓
RESOLVED
 ↓
CLOSED

The activity history should reflect these operations.

Step 3 — Manager

Logout and login:

manager@edusupport.com
manager123

Review:

Total Tickets
Open
In Progress
Pending
Resolved
Overdue

Then open a ticket and inspect:

Status
Priority
Assignment
SLA
Due Date
Activity History
9.4 Prerequisites

The following software is required:

Python 3.x
Node.js
npm
Docker Desktop
9.5 Start PostgreSQL

From the project root:

docker compose up -d

The Docker PostgreSQL configuration is:

Database:
edusupport

Username:
edusupport_user

Password:
edusupport_password

Host Port:
5433

Container Port:
5432

Port 5433 is used on the host so that the project's PostgreSQL instance does not interfere with another PostgreSQL service using port 5432.

9.6 Start Backend

Open a terminal:

cd backend

Activate the virtual environment on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Start FastAPI:

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Health endpoint:

http://127.0.0.1:8000/health

Swagger API documentation:

http://127.0.0.1:8000/docs
9.7 Start Frontend

Open another terminal:

cd frontend

Install dependencies:

npm install

Start Vite:

npm run dev

Frontend:

http://localhost:5173
9.8 Demo Credentials
Student
Email:
student@edusupport.com

Password:
student123
Staff
Email:
staff@edusupport.com

Password:
staff123
Manager
Email:
manager@edusupport.com

Password:
manager123

These credentials are intended only for local demonstration of the assignment prototype.

9.9 Final Project Summary

EduSupport provides an end-to-end student support workflow.

                     STUDENT
                        |
                        | Create Request
                        v
                      OPEN
                        |
                        | Assign
                        v
                    ASSIGNED
                        |
                        v
                  IN_PROGRESS
                        |
                        v
                    PENDING
                        |
                        v
                   RESOLVED
                        |
                        v
                    CLOSED

During this lifecycle, the system maintains:

Ownership
Priority
SLA
Due Date
Status
Assignment
Activity History
Resolution
Closure
Management Visibility

The final solution provides a practical full-stack implementation using:

React
   +
FastAPI
   +
SQLAlchemy
   +
PostgreSQL
   +
Docker

The implementation focuses on solving the core support-management problem while deliberately avoiding unnecessary infrastructure complexity.

The system is structured so that additional production capabilities such as notifications, automated escalation, advanced reporting, dynamic staff assignment and institutional integrations can be added later without changing the core ticket model.


**This is the proper complete README, bro.** Every section has actual content now—from `1.1` all the way through `9.9`; there are no placeholder headings.

And as requested, **I have deliberately left the AI Usage Report out**. We can add that later as a separate section/file after the README itself is finalized.