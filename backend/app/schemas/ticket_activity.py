from datetime import datetime

from pydantic import BaseModel


class TicketActivityResponse(BaseModel):
    id: int
    ticket_id: int
    user_id: int
    activity_type: str
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}