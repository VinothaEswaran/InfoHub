from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserOut
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_KWARGS = dict(
    httponly=True,
    samesite="lax",
    secure=settings.ENV == "production",
    max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await auth_service.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = await auth_service.register_user(
        db, email=payload.email, full_name=payload.full_name, password=payload.password
    )
    token = auth_service.issue_token_for_user(user)
    response.set_cookie("access_token", token, **COOKIE_KWARGS)
    return user


@router.post("/login", response_model=UserOut)
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user = await auth_service.authenticate_user(db, email=payload.email, password=payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = auth_service.issue_token_for_user(user)
    response.set_cookie("access_token", token, **COOKIE_KWARGS)
    return user


@router.get("/google/login")
async def google_login():
    return RedirectResponse(auth_service.build_google_authorize_url())


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    user = await auth_service.handle_google_callback(db, code=code)
    token = auth_service.issue_token_for_user(user)
    redirect = RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard")
    redirect.set_cookie("access_token", token, **COOKIE_KWARGS)
    return redirect


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"detail": "Logged out"}
