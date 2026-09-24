from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models import User, Ticket, TicketActivity
from app.routers.tickets import router as ticket_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router


Base.metadata.create_all(bind=engine)


def seed_demo_users():
    db = SessionLocal()

    demo_users = [
        {
            "name": "Demo Student",
            "email": "student@edusupport.com",
            "password": "student123",
            "role": "STUDENT",
        },
        {
            "name": "Demo Staff",
            "email": "staff@edusupport.com",
            "password": "staff123",
            "role": "STAFF",
            "department": "Student Support",
        },
        {
            "name": "Demo Manager",
            "email": "manager@edusupport.com",
            "password": "manager123",
            "role": "MANAGER",
            "department": "Administration",
        },
    ]

    try:
        for demo in demo_users:
            existing_user = (
                db.query(User)
                .filter(User.email == demo["email"])
                .first()
            )

            if existing_user:
                # Reset demo user details and password on startup
                existing_user.name = demo["name"]
                existing_user.password_hash = hash_password(demo["password"])
                existing_user.role = demo["role"]
                existing_user.department = demo.get("department")

            else:
                user = User(
                    name=demo["name"],
                    email=demo["email"],
                    password_hash=hash_password(demo["password"]),
                    role=demo["role"],
                    department=demo.get("department"),
                )
                db.add(user)

        db.commit()

    finally:
        db.close()


seed_demo_users()


app = FastAPI(
    title="EduSupport API",
    description="Student Support & Ticket Management System",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://education-support-ticket-management.vercel.app",
        "https://education-support-ticket-management-30fhyvorn-sangu0121.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(ticket_router)
app.include_router(auth_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "EduSupport API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}