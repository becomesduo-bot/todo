
from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from todo import (create_todo,get_todo,update_todo,delete_todo)
from schemas import TodoCreate,TodoUpdate,TodoDelete





router =APIRouter(prefix="/todo")

@router.post("/create")
def create(todo:TodoCreate,db:Session=Depends(get_db)):
    return create_todo(todo,db)

@router.get("/get")
def get(db:Session=Depends(get_db)):
    return get_todo(db)

@router.put("/update")
def update(todo:TodoUpdate,db:Session=Depends(get_db)):
    return update_todo(todo,db)

@router.delete("/delete")
def delete(todo:TodoDelete,db:Session=Depends(get_db)):
    return delete_todo(todo,db)
