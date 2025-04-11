from fastapi import FastAPI, File, UploadFile, Form
from enum import Enum
from typing import List,Optional
from fastapi.middleware.cors import CORSMiddleware
from google_calendar import find_free_time_in_calendar
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DifficultyLevel(str, Enum):
    EASIER = "easier"
    SAME = "same"
    HARDER = "harder"

@app.get("/")
def read_root():
    return {"message": "Welcome to StudentTools API"}

# Calendar Integration Endpoints

# Input model for the calendar request
class CalendarRequest(BaseModel):
    date: str
    start_time: str
    end_time: str
    constraints: Optional[List[str]] = []

@app.post("/calendar")
async def get_calendar_free_time(req: CalendarRequest):
    try:
        free_times = find_free_time_in_calendar(
            date=req.date,
            start_time=req.start_time,
            end_time=req.end_time,
            constraints=req.constraints or []
        )
        return {"free_time_slots": free_times}
    except Exception as e:
        return {"error": str(e)}



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
    difficulty: DifficultyLevel = DifficultyLevel.SAME
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
