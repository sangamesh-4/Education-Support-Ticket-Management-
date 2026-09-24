from datetime import datetime

from pydantic import BaseModel


class TicketCreate(BaseModel):
    category: str
    subject: str
    description: str
    priority: str = "MEDIUM"


class TicketUpdate(BaseModel):
    status: str | None = None
    priority: str | None = None
    assigned_to: int | None = None


class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    student_id: int
    assigned_to: int | None
    category: str
    subject: str
    description: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    due_at: datetime | None
    resolved_at: datetime | None
    closed_at: datetime | None
    sla_hours: int

    model_config = {
        "from_attributes": True
    }