from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from enum import Enum
import uuid

from services.paper_generator import PaperGeneratorService

router = APIRouter(prefix="/papers", tags=["papers"])
paper_service = PaperGeneratorService()

class DifficultyLevel(str, Enum):
    EASIER = "easier"
    SAME = "same"
    HARDER = "harder"

@router.post("/generate")
async def generate_paper(
    pdf_file: UploadFile = File(...),
    difficulty: DifficultyLevel = DifficultyLevel.SAME
):
    try:
        paper_id = str(uuid.uuid4())
        result = await paper_service.generate(pdf_file, difficulty, paper_id)
        
        return result  # This will now return the text preview and length
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{paper_id}")
async def get_paper(paper_id: str):
    paper_path = await paper_service.get_paper_path(paper_id)
    if not paper_path:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    return FileResponse(paper_path, media_type="application/pdf") 