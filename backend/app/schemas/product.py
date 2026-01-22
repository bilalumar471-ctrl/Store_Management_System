from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    quantity: int
    purchase_price: float
    selling_price: float
    category: Optional[str] = None
    supplier: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    category: Optional[str] = None
    supplier: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True