from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import User, Ticket, TicketActivity
from app.routers.tickets import router as ticket_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router


Base.metadata.create_all(bind=engine)


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