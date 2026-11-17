from slowapi import Limiter
from slowapi.util import get_remote_address

from core.config import config_set

# Ограничитель запросов по IP с хранением счётчиков в запароленном Redis.
# По умолчанию разрешаем не более 60 запросов в минуту с одного IP-адреса.
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=config_set.redis_url,
    default_limits=["60/minute"],
)