from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from core import limiter
from database import get_db
from schemas import ProcedureDetailOut
from services import get_procedure_by_id

router = APIRouter()


@router.get(
    "/procedures/{procedure_id}",
    response_model=ProcedureDetailOut,
    status_code=status.HTTP_200_OK,
)
@limiter.limit("60/minute")
async def get_procedure(
    request: Request,
    procedure_id: int,
    db: AsyncSession = Depends(get_db),
) -> ProcedureDetailOut:
    return await get_procedure_by_id(procedure_id=procedure_id, db=db)