from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/todos", tags=["Todos"])


def get_user_todo(todo_id: int, db: Session, user: models.User) -> models.Todo:
    todo = (
        db.query(models.Todo)
        .filter(models.Todo.id == todo_id, models.Todo.owner_id == user.id)
        .first()
    )
    if not todo:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Todo not found")
    return todo


@router.post("/", response_model=schemas.TodoOut, status_code=status.HTTP_201_CREATED)
def create_todo(
    data: schemas.TodoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    todo = models.Todo(**data.model_dump(), owner_id=current_user.id)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.get("/", response_model=List[schemas.TodoOut])
def list_todos(
    is_completed: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Todo).filter(models.Todo.owner_id == current_user.id)
    if is_completed is not None:
        query = query.filter(models.Todo.is_completed == is_completed)
    return query.order_by(models.Todo.id.desc()).offset(skip).limit(limit).all()


@router.get("/{todo_id}", response_model=schemas.TodoOut)
def get_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_user_todo(todo_id, db, current_user)


@router.patch("/{todo_id}", response_model=schemas.TodoOut)
def update_todo(
    todo_id: int,
    data: schemas.TodoUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    todo = get_user_todo(todo_id, db, current_user)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(todo, field, value)
    db.commit()
    db.refresh(todo)
    return todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    todo = get_user_todo(todo_id, db, current_user)
    db.delete(todo)
    db.commit()
