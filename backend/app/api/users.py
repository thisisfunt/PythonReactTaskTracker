from fastapi.routing import APIRouter
from fastapi import Header, HTTPException
from schemas.users import UserLogin, UserRegister, UserResponse
from services.users import registerUser, loginUser, getUserByUsername, decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends


router = APIRouter(prefix="/users")
security_scheme = HTTPBearer()


@router.get("/me")
def getMe(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    if not credentials or not credentials.scheme == "Bearer":
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = credentials.credentials
    try:
        payload = decode_token(token)
        return UserResponse(id=payload["id"], username=payload["username"])
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/login")
def login(user: UserLogin):
    try:
        token = loginUser(user.username, user.password)
        return {"token": token}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/register")
def register(user: UserRegister):
    try:
        new_user = registerUser(user.username, user.password)
        return UserResponse(id=new_user.id, username=new_user.username)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))