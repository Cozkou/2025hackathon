from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..google_calendar import find_free_time_in_calendar, create_event_in_calendar

router = APIRouter(prefix="/calendar", tags=["calendar"])

class FreeTimeRequest(BaseModel):
    date: str
    start_time: str
    end_time: str
    constraints: Optional[List[str]] = []

class EventCreateRequest(BaseModel):
    start: str
    end: str
    summary: str = "Revision Event"
    description: str = ""

@router.post("/free")
async def get_free_time(request: FreeTimeRequest):
    try:
        result = find_free_time_in_calendar(
            date=request.date,
            start_time=request.start_time,
            end_time=request.end_time,
            constraints=request.constraints
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/event")
async def create_event(request: EventCreateRequest):
    try:
        result = create_event_in_calendar(
            start=request.start,
            end=request.end,
            summary=request.summary,
            description=request.description
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 