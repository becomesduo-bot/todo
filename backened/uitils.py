
from jose import jwt
from passlib.context import CryptContext 

secrete_key="fatima"
algorithm="HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




def hash_password(password:str):
    return pwd_context.hash(password)


def verify_password(password:str,hashed_password:str):
    return pwd_context.verify(password,hashed_password)


def create_token(user_id:int):
    payload={"sub":str(user_id)
    }
    token= jwt.encode(payload,secrete_key,algorithm="HS256")
    return token



def get_user_id (token:str):
    try:
        payload=jwt.decode(
            token,secrete_key,algorithms=["HS256"]
        )
        user_id=payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code401,
            detail="invalid token")
            return int(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401,detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401,detail="Invalid token")        