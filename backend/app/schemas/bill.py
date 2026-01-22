from pydantic import BaseModel
from typing import List
from datetime import datetime

class BillItemCreate(BaseModel):
    product_id: int
    quantity: int

class BillItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price_per_unit: float
    subtotal: float

    class Config:
        from_attributes = True  # FIX: Changed from_attributed to from_attributes

class BillCreate(BaseModel):
    items: List[BillItemCreate]

class BillResponse(BaseModel):
    id: int
    bill_number: str
    total_amount: float
    created_by: int
    created_at: datetime
    items: List[BillItemResponse]

    class Config:
        from_attributes = True