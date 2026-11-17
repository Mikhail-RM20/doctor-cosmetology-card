from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class ConfigSetting(BaseSettings):
    # Настройка чтения данных из .env файла.
    # BaseSettings - класс, который сам находит значения из .env - файла.
    # SettingsConfigDict - класс, указывающий BaseSettings где искать и как обрабатывать переменные окружения.

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Переменные окружения для работы с СУБД Postgres.

    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str
    postgres_port: int

    # Переменные окружения для работы с Redis.

    redis_host: str
    redis_port: int
    redis_db: str
    redis_password: str

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.postgres_user}"
            f":{self.postgres_password}@{self.postgres_host}:{self.postgres_port}"
            f"/{self.postgres_db}"
        )

    @property
    def redis_url(self) -> str:
        return (
            f"redis://:{self.redis_password}@{self.redis_host}"
            f":{self.redis_port}/{self.redis_db}"
        )


# Используем декоратор lru_cache, для кеширования, создания настройки.
# Возвращает объект настройки.
@lru_cache
def get_config() -> ConfigSetting:
    return ConfigSetting()  # type: ignore[call-arg]


config_set = get_config()


