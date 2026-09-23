from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base

class Singup(Base):
    __tablename__ = "singup"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, index=True)
    password = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)


class Todo(Base):
    __tablename__ = "todo"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    user_id = Column(Integer, ForeignKey("singup.id"))