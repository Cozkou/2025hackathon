from typing import Dict, Any, Optional
from fastapi import UploadFile, HTTPException
import os
from PyPDF2 import PdfReader # type: ignore
from services.portia_config import get_portia_instance

class PaperGeneratorService:
    def __init__(self):
        # We'll store generated PDFs here
        self.output_dir = "generated_papers"
        self.upload_dir = "uploads"
        # Ensure both directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.upload_dir, exist_ok=True)
        # Initialize Portia
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

    
    
    async def generate_new_paper_content(self, text: str, difficulty: str) -> Dict[str, Any]:
        """Generate new paper content using Portia"""
        try:
            # Create a simple plan for paper generation
            plan = str([
                {
                    "tool": "topic_analyzer",
                    "input": {
                        "content": text,
                        "target_difficulty": 1 if difficulty == "easier" else 2 if difficulty == "same" else 3
                    },
                    "description": """
                    Analyze this exam paper content to:
                    1. Identify the main academic subject and specific topics covered
                    2. Determine the academic level (high school, undergraduate, etc)
                    3. Identify key concepts, theories, or methodologies being tested
                    4. Analyze the current difficulty level and complexity of questions
                    5. Look for any subject-specific terminology or frameworks used
                    6. Note any contextual clues about the intended learning outcomes
                    """
                },
                {
                    "tool": "format_analyzer", 
                    "input": {
                        "content": text
                    },
                    "description": """
                    Analyze the exam paper format to identify:
                    1. Question types used (multiple choice, short answer, essay, etc)
                    2. Section structure and organization
                    3. Point distribution and weighting
                    4. Time allocation per section
                    5. Any special instructions or rubrics
                    6. Format patterns and consistency
                    
                    Provide detailed format analysis to maintain consistent structure
                    while generating new questions.
                    """
                },
                {
                    "tool": "question_generator",
                    "input": {
                        "topics": "$topic_analyzer.topics",
                        "format": "$format_analyzer.format_rules",
                        "difficulty": 1 if difficulty == "easier" else 2 if difficulty == "same" else 3
                    },
                    "description": """
                    Generate new exam questions that:
                    1. Match the identified question types and format
                    2. Cover the same topics but with new scenarios/examples
                    3. Maintain consistent style and terminology
                    4. Adjust difficulty while preserving learning objectives
                    5. Include clear marking schemes and solutions
                    6. For any content that doesn't clearly fit the standard format:
                       - Place miscellaneous instructions in instructions.general
                       - Add non-standard question elements as additional fields in question.content
                       - Include supplementary materials as attachments in metadata
                       - Put alternative scoring approaches in solution.marking_scheme
                       - Add section-specific notes to instructions.specific
                    
                    Return questions in the following standardized format:
                    {
                        "metadata": {
                            "title": "Exam Title",
                            "subject": "Subject Name",
                            "level": "Academic Level",
                            "total_time": "Duration in minutes",
                            "total_marks": "Total marks"
                        },
                        "instructions": {
                            "general": ["List of general instructions"],
                            "specific": {"section_name": ["Section-specific instructions"]}
                        },
                        "sections": [
                            {
                                "name": "Section Name",
                                "type": "question_type",
                                "marks": "section_marks",
                                "time_allocation": "minutes",
                                "questions": [
                                    {
                                        "number": "question_number",
                                        "type": "question_type",
                                        "marks": "marks_for_question",
                                        "content": {
                                            "question_text": "The question",
                                            "sub_parts": [
                                                {
                                                    "label": "a",
                                                    "text": "sub_question_text",
                                                    "marks": "sub_part_marks"
                                                }
                                            ]
                                        },
                                        "solution": {
                                            "answer": "correct_answer",
                                            "marking_scheme": ["marking criteria"]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                    """
                }
            ])
            
            # Run the plan
            result = self.portia.run(plan)
            
            return result
            
        except Exception as e:
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


            # Generate new paper content using the extracted text and difficulty
            paper_content = await self.generate_new_paper_content(extracted_text, difficulty)
            
            print(paper_content)
            
            
            # Return temporary success message with first 100 chars of text
            return {
                "status": "success",
                "text_preview": extracted_text[:100] + "...",
                "text_length": len(extracted_text)
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 