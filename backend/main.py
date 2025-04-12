from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body
from enum import Enum
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from google_calendar import create_event_in_calendar, find_free_time_in_calendar
from pydantic import BaseModel
from routers import paper_router
import json

class DifficultyLevel(str, Enum):
    SAME = "same"
    EASIER = "easier"
    HARDER = "harder"

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add routers
app.include_router(paper_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to StudentTools API"}

# Calendar Integration Endpoints
class FreeTimeRequest(BaseModel):
	date: str
	start_time: str
	end_time: str
	constraints: Optional[List[str]] = []

class CreateEventRequest(BaseModel):
	start: str
	end: str
	summary: Optional[str] = "Revision Event"
	description: Optional[str] = ""

@app.post("/calendar/free")
async def calendar_free(request: FreeTimeRequest):
	"""Endpoint to find free time slots in Google Calendar."""
	response_json = find_free_time_in_calendar(
		date=request.date,
		start_time=request.start_time,
		end_time=request.end_time,
		constraints=request.constraints
	)
	return response_json

@app.post("/calendar/create-event")
async def calendar_create_event(request: CreateEventRequest):
	"""Endpoint to create a Google Calendar event."""
	response = create_event_in_calendar(
		start=request.start,
		end=request.end,
		summary=request.summary,
		description=request.description
	)
	return response

# Flashcard Endpoints
@app.get("/flashcards")
async def get_flashcards():
    return {"message": "Get flashcards will be implemented"}

@app.post("/flashcards")
async def create_flashcard():
    return {"message": "Create flashcard will be implemented"}

# Past Paper Generator Endpoints
@app.post("/papers/generate")
async def generate_paper(
    pdf_file: UploadFile = File(...),
    difficulty: DifficultyLevel = Form(DifficultyLevel.SAME)
):
    # This will handle:
    # 1. Receiving the PDF
    # 2. Processing it (future implementation)
    # 3. Generating new paper based on difficulty (future implementation)
    # 4. Returning the generated paper
    
    return {
        "message": "Paper generation endpoint",
        "original_filename": pdf_file.filename,
        "difficulty_requested": difficulty,
        "status": "endpoint_created_processing_to_be_implemented"
    }

@app.get("/papers/{paper_id}")
async def get_generated_paper(paper_id: str):
    # This will be used to retrieve previously generated papers
    return {
        "message": "Get generated paper endpoint",
        "paper_id": paper_id
    }