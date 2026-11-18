from pydantic import BaseModel, ConfigDict


class ProcedureDetailOut(BaseModel):
    """Подробная схема одной процедуры для отдельной страницы."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    price: int
    description: str
    category_id: int
    category_title: str