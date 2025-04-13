import os
import re
import random
from dotenv import load_dotenv
from typing import Dict, Any, Optional, List
from PyPDF2 import PdfReader # type: ignore
from fastapi import UploadFile, HTTPException
import uuid
import json
import anthropic


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
    """Class to handle generation of flashcards from PDFs using Claude."""
    
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
   
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
        """Generate flashcards from the provided text using Claude."""
        try:
            message = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=4000,
                temperature=0.7,
                system="""You are a flashcard generation assistant. Generate flashcards in this exact JSON format:
{
    "flashcards": [
        {
            "id": "1",
            "question": "Question text here",
            "answer": "Answer text here - if multi-line, use \\n for line breaks"
        }
    ]
}
Important Rules:
1. Generate EXACTLY the number of flashcards requested - no more, no less
2. Use proper JSON escaping for any special characters
3. For multi-line answers, use \\n instead of actual line breaks
4. Do not include any other text or formatting in your response
5. Only output valid JSON
6. Make sure all JSON objects end with proper commas
7. Double-check your JSON is valid before responding
8. Number flashcard IDs sequentially from 1 to N""",
                messages=[{
                    "role": "user",
                    "content": f"Create EXACTLY {count} flashcards from this text{' about ' + subject if subject else ''}. You must generate {count} cards - no more, no less. Focus on key concepts and important information. Each flashcard must have an id, question, and answer. For multi-line answers, use \\n for line breaks. IMPORTANT: Ensure your response is valid JSON with proper commas between objects. The text is:\n\n{text[:4000]}"
                }]
            )
            
            # Get the response text and clean it
            response_text = message.content[0].text.strip()
            
            # Debug logging
            print("Raw Claude response:")
            print(response_text)
            
            try:
                # More aggressive cleaning of the response text
                def clean_json_text(text: str) -> str:
                    # Remove any non-JSON text before the first { and after the last }
                    start = text.find('{')
                    end = text.rfind('}') + 1
                    if start >= 0 and end > start:
                        text = text[start:end]
                    
                    # Handle newlines and spaces within strings
                    in_string = False
                    cleaned = []
                    i = 0
                    while i < len(text):
                        char = text[i]
                        
                        # Handle escape sequences
                        if char == '\\' and i + 1 < len(text):
                            cleaned.extend([char, text[i + 1]])
                            i += 2
                            continue
                            
                        # Track string boundaries
                        if char == '"' and (i == 0 or text[i-1] != '\\'):
                            in_string = not in_string
                            
                        # Clean up characters within strings
                        if in_string:
                            if char in '\n\r\t':
                                cleaned.append(' ')
                            else:
                                cleaned.append(char)
                        else:
                            if char in '\n\r\t ':
                                # Only add one space between JSON tokens
                                if cleaned and cleaned[-1] not in '\n\r\t ':
                                    cleaned.append(' ')
                            else:
                                cleaned.append(char)
                        i += 1
                    
                    # Join and normalize spaces outside strings
                    result = ''.join(cleaned)
                    
                    # Fix common JSON formatting issues
                    result = re.sub(r',\s*}', '}', result)  # Remove trailing commas
                    result = re.sub(r',\s*]', ']', result)  # Remove trailing commas in arrays
                    result = re.sub(r'\}\s*\{', '},{', result)  # Fix missing commas between objects
                    result = re.sub(r'\]\s*\[', '],[', result)  # Fix missing commas between arrays
                    
                    return result

                # Clean and parse the JSON
                cleaned_text = clean_json_text(response_text)
                print("\nCleaned JSON:")
                print(cleaned_text)
                
                try:
                    parsed_response = json.loads(cleaned_text)
                except json.JSONDecodeError as e:
                    print(f"\nJSON still invalid after cleaning. Error: {str(e)}")
                    print("Attempting to fix common JSON issues...")
                    
                    # Try to extract just the flashcards array if the outer structure is broken
                    flashcards_match = re.search(r'"flashcards"\s*:\s*(\[.*?\])', cleaned_text, re.DOTALL)
                    if flashcards_match:
                        flashcards_json = flashcards_match.group(1)
                        try:
                            cards = json.loads(flashcards_json)
                            parsed_response = {"flashcards": cards}
                        except json.JSONDecodeError:
                            raise ValueError("Could not parse flashcards array")
                    else:
                        raise ValueError("Could not find flashcards array in response")

                # Validate the response structure
                if isinstance(parsed_response, dict) and "flashcards" in parsed_response:
                    cards = parsed_response["flashcards"]
                    if not isinstance(cards, list):
                        raise ValueError("Flashcards must be an array")
                        
                    # Validate each flashcard
                    for card in cards:
                        if not isinstance(card, dict):
                            raise ValueError("Each flashcard must be an object")
                        if not all(key in card for key in ['id', 'question', 'answer']):
                            raise ValueError("Each flashcard must have id, question, and answer fields")
                        if not all(isinstance(card[key], str) for key in ['id', 'question', 'answer']):
                            raise ValueError("All flashcard fields must be strings")
                    
                    return {"flashcards": json.dumps(cards)}
                else:
                    raise ValueError("Response must have a 'flashcards' array")
                
            except json.JSONDecodeError as e:
                print(f"JSON decode error at line {e.lineno}, column {e.colno}")
                print(f"Error message: {str(e)}")
                raise ValueError(f"Failed to parse Claude response as JSON: {str(e)}")
            except Exception as e:
                print(f"Error processing response: {str(e)}")
                raise ValueError(f"Error processing Claude response: {str(e)}")
                
        except Exception as e:
            print(f"Error in generate_flashcards: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")

    def generate(self, pdf_file: UploadFile, subject: Optional[str] = None, count: int = 10) -> Dict[str, Any]:
        """Main function to generate flashcards from a PDF file."""
        try:
            # Read and process the PDF
            pdf_content = pdf_file.file.read()
            text = self.extract_text_from_pdf(pdf_content)
            processed_text = self.preprocess_text(text)
            
            # Print debug info
            print(f"Generating flashcards with count: {count}")
            
            # Generate flashcards with explicit count parameter
            return self.generate_flashcards(processed_text, count=count, subject=subject)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

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
