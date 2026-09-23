from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes import login, todo
from database import SessionLocal
# ---- Database tables banayein ----
Base.metadata.create_all(bind=engine)

app = FastAPI(title="my app")

# ---- CORS Middleware ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers include karein ----
app.include_router(login.router)
app.include_router(todo.router)


@app.get("/")
def root():
    return {"message": "Backend is running!"}