# StudentTools

A tool for students to generate practice papers, manage flashcards, and integrate with calendars.

## 🔧 Prerequisites

- Docker Desktop (Mac/Windows) or Docker Engine (Linux)
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- OpenAI API key

## 🚀 Quick Setup

### Prerequisites

1. **Install Docker**
   - **Mac**: 
     - Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
     - Install and start Docker Desktop
     - Wait for the whale icon 🐳 to appear in your menu bar
   
   - **Windows**:
     - Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
     - Install and start Docker Desktop
     - Wait for the whale icon 🐳 to appear in your system tray
   
   - **Linux**:
     ```bash
     # Ubuntu/Debian
     sudo apt update
     sudo apt install docker.io docker-compose
     sudo systemctl start docker
     sudo systemctl enable docker
     ```



### 🛠 Setup & Running

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd 2025hackathon
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   # Replace 'your-key-here' with your actual OpenAI API key
   nano .env
   ```

3. **Build and run with Docker**
   ```bash
   # Build and start all services
   docker compose up --build
   
   # Or run in detached mode (background)
   docker compose up --build -d
   ```

4. **Access the services**
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Frontend: http://localhost:3000 (when frontend is ready)

### 🔄 Development Workflow

1. **View logs**
   ```bash
   # View all logs
   docker compose logs -f
   
   # View specific service logs
   docker compose logs -f backend
   ```

2. **Stop the services**
   ```bash
   # If running in foreground, use Ctrl+C
   # If running in background:
   docker compose down
   ```

3. **Rebuild after changes**
   ```bash
   # After changing requirements.txt or Dockerfile
   docker compose up --build
   ```

### 🐛 Troubleshooting

1. **Docker not running**
   - Check if Docker Desktop is running (look for the whale icon 🐳)
   - Try restarting Docker Desktop

2. **Port conflicts**
   - If ports 8000 or 3000 are in use, modify the ports in docker-compose.yml:
     ```yaml
     ports:
       - "8001:8000"  # Change 8001 to any available port
     ```

3. **Clean start**
   ```bash
   # Remove all containers and volumes
   docker compose down --volumes
   docker compose up --build
   ```

### 📁 Project Structure

```
2025hackathon/
├── backend/              # FastAPI backend service
│   ├── app/
│   │   ├── services/    # Business logic
│   │   ├── models/      # Data models
│   │   └── api/         # API endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── studytoolsai-next/   # Next.js frontend service
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Next.js pages
│   │   ├── services/   # API services
│   │   └── styles/     # CSS/styling files
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## 🚀 Getting Started

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/2025hackathon.git
cd 2025hackathon

# Copy environment file
cp .env.example .env
```

### 2. Environment Setup

Edit `.env` file and add your configuration:
```env
# Backend Configuration
OPENAI_API_KEY=your_api_key_here
BACKEND_PORT=8000

# Frontend Configuration
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:8000
```

### 3. Running with Docker

```bash
# Build and start all services
docker compose up --build

# Backend will be available at: http://localhost:8000
# Frontend will be available at: http://localhost:3000
```

## 💻 Development Guide

### Backend Development

1. Local Setup (without Docker):
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

2. API Documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend Development

1. Local Setup (without Docker):
```bash
cd studytoolsai-next
npm install
npm run dev
```

2. Available Scripts:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run test     # Run tests
```

3. Key Frontend Features:
- React 18+ with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### Working with Docker

1. Start all services:
```bash
docker compose up
```

2. Rebuild after changes:
```bash
docker compose up --build
```

3. View logs:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f studytoolsai-next
```

4. Stop services:
```bash
docker compose down
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**
```bash
# Check what's using the ports
lsof -i :3000  # Frontend port
lsof -i :8000  # Backend port

# Alternative ports in .env
FRONTEND_PORT=3001
BACKEND_PORT=8001
```

2. **Docker Issues**
```bash
# Clean up Docker resources
docker compose down
docker system prune -a  # Warning: removes all unused containers/images

# Rebuild from scratch
docker compose up --build --force-recreate
```

3. **Frontend Development**
- If npm install fails:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- If hot reload isn't working:
  ```bash
  # In frontend/.env
  CHOKIDAR_USEPOLLING=true
  ```

4. **Backend Development**
- If requirements.txt changes:
  ```bash
  docker compose build backend
  ```
- If API isn't accessible:
  Check CORS settings in backend/app/main.py

## 🤝 Contributing

### Branch Naming Convention

Use the following format for branch names:
```
<type>/<description>
```

Types:
- `feature/` - New features (e.g., feature/add-pdf-generation)
- `fix/` - Bug fixes (e.g., fix/pdf-formatting-issue)
- `docs/` - Documentation changes (e.g., docs/update-api-docs)
- `refactor/` - Code refactoring (e.g., refactor/restructure-pdf-service)
- `test/` - Adding or modifying tests (e.g., test/pdf-generation-tests)
- `chore/` - Maintenance tasks (e.g., chore/update-dependencies)

Examples:
- `feature/flashcard-creation`
- `fix/calendar-sync-bug`
- `docs/setup-instructions`
- `refactor/api-structure`
- `test/paper-generation`
- `chore/update-python-deps`

### Development Process

1. Create a new branch following the naming convention
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
   - Keep commits small and focused
   - Write clear commit messages

3. Test thoroughly
   - Run all tests
   - Test the Docker setup
   - Verify API endpoints

4. Create a pull request
   - Use a clear PR title
   - Describe your changes
   - Link any related issues

## 📝 License

[Add your license here]