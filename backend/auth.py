from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Optional
import os
import httpx

# schema for JWT token authentication
security = HTTPBearer()

async def verify_supabase_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """function that verifies a Supabase JWT token and returns the user ID"""
    try:
        token = credentials.credentials
        
        # extract user id from Supabase JWT
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")  # 'sub' field saves the user id
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user ID found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return user_id
        
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_current_user(user_id: str = Depends(verify_supabase_token)) -> str:
    """
    Dependency function that returns the currently logged in user ID, 
    used in the FastAPI endpoint as Depends(get_current_user)
    """
    return user_id

# optional authentication (endpoints that are accessible without log in)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[str]:
    """
    optional authentication: if the token exists, return the user id
    else, return none
    """
    if not credentials:
        return None
    
    try:
        return await verify_supabase_token(credentials)
    except HTTPException:
        return None

# 실제 프로덕션 환경에서는 Supabase JWT Secret으로 토큰 검증
async def verify_supabase_token_production(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    프로덕션 환경용: 실제 Supabase JWT Secret으로 토큰 검증
    """
    try:
        token = credentials.credentials
        supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        
        if not supabase_jwt_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="JWT secret not configured"
            )
        
        # 실제 서명 검증
        payload = jwt.decode(
            token, 
            supabase_jwt_secret, 
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user ID found"
            )
        
        return user_id
        
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )