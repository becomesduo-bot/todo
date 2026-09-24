from fastapi import FastAPI

from app.database import Base, engine
from app.routers import auth, todos, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API", version="1.0.0")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(todos.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "Todo API is running"}
