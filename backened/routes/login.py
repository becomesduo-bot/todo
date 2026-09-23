from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from login import get_user_login, create_user
from schemas import Singup, Login


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/signup")
def signup(user: Singup, db: Session = Depends(get_db)):
    return create_user(user, db)


@router.post("/login")
def login(user: Login, db: Session = Depends(get_db)):
    return get_user_login(user, db)
