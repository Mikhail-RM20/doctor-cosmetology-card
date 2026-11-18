from fastapi import HTTPException, status
from redis.exceptions import RedisError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from core import redis_client
from database import Procedures
from schemas import ProcedureDetailOut


async def get_procedure_by_id(
    procedure_id: int,
    db: AsyncSession,
) -> ProcedureDetailOut:
    """
    Возвращает подробную информацию об одной процедуре по её ID.
    Использует кэш Redis с фоллбэком в PostgreSQL.
    """
    cache_key = f"procedure:{procedure_id}"

    # 1. Пробуем достать готовую карточку из Redis
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return ProcedureDetailOut.model_validate_json(cached_data)
    except RedisError:
        pass

    # 2. Ищем в PostgreSQL вместе с названием категории
    stmt = (
        select(Procedures)
        .options(joinedload(Procedures.category))
        .where(Procedures.id == procedure_id)
    )
    result = await db.execute(stmt)
    procedure = result.scalar_one_or_none()

    if procedure is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Процедура с ID {procedure_id} не найдена.",
        )

    procedure_out = ProcedureDetailOut(
        id=procedure.id,
        title=procedure.title,
        price=procedure.price,
        description=procedure.description,
        category_id=procedure.category_id,
        category_title=procedure.category.title,
    )

    # 3. Сохраняем в Redis на 1 час (3600 секунд)
    try:
        await redis_client.set(
            cache_key, procedure_out.model_dump_json(), ex=3600
        )
    except RedisError:
        pass

    return procedure_out