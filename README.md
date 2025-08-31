# Telehealth Monorepo

This repository contains the full-stack telehealth application, including both backend and frontend code.

## Project Structure

- `backend/` - FastAPI backend, database models, API endpoints, and scripts
- `frontend/` - React + TypeScript + Vite frontend for web client

## Getting Started

### Backend
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```sh
   uvicorn app.main:app --reload
   ```

### Frontend
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Deployment
- See `docker-compose.yml` for multi-service deployment.

## License
Specify your license here.
