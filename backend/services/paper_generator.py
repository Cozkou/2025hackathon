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
            
            # You can change the model here. Available options include:
            # - claude-3-opus-20240229 (most powerful)
            # - claude-3-sonnet-20240229 (balanced)
            # - claude-3-haiku-20240229 (fastest)
            model = "claude-3-opus-20240229"  # Change this to use a different model
            
            system_message = """You are an expert exam paper generator specializing in creating well-structured, professionally formatted exam papers. 

CRITICAL: ONLY RETURN THE MARKDOWN FOR THE EXAM PAPER. DO NOT INCLUDE ANY OTHER TEXT, EXPLANATIONS, OR COMMENTS. YOUR ENTIRE RESPONSE SHOULD BE VALID MARKDOWN THAT CAN BE DIRECTLY PROCESSED.

Follow these guidelines for the markdown:

1. FORMATTING REQUIREMENTS:
   - Use proper markdown formatting that will convert well to PDF
   - Start with a clear # Title
   - Use ## for section headers
   - Use ### for question numbers
   - Ensure consistent spacing between sections (one blank line)
   - Use proper markdown for any special formatting

2. PAPER STRUCTURE:
   - Start with paper title, subject, and difficulty level
   - Include clear instructions section
   - Number all questions consistently
   - Group related questions under appropriate sections
   - End with total marks and time allocation

3. QUESTION FORMATTING:
   - Each question should start with ### Question X (Y marks)
   - Use proper markdown lists for multi-part questions:
     a) First part
     b) Second part
   - For mathematical equations, use proper markdown math notation:
     Example: $x^2 + y^2 = z^2$
   - For code snippets, use proper code blocks:
     ```python
     def example():
         pass
     ```

4. SPECIFIC MARKDOWN ELEMENTS TO USE:
   - Tables: Use | column1 | column2 | format
   - Bold: **important text**
   - Italic: *emphasized text*
   - Lists: Both ordered (1. 2. 3.) and unordered (- * +)
   - Blockquotes: > for important notes
   - Horizontal rules: --- for section breaks

Example of expected output format:
```markdown
# Mathematics Examination Paper
## General Instructions
- Time allowed: 2 hours
- Total marks: 100

## Section A: Algebra
### Question 1 (10 marks)
Solve the following equation:
$3x + 4 = 10$

a) Show your working
b) Verify your answer
```

REMEMBER: YOUR RESPONSE MUST BE PURE MARKDOWN ONLY. DO NOT ADD ANY EXPLANATIONS OR COMMENTS OUTSIDE THE MARKDOWN CONTENT."""

            # Call Claude API directly - note: messages.create() is not async
            message = self.anthropic.messages.create(
                model=model,
                max_tokens=4096,
                temperature=0.7,
                system=system_message,
                messages=[
                    {
                        "role": "user",
                        "content": f"Generate a {difficulty} difficulty version of this exam paper. Return ONLY the markdown content, no other text. Content to base it on:\n\n{text}"
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

    async def make_pdf(self, content: Dict[str, Any]) -> bytes:
        """
        Convert markdown content to PDF using markdown and pdfkit
        Args:
            content: Dictionary containing generated_content key with markdown text
        Returns:
            bytes: The generated PDF as bytes
        """
        try:
            import markdown
            import pdfkit
            from io import BytesIO

            # Convert markdown to HTML with extensions for better formatting
            md = markdown.Markdown(extensions=[
                'markdown.extensions.tables',
                'markdown.extensions.fenced_code',
                'markdown.extensions.nl2br',
                'markdown.extensions.sane_lists'
            ])
            html_content = md.convert(content["generated_content"])
            
            # Add HTML wrapper with comprehensive styling
            html_document = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    @page {{
                        size: A4;
                        margin: 2.5cm 2cm;
                    }}
                    
                    body {{
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    
                    /* Headers */
                    h1, h2, h3, h4, h5, h6 {{
                        font-family: 'Arial', sans-serif;
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                        line-height: 1.2;
                        color: #2c3e50;
                    }}
                    
                    h1 {{
                        font-size: 24px;
                        border-bottom: 2px solid #eee;
                        padding-bottom: 10px;
                    }}
                    
                    h2 {{
                        font-size: 20px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 8px;
                    }}
                    
                    /* Paragraphs and Lists */
                    p {{
                        margin: 1em 0;
                        text-align: justify;
                    }}
                    
                    ul, ol {{
                        margin: 1em 0;
                        padding-left: 2em;
                    }}
                    
                    li {{
                        margin: 0.5em 0;
                    }}
                    
                    /* Code Blocks */
                    pre {{
                        background-color: #f5f5f5;
                        padding: 15px;
                        border-radius: 5px;
                        overflow-x: auto;
                        font-family: 'Courier New', monospace;
                        margin: 1em 0;
                    }}
                    
                    code {{
                        font-family: 'Courier New', monospace;
                        background-color: #f5f5f5;
                        padding: 2px 5px;
                        border-radius: 3px;
                    }}
                    
                    /* Tables */
                    table {{
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1em 0;
                    }}
                    
                    th, td {{
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }}
                    
                    th {{
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }}
                    
                    /* Blockquotes */
                    blockquote {{
                        margin: 1em 0;
                        padding-left: 1em;
                        border-left: 4px solid #ddd;
                        color: #666;
                    }}
                    
                    /* Math and Equations */
                    .math {{
                        font-family: 'Times New Roman', serif;
                        font-style: italic;
                    }}
                    
                    /* Question Formatting */
                    .question {{
                        margin: 1.5em 0;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }}
                    
                    .question-number {{
                        font-weight: bold;
                        color: #2c3e50;
                        margin-right: 10px;
                    }}
                    
                    /* Page Breaks */
                    .page-break {{
                        page-break-after: always;
                    }}
                </style>
            </head>
            <body>
                {html_content}
            </body>
            </html>
            """
            
            # Configure pdfkit options for better rendering
            options = {
                'page-size': 'A4',
                'margin-top': '25mm',
                'margin-right': '20mm',
                'margin-bottom': '25mm',
                'margin-left': '20mm',
                'encoding': 'UTF-8',
                'no-outline': None,
                'enable-local-file-access': None,
                'print-media-type': None,
                'javascript-delay': '1000',
                'enable-smart-shrinking': None,
                'dpi': '300'
            }
            
            # Convert HTML to PDF bytes with improved options
            pdf_bytes = pdfkit.from_string(
                html_document,
                False,
                options=options,
                css=None
            )
            
            return pdf_bytes
            
        except Exception as e:
            print(f"Error creating PDF: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error creating PDF: {str(e)}")

    def get_paper_path(self, paper_id: str) -> Optional[str]:
        """Get the path for a paper. Returns None if doesn't exist"""
        path = os.path.join(self.output_dir, f"{paper_id}.pdf")
        return path if os.path.exists(path) else None

    async def generate(self, pdf_file: UploadFile, difficulty: str) -> bytes:
        """
        Main function that:
        1. Gets PDF content
        2. Sends to Claude
        3. Returns PDF bytes directly
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
            
            # Create the PDF and return bytes directly
            content_dict = {"generated_content": generated_content}
            pdf_bytes = await self.make_pdf(content_dict)
            
            return pdf_bytes
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) 