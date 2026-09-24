# Todo App (FastAPI + React)

## Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# API docs: http://localhost:8000/docs

## Frontend
cd frontend
npm install
npm run dev
# App: http://localhost:5173

Production: set SECRET_KEY env var for the backend and VITE_API_URL for the frontend.
