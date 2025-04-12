from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException
import os
from PyPDF2 import PdfReader

class PaperGeneratorService:
    def __init__(self):
        # We'll store generated PDFs here
        self.output_dir = "generated_papers"
        self.upload_dir = "uploads"
        # Ensure both directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.upload_dir, exist_ok=True)
        
    async def extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text content from PDF"""
        try:
            # Create a temporary file to store the PDF content
            temp_path = os.path.join(self.upload_dir, "temp.pdf")
            with open(temp_path, "wb") as f:
                f.write(pdf_content)
            
            # Read the PDF
            reader = PdfReader(temp_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
                
            # Clean up
            os.remove(temp_path)
            return text
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")

    async def ask_chatgpt(self, pdf_content: bytes, difficulty: str) -> Dict[str, Any]:
        """
        Send PDF to ChatGPT and get response
        Returns: Structured dict with questions and answers
        """
        # TODO: Implement ChatGPT call here
        # This is where you'll:
        # 1. Call ChatGPT API
        # 2. Get back structured response
        return {
            "title": "Example Paper",
            "questions": [
                {"question": "Sample question 1", "marks": 10},
                {"question": "Sample question 2", "marks": 15}
            ]
        }

    async def make_pdf(self, content: Dict[str, Any], output_path: str):
        """
        Take ChatGPT response and make a PDF
        """
        # TODO: Implement PDF creation
        # This is where you'll:
        # 1. Use a PDF library to create new PDF
        # 2. Format it nicely
        pass

    def get_paper_path(self, paper_id: str) -> Optional[str]:
        """Get the path for a paper. Returns None if doesn't exist"""
        path = os.path.join(self.output_dir, f"{paper_id}.pdf")
        return path if os.path.exists(path) else None

    async def generate(self, pdf_file: UploadFile, difficulty: str, paper_id: str) -> str:
        """
        Main function that:
        1. Gets PDF content
        2. Sends to ChatGPT
        3. Makes new PDF
        """
        try:
            # Read the uploaded PDF
            pdf_content = await pdf_file.read()
            
            # For testing: Extract and return the text
            extracted_text = await self.extract_text_from_pdf(pdf_content)
            print("Extracted text from PDF:")
            print("-" * 50)
            print(extracted_text)
            print("-" * 50)
            
            # Return temporary success message with first 100 chars of text
            return {
                "status": "success",
                "text_preview": extracted_text[:100] + "...",
                "text_length": len(extracted_text)
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 