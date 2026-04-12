from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
import logging

from database import get_db
from models import User
from schemas import UserLogin, UserRegister, TokenResponse, UserResponse
from config import settings

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"verify_password error: {e}")
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(authorization: Optional[str] = None, db: Session = Depends(get_db)):
    from fastapi import Header
    
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Extract token from Authorization header
    token = None
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
    
    if not token:
        raise credential_exception
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credential_exception
    except JWTError:
        raise credential_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credential_exception
    return user

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        email=user_data.email,
        username=user_data.email.split("@")[0],
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role="client"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(new_user)
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"🔐 Login attempt for: {credentials.email}")
    
    # Query user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        logger.warning(f"❌ User not found: {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    logger.info(f"✅ User found: {user.email} (ID: {user.id})")
    logger.debug(f"   Hashed password in DB: {user.hashed_password[:50]}...")
    logger.debug(f"   Is active: {user.is_active}")
    logger.debug(f"   Is admin: {user.is_admin}")
    
    # Verify password
    try:
        password_valid = verify_password(credentials.password, user.hashed_password)
        logger.info(f"   Password verification: {'✅ VALID' if password_valid else '❌ INVALID'}")
    except Exception as e:
        logger.error(f"❌ Password verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not password_valid:
        logger.warning(f"❌ Password mismatch for: {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_active:
        logger.warning(f"⚠️  Inactive user attempted login: {credentials.email}")
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    logger.info(f"✅ Login successful for: {credentials.email}")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "must_reset_password": bool(getattr(user, 'must_reset_password', False)),
        "user": UserResponse.model_validate(user)
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    authorization: Optional[str] = None,
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    return UserResponse.model_validate(current_user)
