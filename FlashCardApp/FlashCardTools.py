import os
import re
import random
from dotenv import load_dotenv
from typing import List, Optional
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
        self.portia = Portia(config=self.anthropic_config, tools=example_tool_registry)
    
    """
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        #placeholder for extracting text from pdf
    """
    def extract_text_from_pdf(self):
        # example past paper content
        return '''
Page 1:

Green Lawns International School
Green Lawns was established in 1960 by Mr Alim Shadid as a small international boarding school. It expanded slowly through the 1970s and 1980s, but gained a solid reputation for excellent teaching and impressive examination results. Mr Shadid built up a team of highly-qualified staff, many of whom held advanced academic qualifications and had many years of successful teaching experience and examination results. His democratic management style worked well in a small organisation. He was respected and knew all of the staff personally. Teachers were delegated authority and were allowed a great deal of personal autonomy as long as they achieved excellent results. They had high levels of motivation and worked hard, and the school had very low staff turnover.

In the 1990s, however, the school expanded to 800 students. Mr Shadid, stressed with the effort of directing all aspects of the business, decided to look for a buyer. He changed the legal structure to that of a private limited company and in 2002 he accepted a substantial offer from an offshore educational investment company called Edu-invest.

Edu-invest put in a new Business Head, Rick Summers, as the ultimate decision-maker in the school. Rick was in his mid-thirties and had a successful background in corporate management with a multinational food manufacturer. He brought in three of his ex-colleagues to run HR, marketing and accounting. With increased profits now a primary concern, whenever experienced teachers left they were replaced by younger, single staff, some of whom had no teaching qualifications. It was therefore possible to cut the salary bill by 20%. During the economic boom, student intake rose rapidly from 800 to 2600 and classes were combined, doubling the average class size. Rick reorganised to implement a matrix management structure of teams with only the central management team of four authorised to make any major decisions. A number of teachers lost their jobs after criticising the management team. At this point, parents began to complain. The situation came to a head in January 2010 when the teachers’ car park was requisitioned to build a new classroom and the free education of teachers’ children was stopped. Teachers formed a union and went on strike.

SL questions: 20 marks, 35 minutes
1 Define the following terms:
a motivation (2)
b delegation. (2)
2 Explain two reasons why a democratic leadership style may have been successful for Green Lawns in the 1970s and 1980s. (4)
3 With reference to Green Lawns, discuss two forms of non-financial motivation that could be used to improve staff relations. (6)
4 Explain whether Herzberg would view the teachers’ car park as a hygiene factor or a motivator. (6)

⸻

Page 2:

HL questions 25 marks, 45 minutes
1 Define the following terms:
a motivation (2)
b delegation. (2)
2 Identify two characteristics of working in teams that the new management of Green Lawns might have thought would improve staff motivation. (2)
3 With reference to the car park problem, analyse why businesses such as Green Lawns may use non-financial motivation. (4)
4 Use Likert’s theory to analyse the leadership style of the new management. (6)
5 With reference to two motivation theories, analyse the decision to move from a democratic management structure to a structure with a centralised management team of four. (9)
'''
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess the extracted text."""
        if not text:
            raise ValueError("Cannot process empty text")
        
        # Removes extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Additional preprocessing
        return text.strip()
    
    def generate_flashcards(self, text: str, count: int = 10, subject: Optional[str] = None) -> List[Flashcard]:
        """Generate flashcards from the provided text using LLM."""
        if not text:
            raise ValueError("Cannot generate flashcards from empty text")
        
        if count < 1:
            raise ValueError("Flashcard count must be at least 1")
        
        
        prompt = self._create_flashcard_prompt(text, count, subject)
        
        try:
            
            plan_run = self.portia.run(prompt)
            
            # Extract the response text from the PlanRun object
            
            response_text = plan_run.outputs.__str__() 
            
            # Parse the response to extract flashcards
            flashcards = self._parse_flashcards_from_response(response_text)
            
            if not flashcards:
                raise ValueError("Failed to generate any valid flashcards from the provided content")
                
            return flashcards
            
        except Exception as e:
            raise RuntimeError(f"Error generating flashcards with LLM: {str(e)}")
    
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
