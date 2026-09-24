from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles

from app.models import Ticket, TicketActivity, User
from app.schemas.ticket import TicketCreate, TicketResponse, TicketUpdate
from app.schemas.ticket_activity import TicketActivityResponse


router = APIRouter(prefix="/tickets", tags=["Tickets"])


SLA_HOURS = {
    "LOW": 72,
    "MEDIUM": 48,
    "HIGH": 24,
    "URGENT": 8,
}


@router.post("/", response_model=TicketResponse)
def create_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(require_roles("STUDENT")),
    db: Session = Depends(get_db),
):
    priority = ticket_data.priority.upper()

    if priority not in SLA_HOURS:
        raise HTTPException(
            status_code=400,
            detail="Invalid priority",
        )

    sla_hours = SLA_HOURS[priority]
    created_at = datetime.utcnow()

    ticket = Ticket(
        ticket_number=f"TKT-{int(created_at.timestamp() * 1000)}",
        student_id=current_user.id,
        category=ticket_data.category.upper(),
        subject=ticket_data.subject,
        description=ticket_data.description,
        priority=priority,
        status="OPEN",
        created_at=created_at,
        updated_at=created_at,
        due_at=created_at + timedelta(hours=sla_hours),
        sla_hours=sla_hours,
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    activity = TicketActivity(
        ticket_id=ticket.id,
        user_id=current_user.id,
        activity_type="CREATED",
        description="Ticket created by student",
    )

    db.add(activity)
    db.commit()

    return ticket


@router.get("/", response_model=list[TicketResponse])
def get_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Ticket)

    if current_user.role == "STUDENT":
        query = query.filter(Ticket.student_id == current_user.id)

    return query.order_by(Ticket.created_at.desc()).all()


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    if current_user.role == "STUDENT" and ticket.student_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this ticket",
        )

    return ticket


@router.get(
    "/{ticket_id}/activities",
    response_model=list[TicketActivityResponse],
)
def get_ticket_activities(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    if current_user.role == "STUDENT" and ticket.student_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this ticket",
        )

    activities = (
        db.query(TicketActivity)
        .filter(TicketActivity.ticket_id == ticket_id)
        .order_by(TicketActivity.created_at.asc())
        .all()
    )

    return activities


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    current_user: User = Depends(
        require_roles("STAFF", "MANAGER")
    ),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    activities = []

    # Update status
    if ticket_data.status is not None:
        new_status = ticket_data.status.upper()

        allowed_statuses = {
            "OPEN",
            "ASSIGNED",
            "IN_PROGRESS",
            "PENDING",
            "RESOLVED",
            "CLOSED",
        }

        if new_status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid status",
            )

        old_status = ticket.status
        ticket.status = new_status

        if new_status == "RESOLVED":
            ticket.resolved_at = datetime.utcnow()

        if new_status == "CLOSED":
            ticket.closed_at = datetime.utcnow()

        if old_status != new_status:
            activities.append(
                TicketActivity(
                    ticket_id=ticket.id,
                    user_id=current_user.id,
                    activity_type="STATUS_CHANGED",
                    description=(
                        f"Status changed from {old_status} "
                        f"to {new_status}"
                    ),
                )
            )

    # Update priority and recalculate SLA
    if ticket_data.priority is not None:
        priority = ticket_data.priority.upper()

        if priority not in SLA_HOURS:
            raise HTTPException(
                status_code=400,
                detail="Invalid priority",
            )

        old_priority = ticket.priority

        ticket.priority = priority
        ticket.sla_hours = SLA_HOURS[priority]
        ticket.due_at = ticket.created_at + timedelta(
            hours=ticket.sla_hours
        )

        if old_priority != priority:
            activities.append(
                TicketActivity(
                    ticket_id=ticket.id,
                    user_id=current_user.id,
                    activity_type="PRIORITY_CHANGED",
                    description=(
                        f"Priority changed from {old_priority} "
                        f"to {priority}"
                    ),
                )
            )

    # Assign ticket only to staff
    if ticket_data.assigned_to is not None:
        assigned_user = (
            db.query(User)
            .filter(User.id == ticket_data.assigned_to)
            .first()
        )

        if not assigned_user:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found",
            )

        if assigned_user.role != "STAFF":
            raise HTTPException(
                status_code=400,
                detail="Tickets can only be assigned to staff members",
            )

        old_assigned_to = ticket.assigned_to

        ticket.assigned_to = assigned_user.id

        if ticket.status == "OPEN":
            ticket.status = "ASSIGNED"

        if old_assigned_to != assigned_user.id:
            activities.append(
                TicketActivity(
                    ticket_id=ticket.id,
                    user_id=current_user.id,
                    activity_type="ASSIGNED",
                    description=(
                        f"Ticket assigned to staff user "
                        f"{assigned_user.id}"
                    ),
                )
            )

    ticket.updated_at = datetime.utcnow()

    for activity in activities:
        db.add(activity)

    db.commit()
    db.refresh(ticket)

    return ticket