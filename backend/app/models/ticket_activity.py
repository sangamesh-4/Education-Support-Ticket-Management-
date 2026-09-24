from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TicketActivity(Base):
    __tablename__ = "ticket_activities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    ticket_id: Mapped[int] = mapped_column(
        ForeignKey("tickets.id"),
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    activity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )