from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException
import os
from PyPDF2 import PdfReader # type: ignore
from services.portia_config import get_portia_instance
from anthropic import Anthropic

class PaperGeneratorService:
    def __init__(self):
        # We'll store generated PDFs here
        self.output_dir = "generated_papers"
        self.upload_dir = "uploads"
        # Ensure both directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.upload_dir, exist_ok=True)
        # Initialize Anthropic client
        self.anthropic = Anthropic()
        # Keep Portia instance for compatibility
        self.portia = get_portia_instance()
        
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

    async def generate_new_paper_content(self, text: str, difficulty: str) -> str:
        """Generate new paper content using Claude directly"""
        try:
            print("Calling Claude API...")
            
            # Call Claude API directly - note: messages.create() is not async
            message = self.anthropic.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=4096,
                temperature=0.7,
                system="You are an expert exam paper generator. Generate a new version of the provided exam paper.",
                messages=[
                    {
                        "role": "user",
                        "content": f"Create a new version of this exam paper that is {difficulty} in difficulty. Here is the content:\n\n{text}"
                    }
                ]
            )

            print("Claude API Response:")
            print(message)  # Debug print to see full response
            
            # Access the content correctly from the message
            if hasattr(message, 'content'):
                print("Message has content attribute")
                if isinstance(message.content, list) and len(message.content) > 0:
                    print("Content is a list with items")
                    return message.content[0].text
                else:
                    print(f"Unexpected content format: {message.content}")
                    return str(message.content)
            else:
                print("Message structure:", dir(message))
                raise HTTPException(
                    status_code=500,
                    detail="Unexpected response format from Claude"
                )
            
        except Exception as e:
            print(f"Error in Claude API call: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error generating paper content: {str(e)}")

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

    async def generate(self, pdf_file: UploadFile, difficulty: str, paper_id: str) -> Dict[str, Any]:
        """
        Main function that:
        1. Gets PDF content
        2. Sends to Claude
        3. Makes new PDF
        """
        try:
            # Read the uploaded PDF
            pdf_content = await pdf_file.read()
            
            # Extract text from PDF
            extracted_text = await self.extract_text_from_pdf(pdf_content)
            print("Extracted text from PDF:")
            print("-" * 50)
            print(extracted_text)
            print("-" * 50)

            # Generate new paper content using Claude
            generated_content = await self.generate_new_paper_content(extracted_text, difficulty)
            
            print("Generated paper content:")
            print(generated_content)
            
            # Return success response with generated content
            return {
                "status": "success",
                "generated_content": generated_content
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 