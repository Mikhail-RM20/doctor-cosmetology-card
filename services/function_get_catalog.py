from redis import RedisError
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import TypeAdapter
from sqlalchemy.orm import selectinload

from database import Procedures, Categories
from core import redis_client
from schemas import CategoryOut
from sqlalchemy import select

# TypeAdapter помогает легко превращать list[CategoryOut] в JSON и обратно
catalog_adapter = TypeAdapter(list[CategoryOut])

async def get_catalog(db: AsyncSession) -> list[CategoryOut]:
    cache_key = f"catalog:all"

    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return catalog_adapter.validate_json(cached_data)
    except RedisError:
        # Если Redis недоступен, просто идём дальше в базу данных
        pass

    stmt = (
        select(Categories)
        .options(selectinload(Categories.procedures))
        .order_by(Categories.id)
    )
    result = await db.execute(stmt)
    categories = result.scalars().all()

    # Превращаем ORM-модели в Pydantic-схемы
    catalog_out = [CategoryOut.model_validate(cat) for cat in categories]

    # 3. Сохраняем результат в Redis на 1 час (3600 секунд)
    try:
        json_data = catalog_adapter.dump_json(catalog_out).decode("utf-8")
        await redis_client.set(cache_key, json_data, ex=3600)
    except RedisError:
        pass

    return catalog_out
