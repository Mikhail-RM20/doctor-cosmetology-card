from pydantic import BaseModel, ConfigDict


class ProcedureShortOut(BaseModel):
    """Краткая схема процедуры для списка внутри категории."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    price: str


class CategoryOut(BaseModel):
    """Схема категории со списком её процедур."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    procedures: list[ProcedureShortOut]