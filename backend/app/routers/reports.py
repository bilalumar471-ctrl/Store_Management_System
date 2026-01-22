from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import Optional
from app.database import get_db
from app.models.bill import Bill
from app.models.bill_item import BillItem
from app.models.product import Product
from app.models.user import User
from app.dependencies.auth import get_admin_or_above

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/sales/daily")
def get_daily_sales(
    report_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_above)
):
    # Parse date or use today
    if report_date:
        target_date = datetime.strptime(report_date, "%Y-%m-%d").date()
    else:
        target_date = date.today()
    
    # Get bills for the date
    bills = db.query(Bill).filter(
        func.date(Bill.created_at) == target_date
    ).all()
    
    total_sales = sum(bill.total_amount for bill in bills)
    bill_count = len(bills)
    
    bills_summary = [
        {
            "bill_number": bill.bill_number,
            "total_amount": bill.total_amount,
            "created_at": bill.created_at,
            "created_by": bill.creator.full_name
        }
        for bill in bills
    ]
    
    return {
        "date": target_date,
        "total_sales": total_sales,
        "bill_count": bill_count,
        "bills": bills_summary
    }

@router.get("/profit/daily")
def get_daily_profit(
    report_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_or_above)
):
    # Parse date or use today
    if report_date:
        target_date = datetime.strptime(report_date, "%Y-%m-%d").date()
    else:
        target_date = date.today()
    
    # Get bill items for the date with product info
    bill_items = db.query(BillItem, Product).join(
        Bill, BillItem.bill_id == Bill.id
    ).join(
        Product, BillItem.product_id == Product.id
    ).filter(
        func.date(Bill.created_at) == target_date
    ).all()
    
    total_profit = 0
    product_breakdown = {}
    
    for bill_item, product in bill_items:
        profit = (bill_item.price_per_unit - product.purchase_price) * bill_item.quantity
        total_profit += profit
        
        if bill_item.product_name not in product_breakdown:
            product_breakdown[bill_item.product_name] = {
                "quantity_sold": 0,
                "profit": 0
            }
        
        product_breakdown[bill_item.product_name]["quantity_sold"] += bill_item.quantity
        product_breakdown[bill_item.product_name]["profit"] += profit
    
    return {
        "date": target_date,
        "total_profit": round(total_profit, 2),
        "product_breakdown": product_breakdown
    }