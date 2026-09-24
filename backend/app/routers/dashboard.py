from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models import Ticket, User


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(
    current_user: User = Depends(
        require_roles("STAFF", "MANAGER")
    ),
    db: Session = Depends(get_db),
):
    tickets = db.query(Ticket).all()

    now = datetime.utcnow()

    total = len(tickets)
    open_count = sum(1 for t in tickets if t.status == "OPEN")
    assigned_count = sum(1 for t in tickets if t.assigned_to is not None)
    in_progress_count = sum(
        1 for t in tickets if t.status == "IN_PROGRESS"
    )
    pending_count = sum(
        1 for t in tickets if t.status == "PENDING"
    )
    resolved_count = sum(
        1 for t in tickets if t.status == "RESOLVED"
    )
    closed_count = sum(
        1 for t in tickets if t.status == "CLOSED"
    )
    unassigned_count = sum(
        1 for t in tickets if t.assigned_to is None
    )

    overdue_count = sum(
        1
        for t in tickets
        if t.due_at
        and t.due_at < now
        and t.status not in {"RESOLVED", "CLOSED"}
    )

    urgent_count = sum(
        1 for t in tickets if t.priority == "URGENT"
    )

    return {
        "total_tickets": total,
        "open_tickets": open_count,
        "assigned_tickets": assigned_count,
        "unassigned_tickets": unassigned_count,
        "in_progress_tickets": in_progress_count,
        "pending_tickets": pending_count,
        "resolved_tickets": resolved_count,
        "closed_tickets": closed_count,
        "overdue_tickets": overdue_count,
        "urgent_tickets": urgent_count,
    }