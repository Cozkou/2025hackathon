# StudenTools 📚

## 📋 Project Overview
StudenTools is an innovative academic platform that combines four powerful AI-driven tools to enhance student learning. At its core, it features a smart calendar system that finds optimal study times between lectures and manages revision schedules. The platform includes a dynamic past paper generator that creates custom practice materials when you run out of past papers, an AI-powered flashcard system that converts lecture materials into effective study aids, and a unique TeachBack feature where students reinforce their understanding by teaching concepts to an AI with adjustable intelligence levels.

Our mission is simple: provide students with focused, AI-powered tools that make a real difference in their academic journey. Whether it's finding the perfect study slot, generating practice materials, or strengthening knowledge through teaching, StudenTools streamlines the learning process with modern technology.

### ✨ Key Features

- **Smart Calendar Integration**: 
  - Find free revision slots between lectures automatically
  - Schedule topic-specific revision sessions
  - AI-powered study suggestions based on available time slots
  - Seamless Google Calendar integration for managing study sessions
  - Get personalized study plans based on topic and duration

- **Dynamic Past Paper Generator**: 
  - Generate new practice papers when you run out of past papers
  - Customize difficulty levels to match your preparation stage
  - Create papers similar to original exam formats
  - Adaptive content generation based on your needs

- **AI Flashcard Generator**: 
  - Convert lecture slides into effective flashcards
  - Weekly flashcard generation to keep up with new content
  - Smart organization of learning materials
  - Perfect for consistent revision and quick reviews

- **TeachBack Learning**: 
  - Reverse the learning process by teaching concepts to AI
  - Customize AI's intelligence level and learning speed
  - Control depth of questions and topic complexity
  - Learn through teaching, reinforcing your understanding
  - Interactive Q&A sessions to strengthen knowledge

## 🛠 Technologies Used

### Frontend
- Next.js 14 with React 18
- TypeScript for type safety
- Tailwind CSS for modern, responsive design
- React Icons for UI elements
- Axios for API communication

### Backend
- FastAPI (Python 3.11+)
- Portia.ai for calendar integration
- Claude API for AI features
- Pydantic for data validation
  

### DevOps & Tools
- Docker and Docker Compose for containerization
- Git for version control
- npm for Node.js package management


## 🚀 Setup and Installation

### Prerequisites
- Docker Desktop (Mac/Windows) or Docker Engine (Linux)
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- OpenAI API key
- Portia.ai credentials

### Quick Start
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/2025hackathon.git
   cd 2025hackathon
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Build and run with Docker**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development Setup

1. **Frontend Setup**
   ```bash
   cd studytoolsai-next
   npm install
   npm run dev
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```



## 🔌 Portia.ai Integration
We leveraged Portia.ai's powerful capabilities for our calendar integration tool, making it a cornerstone of our smart scheduling system:

1. **Intelligent Calendar Management**: Used Portia's Google Calendar API to seamlessly integrate with students' schedules
   ```python
   portia:google:gcalendar:create_event(event_title, event_description, start_time, end_time)
   ```

2. **Smart Time Slot Detection**: Utilized Portia's natural language processing to find optimal study periods
 

3. **Automated Session Scheduling**: Implemented Portia's event creation capabilities to automatically schedule and manage study sessions 
