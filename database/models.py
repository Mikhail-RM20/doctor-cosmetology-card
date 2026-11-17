from database import Base
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import Integer, String, ForeignKey

class Categories(Base):
    __tablename__ = 'category'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False, unique=True)

    procedures: Mapped[list["Procedures"]] = relationship(
        back_populates="category",
    )


class Procedures(Base):
    __tablename__ = 'procedure'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey('category.id'), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)

    category: Mapped["Categories"] = relationship(back_populates="procedures")

