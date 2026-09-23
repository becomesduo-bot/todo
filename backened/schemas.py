from pydantic import BaseModel,EmailStr



class Singup(BaseModel):
    username:str
    password:str
    email:str


class Login(BaseModel):
    email:str
    password:str

class TodoCreate(BaseModel):
    user_id:int
    title:str
    class config:
        from_attributes = True


class TodoDelete(BaseModel):
    user_id:int
    id:int
    class config:
        from_attributes = True 


class TodoUpdate(BaseModel):
    user_id:int
    id:int
    title:str
    class config:
        from_attributes = True       
class GetTodo(BaseModel):
    
    id:int
    
    
