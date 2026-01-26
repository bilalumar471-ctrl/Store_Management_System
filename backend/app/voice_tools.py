"""
Voice Assistant Tools - Functions that can be called by the AI assistant
"""
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.models.product import Product
from app.models.bill import Bill
from app.models.bill_item import BillItem
from app.models.user import User
from app.utils.security import get_password_hash


# Define the tools/functions available to the AI
VOICE_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_bill",
            "description": "Create a new bill/sale with the specified products. Use this when user wants to generate a bill, make a sale, or checkout items.",
            "parameters": {
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "description": "List of products to include in the bill",
                        "items": {
                            "type": "object",
                            "properties": {
                                "product_name": {
                                    "type": "string",
                                    "description": "Name of the product (case insensitive, partial match allowed)"
                                },
                                "quantity": {
                                    "type": "integer",
                                    "description": "Quantity to purchase"
                                }
                            },
                            "required": ["product_name", "quantity"]
                        }
                    }
                },
                "required": ["items"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_product_stock",
            "description": "Check the current stock/inventory level of a specific product",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Name of the product to check"
                    }
                },
                "required": ["product_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_product_price",
            "description": "Get the selling price of a product",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Name of the product"
                    }
                },
                "required": ["product_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_all_products",
            "description": "List all products in the store with their stock and prices",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_product",
            "description": "Add a new product to the store inventory. Requires admin or super_admin role.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Product name"
                    },
                    "quantity": {
                        "type": "integer",
                        "description": "Initial stock quantity"
                    },
                    "purchase_price": {
                        "type": "number",
                        "description": "Purchase/cost price"
                    },
                    "selling_price": {
                        "type": "number",
                        "description": "Selling price"
                    }
                },
                "required": ["name", "quantity", "purchase_price", "selling_price"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_product_stock",
            "description": "Update the stock quantity of a product. Requires admin or super_admin role.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Name of the product to update"
                    },
                    "new_quantity": {
                        "type": "integer",
                        "description": "New stock quantity"
                    }
                },
                "required": ["product_name", "new_quantity"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_daily_sales",
            "description": "Get total sales for today or a specific date. Requires admin or super_admin role.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format. Leave empty for today."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_low_stock_products",
            "description": "Get products with low stock (less than specified threshold)",
            "parameters": {
                "type": "object",
                "properties": {
                    "threshold": {
                        "type": "integer",
                        "description": "Stock threshold (default: 10)"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_profit_loss_report",
            "description": "Get profit and loss report for today or a date range. Shows revenue, costs, and profit. Requires admin or super_admin role.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {
                        "type": "string",
                        "description": "Start date in YYYY-MM-DD format. Leave empty for today."
                    },
                    "end_date": {
                        "type": "string",
                        "description": "End date in YYYY-MM-DD format. Leave empty for today."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_users",
            "description": "Get a list of all users in the system. Requires admin or super_admin role.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_user",
            "description": "Create a new user account. Requires super_admin role.",
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {
                        "type": "string",
                        "description": "Username for the new user"
                    },
                    "password": {
                        "type": "string",
                        "description": "Password for the new user"
                    },
                    "full_name": {
                        "type": "string",
                        "description": "Full name of the user"
                    },
                    "email": {
                        "type": "string",
                        "description": "Email address of the user"
                    },
                    "role": {
                        "type": "string",
                        "description": "Role of the user: user, admin, or super_admin"
                    }
                },
                "required": ["username", "password", "full_name", "email", "role"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_user",
            "description": "Delete a user account by username. Requires super_admin role.",
            "parameters": {
                "type": "object",
                "properties": {
                    "username": {
                        "type": "string",
                        "description": "Username of the user to delete"
                    }
                },
                "required": ["username"]
            }
        }
    }
]


def find_product_by_name(db: Session, product_name: str) -> Optional[Product]:
    """Find a product by name (case insensitive, partial match)"""
    # Try exact match first
    product = db.query(Product).filter(
        Product.name.ilike(product_name)
    ).first()
    
    if not product:
        # Try partial match
        product = db.query(Product).filter(
            Product.name.ilike(f"%{product_name}%")
        ).first()
    
    return product


def execute_tool(
    tool_name: str,
    arguments: Dict[str, Any],
    db: Session,
    current_user: User
) -> Dict[str, Any]:
    """Execute a tool and return the result"""
    
    try:
        if tool_name == "create_bill":
            return execute_create_bill(arguments, db, current_user)
        
        elif tool_name == "check_product_stock":
            return execute_check_stock(arguments, db)
        
        elif tool_name == "get_product_price":
            return execute_get_price(arguments, db)
        
        elif tool_name == "list_all_products":
            return execute_list_products(db)
        
        elif tool_name == "add_product":
            return execute_add_product(arguments, db, current_user)
        
        elif tool_name == "update_product_stock":
            return execute_update_stock(arguments, db, current_user)
        
        elif tool_name == "get_daily_sales":
            return execute_daily_sales(arguments, db, current_user)
        
        elif tool_name == "get_low_stock_products":
            return execute_low_stock(arguments, db)
        
        elif tool_name == "get_profit_loss_report":
            return execute_profit_loss(arguments, db, current_user)
        
        elif tool_name == "get_all_users":
            return execute_get_all_users(db, current_user)
        
        elif tool_name == "create_user":
            return execute_create_user(arguments, db, current_user)
        
        elif tool_name == "delete_user":
            return execute_delete_user(arguments, db, current_user)
        
        else:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


def execute_create_bill(args: Dict, db: Session, user: User) -> Dict:
    """Create a bill with the specified items"""
    items = args.get("items", [])
    
    if not items:
        return {"success": False, "error": "No items specified for the bill"}
    
    # Validate and prepare bill items
    total_amount = 0
    bill_items_data = []
    
    for item in items:
        product_name = item.get("product_name")
        quantity = item.get("quantity", 1)
        
        product = find_product_by_name(db, product_name)
        if not product:
            return {"success": False, "error": f"Product '{product_name}' not found"}
        
        if product.quantity < quantity:
            return {
                "success": False, 
                "error": f"Insufficient stock for {product.name}. Available: {product.quantity}"
            }
        
        subtotal = product.selling_price * quantity
        total_amount += subtotal
        
        bill_items_data.append({
            "product": product,
            "quantity": quantity,
            "price_per_unit": product.selling_price,
            "subtotal": subtotal
        })
    
    # Generate bill number
    bill_count = db.query(Bill).count()
    bill_number = f"BILL{datetime.now().strftime('%Y%m%d')}{bill_count + 1:04d}"
    
    # Create the bill
    db_bill = Bill(
        bill_number=bill_number,
        total_amount=total_amount,
        created_by=user.id
    )
    db.add(db_bill)
    db.flush()
    
    # Create bill items and update inventory
    item_summaries = []
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
        
        item_summaries.append(
            f"{item_data['quantity']}x {item_data['product'].name} @ ${item_data['price_per_unit']:.2f}"
        )
    
    db.commit()
    
    return {
        "success": True,
        "bill_id": db_bill.id,
        "bill_number": bill_number,
        "total_amount": total_amount,
        "items": item_summaries,
        "message": f"Bill {bill_number} created successfully! Total: ${total_amount:.2f}"
    }


def execute_check_stock(args: Dict, db: Session) -> Dict:
    """Check stock for a product"""
    product_name = args.get("product_name")
    product = find_product_by_name(db, product_name)
    
    if not product:
        return {"success": False, "error": f"Product '{product_name}' not found"}
    
    return {
        "success": True,
        "product_name": product.name,
        "quantity": product.quantity,
        "message": f"{product.name} has {product.quantity} units in stock"
    }


def execute_get_price(args: Dict, db: Session) -> Dict:
    """Get price for a product"""
    product_name = args.get("product_name")
    product = find_product_by_name(db, product_name)
    
    if not product:
        return {"success": False, "error": f"Product '{product_name}' not found"}
    
    return {
        "success": True,
        "product_name": product.name,
        "selling_price": product.selling_price,
        "message": f"{product.name} costs ${product.selling_price:.2f}"
    }


def execute_list_products(db: Session) -> Dict:
    """List all products"""
    products = db.query(Product).all()
    
    if not products:
        return {"success": True, "products": [], "message": "No products in inventory"}
    
    product_list = []
    for p in products:
        product_list.append({
            "name": p.name,
            "quantity": p.quantity,
            "price": p.selling_price
        })
    
    summary = ", ".join([f"{p['name']} ({p['quantity']} @ ${p['price']:.2f})" for p in product_list])
    
    return {
        "success": True,
        "products": product_list,
        "message": f"Products in store: {summary}"
    }


def execute_add_product(args: Dict, db: Session, user: User) -> Dict:
    """Add a new product (admin/super_admin only)"""
    if user.role not in ["admin", "super_admin"]:
        return {"success": False, "error": "You don't have permission to add products. Admin access required."}
    
    name = args.get("name")
    quantity = args.get("quantity")
    purchase_price = args.get("purchase_price")
    selling_price = args.get("selling_price")
    
    # Check if product already exists
    existing = db.query(Product).filter(Product.name.ilike(name)).first()
    if existing:
        return {"success": False, "error": f"Product '{name}' already exists"}
    
    product = Product(
        name=name,
        quantity=quantity,
        purchase_price=purchase_price,
        selling_price=selling_price
    )
    db.add(product)
    db.commit()
    
    return {
        "success": True,
        "message": f"Product '{name}' added successfully with {quantity} units at ${selling_price:.2f}"
    }


def execute_update_stock(args: Dict, db: Session, user: User) -> Dict:
    """Update product stock (admin/super_admin only)"""
    if user.role not in ["admin", "super_admin"]:
        return {"success": False, "error": "You don't have permission to update stock. Admin access required."}
    
    product_name = args.get("product_name")
    new_quantity = args.get("new_quantity")
    
    product = find_product_by_name(db, product_name)
    if not product:
        return {"success": False, "error": f"Product '{product_name}' not found"}
    
    old_quantity = product.quantity
    product.quantity = new_quantity
    db.commit()
    
    return {
        "success": True,
        "message": f"Updated {product.name} stock from {old_quantity} to {new_quantity} units"
    }


def execute_daily_sales(args: Dict, db: Session, user: User) -> Dict:
    """Get daily sales (admin/super_admin only)"""
    if user.role not in ["admin", "super_admin"]:
        return {"success": False, "error": "You don't have permission to view sales reports. Admin access required."}
    
    date_str = args.get("date")
    if date_str:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    else:
        target_date = datetime.now().date()
    
    # Get bills for the target date
    bills = db.query(Bill).filter(
        Bill.created_at >= datetime.combine(target_date, datetime.min.time()),
        Bill.created_at < datetime.combine(target_date, datetime.max.time())
    ).all()
    
    total_sales = sum(bill.total_amount for bill in bills)
    
    return {
        "success": True,
        "date": str(target_date),
        "total_bills": len(bills),
        "total_sales": total_sales,
        "message": f"Sales for {target_date}: {len(bills)} bills totaling ${total_sales:.2f}"
    }


def execute_low_stock(args: Dict, db: Session) -> Dict:
    """Get products with low stock"""
    threshold = args.get("threshold", 10)
    
    products = db.query(Product).filter(Product.quantity < threshold).all()
    
    if not products:
        return {"success": True, "products": [], "message": f"No products below {threshold} units"}
    
    low_stock_list = [f"{p.name} ({p.quantity})" for p in products]
    
    return {
        "success": True,
        "products": [{"name": p.name, "quantity": p.quantity} for p in products],
        "message": f"Low stock products: {', '.join(low_stock_list)}"
    }


def execute_profit_loss(args: Dict, db: Session, user: User) -> Dict:
    """Get profit/loss report (admin/super_admin only)"""
    if user.role not in ["admin", "super_admin"]:
        return {"success": False, "error": "You don't have permission to view profit/loss reports. Admin access required."}
    
    start_date_str = args.get("start_date")
    end_date_str = args.get("end_date")
    
    # Default to today if no dates provided
    if start_date_str:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    else:
        start_date = datetime.now().date()
    
    if end_date_str:
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    else:
        end_date = datetime.now().date()
    
    # Get bills in the date range
    from datetime import timedelta
    bills = db.query(Bill).filter(
        Bill.created_at >= datetime.combine(start_date, datetime.min.time()),
        Bill.created_at <= datetime.combine(end_date + timedelta(days=1), datetime.min.time())
    ).all()
    
    if not bills:
        date_range = f"on {start_date}" if start_date == end_date else f"from {start_date} to {end_date}"
        return {
            "success": True,
            "total_revenue": 0,
            "total_cost": 0,
            "profit": 0,
            "message": f"No sales {date_range}. Revenue: $0, Cost: $0, Profit: $0"
        }
    
    total_revenue = 0
    total_cost = 0
    
    for bill in bills:
        total_revenue += bill.total_amount
        
        # Get bill items and calculate cost
        bill_items = db.query(BillItem).filter(BillItem.bill_id == bill.id).all()
        for item in bill_items:
            # Get the product to find purchase price
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                cost = item.quantity * product.purchase_price
                total_cost += cost
    
    profit = total_revenue - total_cost
    profit_margin = (profit / total_revenue * 100) if total_revenue > 0 else 0
    
    date_range = f"on {start_date}" if start_date == end_date else f"from {start_date} to {end_date}"
    profit_status = "profit" if profit >= 0 else "loss"
    
    return {
        "success": True,
        "date_range": {"start": str(start_date), "end": str(end_date)},
        "total_bills": len(bills),
        "total_revenue": total_revenue,
        "total_cost": total_cost,
        "profit": profit,
        "profit_margin": round(profit_margin, 2),
        "message": f"Profit/Loss report {date_range}: Revenue ${total_revenue:.2f}, Cost ${total_cost:.2f}, {profit_status.title()} ${abs(profit):.2f} ({profit_margin:.1f}% margin)"
    }


def execute_get_all_users(db: Session, user: User) -> Dict:
    """Get all users (admin/super_admin only)"""
    if user.role not in ["admin", "super_admin"]:
        return {"success": False, "error": "You don't have permission to view users. Admin access required."}
    
    users = db.query(User).all()
    
    if not users:
        return {"success": True, "users": [], "message": "No users found in the system"}
    
    user_list = []
    for u in users:
        user_list.append({
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active
        })
    
    # Create a summary
    active_count = sum(1 for u in users if u.is_active)
    role_counts = {}
    for u in users:
        role_counts[u.role] = role_counts.get(u.role, 0) + 1
    
    role_summary = ", ".join([f"{count} {role}s" for role, count in role_counts.items()])
    user_names = ", ".join([u.username for u in users[:5]])
    if len(users) > 5:
        user_names += f" and {len(users) - 5} more"
    
    return {
        "success": True,
        "users": user_list,
        "total_count": len(users),
        "active_count": active_count,
        "message": f"There are {len(users)} users: {role_summary}. Users: {user_names}"
    }


def execute_create_user(args: Dict, db: Session, user: User) -> Dict:
    """Create a new user (super_admin only)"""
    if user.role != "super_admin":
        return {"success": False, "error": "You don't have permission to create users. Super Admin access required."}
    
    username = args.get("username")
    password = args.get("password")
    full_name = args.get("full_name")
    email = args.get("email")
    role = args.get("role")
    
    # Validate input
    if not all([username, password, full_name, email, role]):
        return {"success": False, "error": "Missing required fields"}
    
    # Check if user already exists
    if db.query(User).filter(User.username == username).first():
        return {"success": False, "error": f"Username '{username}' already exists"}
    
    if db.query(User).filter(User.email == email).first():
        return {"success": False, "error": f"Email '{email}' already exists"}
    
    # Create user
    hashed_password = get_password_hash(password)
    new_user = User(
        username=username,
        password_hash=hashed_password,
        full_name=full_name,
        email=email,
        role=role,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    
    return {
        "success": True,
        "message": f"User '{username}' created successfully as {role}"
    }


def execute_delete_user(args: Dict, db: Session, user: User) -> Dict:
    """Delete a user (super_admin only)"""
    if user.role != "super_admin":
        return {"success": False, "error": "You don't have permission to delete users. Super Admin access required."}
    
    username = args.get("username")
    
    if not username:
        return {"success": False, "error": "Username is required"}
    
    # Find user
    target_user = db.query(User).filter(User.username == username).first()
    
    if not target_user:
        return {"success": False, "error": f"User '{username}' not found"}
    
    # Prevent deleting self
    if target_user.id == user.id:
        return {"success": False, "error": "You cannot delete your own account"}
    
    # Delete user
    db.delete(target_user)
    db.commit()
    
    return {
        "success": True,
        "message": f"User '{username}' deleted successfully"
    }
