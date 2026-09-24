import os
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

import bcrypt
import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import ForeignKey, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-in-production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24

engine = create_engine("sqlite:///./todos.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    password_hash: Mapped[str]


class Todo(Base):
    __tablename__ = "todos"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    done: Mapped[bool] = mapped_column(default=False)
    priority: Mapped[str] = mapped_column(default="medium")
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)


Base.metadata.create_all(engine)

Priority = Literal["low", "medium", "high"]


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=6, max_length=100)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    priority: Priority = "medium"


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    done: Optional[bool] = None
    priority: Optional[Priority] = None


class TodoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    done: bool
    priority: str
    created_at: datetime


app = FastAPI(title="Todo API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
oauth2 = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def make_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def current_user(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> User:
    error = HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired. Please log in again.")
    try:
        user_id = int(jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise error
    user = db.get(User, user_id)
    if not user:
        raise error
    return user


@app.post("/auth/register", response_model=TokenOut, status_code=201)
def register(data: Credentials, db: Session = Depends(get_db)):
    username = data.username.strip().lower()
    if db.scalar(select(User).where(User.username == username)):
        raise HTTPException(400, "That username is already taken.")
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    user = User(username=username, password_hash=hashed)
    db.add(user)
    db.commit()
    return TokenOut(access_token=make_token(user.id))


@app.post("/auth/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == form.username.strip().lower()))
    if not user or not bcrypt.checkpw(form.password.encode(), user.password_hash.encode()):
        raise HTTPException(400, "Wrong username or password.")
    return TokenOut(access_token=make_token(user.id))


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@app.get("/todos", response_model=list[TodoOut])
def list_todos(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.scalars(select(Todo).where(Todo.owner_id == user.id).order_by(Todo.created_at.desc())).all()


@app.post("/todos", response_model=TodoOut, status_code=201)
def create_todo(data: TodoCreate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    todo = Todo(title=data.title.strip(), priority=data.priority, owner_id=user.id)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def own_todo(todo_id: int, user: User, db: Session) -> Todo:
    todo = db.get(Todo, todo_id)
    if not todo or todo.owner_id != user.id:
        raise HTTPException(404, "Task not found.")
    return todo


@app.patch("/todos/{todo_id}", response_model=TodoOut)
def update_todo(todo_id: int, data: TodoUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    todo = own_todo(todo_id, user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(todo, key, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.delete(own_todo(todo_id, user, db))
    db.commit()
