from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException
import os
from PyPDF2 import PdfReader # type: ignore
from services.portia_config import get_portia_instance
from anthropic import Anthropic
from dotenv import load_dotenv

class PaperGeneratorService:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # We'll store generated PDFs here
        self.output_dir = "generated_papers"
        self.upload_dir = "uploads"
        # Ensure both directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.upload_dir, exist_ok=True)
        
        # Initialize Anthropic client with API key from environment
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        self.anthropic = Anthropic(api_key=api_key)
        
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
            print(f"Input text length: {len(text)}")
            print(f"Difficulty: {difficulty}")
            
            # Call Claude API directly
            message = self.anthropic.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=4096,
                temperature=0.7,
                system=f"""You are an expert exam paper generator. Using the provided exam paper as reference, create a new version that is {difficulty} in difficulty.

1. Content Analysis & Adaptation:
   - Identify and maintain the same subject area and topics
   - Keep the same academic level but adjust difficulty as specified
   - Preserve the core concepts and learning objectives
   - Use similar terminology and technical language
   - Maintain the same style of questions but with new scenarios

2. Structure & Format:
   - Follow the same overall structure as the input paper
   - Keep similar time allocations per section
   - Maintain comparable point distribution
   - Use the same question types (multiple choice, essay, etc.)
   - Preserve any special formatting or notation

3. Difficulty Adjustment Guidelines:
   If easier:
   - Break down complex questions into smaller parts
   - Provide more scaffolding in questions
   - Use simpler language while maintaining technical accuracy
   - Give more explicit hints or guidance
   - Reduce the number of steps in multi-step problems

   If harder:
   - Combine concepts that were separate in the original
   - Require more steps to reach solutions
   - Include more application and analysis
   - Reduce explicit guidance
   - Add complexity to scenarios

   If same difficulty:
   - Match complexity level exactly
   - Change scenarios but keep cognitive demand similar
   - Maintain same level of guidance
   - Keep similar number of steps in solutions

4. Quality Standards:
   - All questions must be clear and unambiguous
   - Each question should have a detailed solution
   - Include marking schemes for all questions
   - Ensure all questions are solvable
   - Maintain academic rigor
   - Time allocations should be reasonable""",
                messages=[
                    {
                        "role": "user",
                        "content": f"Generate a new exam paper based on this content:\n\n{text}"
                    }
                ]
            )

            print("Claude API Response received")
            print("Response type:", type(message))
            print("Response attributes:", dir(message))
            
            # Get the response content
            response = message.content[0].text
            print("Generated content length:", len(response))
            
            return response
            
        except Exception as e:
            print(f"Error in Claude API call: {str(e)}")
            print(f"Error type: {type(e)}")
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