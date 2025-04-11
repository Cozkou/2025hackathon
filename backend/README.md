# StudentTools Backend

This is the backend service for StudentTools, providing APIs for calendar integration, flashcards, and past paper generation.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### First Time Setup

1. Clone the repository
```bash
git clone [your-repo-url]
cd 2025hackathon/backend
```

2. Create a virtual environment
```bash
# Create venv
python -m venv venv

# Activate venv (choose based on your OS)
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

### Running the Server

1. Activate virtual environment (if not already activated)
```bash
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
```

2. Start the development server
```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

### API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative API docs: `http://localhost:8000/redoc`

### Development Workflow & Dependency Management

#### Daily Development
1. Always activate your virtual environment before working:
   ```bash
   source venv/bin/activate  # or .\venv\Scripts\activate on Windows
   ```

2. When pulling new changes:
   ```bash
   git pull
   # If requirements.txt was updated, run:
   pip install -r requirements.txt
   ```

#### Adding New Dependencies
If you need to add a new package:
1. Install it:
   ```bash
   pip install new-package-name
   ```

2. Update requirements.txt:
   ```bash
   pip freeze > requirements.txt
   ```

3. Commit and push the changes:
   ```bash
   git add requirements.txt
   git commit -m "add: new-package-name dependency"
   git push
   ```

4. Notify team members to run:
   ```bash
   pip install -r requirements.txt
   ```

#### Tips for Dependency Management
- Always use virtual environment
- Never commit your venv folder
- Check requirements.txt changes when pulling
- If you're unsure about dependencies, run `pip install -r requirements.txt`
- When adding packages, specify versions to ensure consistency

### Project Structure

```
backend/
├── main.py          # Main FastAPI application
├── requirements.txt # Project dependencies
└── .gitignore      # Git ignore rules
```

### Available Endpoints

- `GET /` - Homepage
- `GET /calendar` - Calendar integration
- `GET /flashcards` - Get flashcards
- `POST /flashcards` - Create flashcard
- `POST /papers/generate` - Generate past paper
- `GET /papers/{paper_id}` - Retrieve generated paper 