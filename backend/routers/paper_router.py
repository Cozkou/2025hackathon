from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from enum import Enum
import uuid
from datetime import datetime
from io import BytesIO

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
    difficulty: DifficultyLevel = "same"
):
    try:
        # Generate PDF bytes
        pdf_bytes = await paper_service.generate(pdf_file, difficulty)
        
        # Create a filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"generated_paper_{timestamp}.pdf"
        
        # Create BytesIO object from PDF bytes
        pdf_stream = BytesIO(pdf_bytes)
        
        # Return streaming response that will trigger download
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 