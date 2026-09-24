# Todo API (FastAPI + JWT)

## Setup
```
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # SECRET_KEY zaroor badlo
uvicorn app.main:app --reload
```
Docs: http://127.0.0.1:8000/docs  ("Authorize" button se login karo)

## Endpoints
- POST /auth/register
- POST /auth/login
- GET  /users/me
- POST/GET /todos/
- GET/PATCH/DELETE /todos/{id}
