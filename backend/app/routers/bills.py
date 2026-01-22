from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from app.database import get_db
from app.models.bill import Bill
from app.models.bill_item import BillItem
from app.models.product import Product
from app.models.user import User
from app.schemas.bill import BillCreate, BillResponse
from app.dependencies.auth import get_user_or_above, get_admin_or_above

router = APIRouter(prefix="/api/bills", tags=["Bills"])

@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
def create_bill(
    bill_data: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_user_or_above)
):
    # Validate products and check stock
    total_amount = 0
    bill_items_data = []
    
    for item in bill_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item.product_id} not found"
            )
        
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.quantity}"
            )
        
        subtotal = product.selling_price * item.quantity
        total_amount += subtotal
        
        bill_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "price_per_unit": product.selling_price,
            "subtotal": subtotal
        })
    
    # Generate bill number
    bill_count = db.query(Bill).count()
    bill_number = f"BILL{datetime.now().strftime('%Y%m%d')}{bill_count + 1:04d}"
    
    # Create bill
    db_bill = Bill(
        bill_number=bill_number,
        total_amount=total_amount,
        created_by=current_user.id
    )
    db.add(db_bill)
    db.flush()  # Get the bill ID
    
    # Create bill items and update inventory
    for item_data in bill_items_data:
        bill_item = BillItem(
            bill_id=db_bill.id,
            product_id=item_data["product"].id,
            product_name=item_data["product"].name,
            quantity=item_data["quantity"],
            price_per_unit=item_data["price_per_unit"],
            subtotal=item_data["subtotal"]
        )
        db.add(bill_item)
        
        # Update product quantity
        item_data["product"].quantity -= item_data["quantity"]
    
    db.commit()
    db.refresh(db_bill)
    return db_bill

@router.get("/my-bills", response_model=List[BillResponse])
def get_my_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_user_or_above)
):
    """Get bills created by the current user"""
    bills = db.query(Bill).filter(Bill.created_by == current_user.id).order_by(Bill.created_at.desc()).all()
    return bills

@router.get("", response_model=List[BillResponse])
def get_all_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_above)
):
    bills = db.query(Bill).order_by(Bill.created_at.desc()).all()
    return bills

@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_user_or_above)
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill