
from models.users import User
from models.database import SessionLocal
from hashlib import sha256
import jwt
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY', 'secret')

def getUserByUsername(username: str):
    with SessionLocal() as session:
        return session.query(User).filter_by(username=username).first()

def createUser(username: str, hashed_password: str):
    with SessionLocal() as session:
        user = User(username=username, hashed_password=hashed_password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

def verifyPassword(plain_password: str, hashed_password: str):
    hashed_input = hashPassword(plain_password)
    return hashed_input == hashed_password

def hashPassword(password: str):
    return sha256(password.encode()).hexdigest()

def registerUser(username: str, password: str):
    with SessionLocal() as session:
        existing = session.query(User).filter_by(username=username).first()
        if existing:
            raise ValueError("Username already exists")
        hashed_password = hashPassword(password)
        user = User(username=username, hashed_password=hashed_password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

def loginUser(username: str, password: str):
    with SessionLocal() as session:
        user = session.query(User).filter_by(username=username).first()
        if not user:
            raise ValueError("Invalid username or password")
        if not verifyPassword(password, user.hashed_password):
            raise ValueError("Invalid username or password")
        return jwt.encode({"id": user.id, "username": user.username}, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")