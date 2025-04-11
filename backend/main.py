from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from enum import Enum
from typing import Optional, Dict
from pydantic import BaseModel
import os
import uuid
from datetime import datetime

from services.paper_generator import PaperGeneratorService

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
paper_service = PaperGeneratorService()

# Constants
UPLOAD_DIR = "uploads"
GENERATED_DIR = "generated_papers"  # New directory for generated papers
ALLOWED_EXTENSIONS = {".pdf"}

# In-memory storage for paper metadata (in real app, this would be a database)
paper_metadata: Dict[str, dict] = {}

class DifficultyLevel(str, Enum):
    EASIER = "easier"
    SAME = "same"
    HARDER = "harder"

class PaperRename(BaseModel):
    new_name: str

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)

def is_pdf(filename: str) -> bool:
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

async def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file and return the filename"""
    if not is_pdf(upload_file.filename):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"{timestamp}_{unique_id}.pdf"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save the file
    try:
        with open(file_path, "wb") as f:
            content = await upload_file.read()
            f.write(content)
        return filename
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Welcome to StudentTools API"}

# Calendar Integration Endpoints
@app.get("/calendar")
async def get_calendar_events():
    return {"message": "Calendar events will be implemented"}


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
    try:
        if not is_pdf(pdf_file.filename):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Generate paper ID
        paper_id = str(uuid.uuid4())
        
        # Process the paper using our service
        generated_path = await paper_service.process_paper(
            pdf_file,
            difficulty,
            paper_id
        )
        
        # Store metadata
        default_name = f"Generated Paper - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        paper_metadata[paper_id] = {
            "original_filename": pdf_file.filename,
            "generated_filename": default_name,
            "custom_name": None,
            "created_at": datetime.now().isoformat(),
            "difficulty": difficulty,
            "file_path": generated_path
        }
        
        return {
            "status": "success",
            "message": "Paper generated successfully",
            "details": {
                "paper_id": paper_id,
                "default_name": default_name,
                "original_filename": pdf_file.filename,
                "difficulty_requested": difficulty
            }
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/papers/{paper_id}")
async def get_generated_paper(paper_id: str):
    if paper_id not in paper_metadata:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    paper_path = await paper_service.get_paper(paper_id)
    if not paper_path:
        raise HTTPException(status_code=404, detail="Paper file not found")
    
    return FileResponse(
        paper_path,
        filename=f"{paper_metadata[paper_id]['custom_name'] or paper_metadata[paper_id]['generated_filename']}.pdf",
        media_type="application/pdf"
    )

@app.put("/papers/{paper_id}/rename")
async def rename_paper(paper_id: str, rename_data: PaperRename):
    """Rename a generated paper"""
    if paper_id not in paper_metadata:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    paper_metadata[paper_id]["custom_name"] = rename_data.new_name
    return {
        "status": "success",
        "message": "Paper renamed successfully",
        "paper_id": paper_id,
        "new_name": rename_data.new_name
    }

@app.get("/papers")
async def list_papers():
    """List all generated papers"""
    return {
        "papers": [
            {
                "paper_id": pid,
                "name": data["custom_name"] or data["generated_filename"],
                "created_at": data["created_at"],
                "difficulty": data["difficulty"]
            }
            for pid, data in paper_metadata.items()
        ]
    }
