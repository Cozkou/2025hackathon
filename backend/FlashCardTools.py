import os
import re
import random
from dotenv import load_dotenv
from typing import Dict, Any, Optional, List
from PyPDF2 import PdfReader # type: ignore
from fastapi import UploadFile, HTTPException
import uuid
import json
from portia import (
    Config,
    LLMModel,
    LLMProvider,
    Portia,
    example_tool_registry,
)


load_dotenv()
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')


class Flashcard:
    """Flashcard class to store question and answer pairs."""
    def __init__(self, question: str, answer: str):
        self.question = question
        self.answer = answer
    
    def __repr__(self):
        return f"Q: {self.question}\nA: {self.answer}"

class FlashcardGenerator:
    """Class to handle generation of flashcards from past papers using LLM."""
    
    def __init__(self):
        
        self.anthropic_config = Config.from_default(
            llm_provider=LLMProvider.ANTHROPIC,
            llm_model_name=LLMModel.CLAUDE_3_5_SONNET,
            anthropic_api_key=ANTHROPIC_API_KEY
        )
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
        self.portia = Portia(config=self.anthropic_config, tools=example_tool_registry)
    

   
    def extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text content from PDF"""
        try:
            # Create a temporary file to store the PDF content
            temp_path = os.path.join(self.upload_dir, "testpdf.pdf")
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
    def get_paper_path(self, paper_id: str) -> Optional[str]:
        """Get the path for a paper. Returns None if doesn't exist"""
        path = os.path.join(self.output_dir, f"{paper_id}.pdf")
        return path if os.path.exists(path) else None
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess the extracted text."""
        if not text:
            raise ValueError("Cannot process empty text")
        
        # Removes extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Additional preprocessing
        return text.strip()
    
    def generate_flashcards(self, text: str, count: int = 10, subject: Optional[str] = None) -> Dict[str, Any]:
        """Generate flashcards from the provided text using LLM with structured output."""
        if not text:
            raise ValueError("Cannot generate flashcards from empty text")
        
        if count < 1:
            raise ValueError("Flashcard count must be at least 1")
        
        try:
            # Create a structured plan for flashcard generation
            plan = str([
                {
                    "tool": "content_analyzer",
                    "input": {
                        "content": text,
                        "subject": subject if subject else "auto-detect"
                    },
                    "description": """
                    Analyze this past paper content to:
                    1. Identify the main academic subject and specific topics covered
                    2. Determine the academic level (high school, undergraduate, etc)
                    3. Identify key concepts, theories, or methodologies being tested
                    4. Extract important definitions, formulas, and principles
                    5. Look for any subject-specific terminology or frameworks used
                    6. Note any contextual clues about the intended learning outcomes
                    """
                },
                {
                    "tool": "flashcard_generator",
                    "input": {
                        "content": text,
                        "topics": "$content_analyzer.topics",
                        "count": count,
                        "subject": subject if subject else "$content_analyzer.subject"
                    },
                    "description": f"""
                    Generate {count} high-quality flashcards that:
                    1. Focus on key concepts, definitions, or problem-solving techniques
                    2. Have clear, concise questions
                    3. Provide comprehensive but succinct answers
                    4. Cover different topics from the content to ensure broad understanding
                    5. Are formatted in a standard question-answer structure
                    6. Include proper subject-specific terminology
                    
                    Return flashcards in the following standardized JSON format:
                    {{
                        "metadata": {{
                            "source": "Past Paper Content",
                            "subject": "Subject Name",
                            "level": "Academic Level",
                            "topics": ["List of topics covered"]
                        }},
                        "flashcards": [
                            {{
                                "id": "unique_id",
                                "question": "The question text",
                                "answer": "The answer text",
                                "topic": "Specific topic this flashcard relates to",
                                "difficulty": "easy|medium|hard"
                            }}
                        ]
                    }}
                    """
                }
            ])
            
            # Run the plan using Portia
            result = self.portia.run(plan)
            
            # Extract structured data from the response
            # Try to parse the result.output as JSON
            try:
                # First attempt: Try to parse the entire output as JSON
                output_data = json.loads(result.output)
                return output_data
            except json.JSONDecodeError:
                # Second attempt: Try to extract JSON from the text (in case there's surrounding text)
                json_pattern = r'({[\s\S]*})'
                match = re.search(json_pattern, result.output)
                if match:
                    try:
                        output_data = json.loads(match.group(1))
                        return output_data
                    except json.JSONDecodeError:
                        pass
                
                # If still no valid JSON, fallback to manual parsing
                flashcards = self._parse_flashcards_from_response(result.output)
                
                # Convert to the desired structure
                return {
                    "metadata": {
                        "source": "Past Paper Content",
                        "subject": subject or "Auto-detected",
                        "level": "Not specified",
                        "topics": []
                    },
                    "flashcards": [
                        {
                            "id": str(uuid.uuid4()),
                            "question": card["question"],
                            "answer": card["answer"],
                            "topic": "General",
                            "difficulty": "medium"
                        } for card in flashcards
                    ]
                }
            
        except Exception as e:
            raise RuntimeError(f"Error generating flashcards with LLM: {str(e)}")
    def generate(self, pdf_file: UploadFile, difficulty: str, paper_id: str) -> str:
        """
        Main function that:
        1. Gets PDF content
        2. Sends to Claude
        """
        try:
            # Read the uploaded PDF
            pdf_content = pdf_file.read()
            
            # For testing: Extract and return the text
            extracted_text =  self.extract_text_from_pdf(pdf_content)
            print("Extracted text from PDF:")
            print("-" * 50)
            print(extracted_text)
            print("-" * 50)


            # Generate new paper content using the extracted text and difficulty
            paper_content =  self.gene(extracted_text, difficulty)
            
            print(paper_content)
            
            
            # Return temporary success message with first 100 chars of text
            return {
                "status": "success",
                "text_preview": extracted_text[:100] + "...",
                "text_length": len(extracted_text)
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 
    '''
    def _create_flashcard_prompt(self, text: str, count: int, subject: Optional[str]) -> str:
        """Create a prompt for the LLM to generate flashcards."""
        subject_str = f" on the subject of {subject}" if subject else ""
        
        return f"""
        Your task is to create {count} high-quality flashcards from the following past paper content{subject_str}.
        
        Each flashcard should:
        1. Focus on key concepts, definitions, or problem-solving techniques
        2. Have a clear, concise question
        3. Provide a comprehensive but succinct answer
        4. Cover different topics from the content to ensure broad understanding
        
        Format each flashcard exactly as:
        QUESTION: [question text]
        ANSWER: [answer text]
        
        Do not search for additional information. Only use the content provided below:
        {text[:4000]}  # Limit text to avoid token limits
        """
    '''
    def _parse_flashcards_from_response(self, response_text: str) -> List[Flashcard]:
        """Parse the LLM response to extract flashcards."""
        flashcards = []
        
        # Pattern to match QUESTION/ANSWER format
        pattern = r"QUESTION:\s*(.*?)\s*ANSWER:\s*(.*?)(?=QUESTION:|$)"
        matches = re.findall(pattern, response_text, re.DOTALL)
        
        for question, answer in matches:
            if question.strip() and answer.strip():  # Ensure neither is empty
                flashcards.append(Flashcard(question.strip(), answer.strip()))
        
        return flashcards
    
    def save_flashcards_to_file(self, flashcards: List[Flashcard], filename: str = "flashcards.txt") -> str:
        """Save generated flashcards to a file."""
        if not flashcards:
            raise ValueError("No flashcards to save")
            
        try:
            with open(filename, 'w') as file:
                for i, card in enumerate(flashcards, 1):
                    file.write(f"Flashcard #{i}\n")
                    file.write(f"Q: {card.question}\n")
                    file.write(f"A: {card.answer}\n\n")
            return f"Saved {len(flashcards)} flashcards to {filename}"
        except Exception as e:
            raise IOError(f"Error saving flashcards: {e}")

    def get_random_flashcards(self, flashcards: List[Flashcard], count: int = 5) -> List[Flashcard]:
        """Get a random subset of flashcards for review."""
        if not flashcards:
            raise ValueError("No flashcards available for selection")
            
        if count < 1:
            raise ValueError("Count must be at least 1")
            
        if count >= len(flashcards):
            return flashcards
            
        return random.sample(flashcards, count)
