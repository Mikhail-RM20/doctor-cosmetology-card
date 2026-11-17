from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from schemas import CategoryOut
from core import limiter
from database import get_db
from services import get_catalog

router = APIRouter()

@router.get("/catalog", response_model=list[CategoryOut], status_code=status.HTTP_200_OK)
@limiter.limit("60/minute")
async def catalog(
        request: Request,
        db: AsyncSession = Depends(get_db),
):
    return await get_catalog(db=db)