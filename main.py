from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core import limiter, redis_client
from routes import route_catalog, route_procedure


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    await redis_client.aclose()


app = FastAPI(
    title="Иван Игоревич — Косметология и пирсинг",
    lifespan=lifespan,
)

# Защита от спама/DDoS по IP
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

# Подключаем API-роуты с версионированным префиксом
app.include_router(route_catalog, prefix="/api/v1", tags=["Catalog"])
app.include_router(route_procedure, prefix="/api/v1", tags=["Procedures"])

# Монтируем папки с фото и статикой фронтенда
app.mount("/images", StaticFiles(directory="images"), name="images")
app.mount("/static", StaticFiles(directory="frontend"), name="static")


# Отдаём главную страницу и SPA-маршруты фронтенда
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(request: Request, full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    return FileResponse(Path("frontend/index.html"))