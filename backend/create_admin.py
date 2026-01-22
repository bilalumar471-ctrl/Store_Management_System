from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.utils.security import get_password_hash

def create_super_admin():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        existing_admin = db.query(User).filter(User.role == "super_admin").first()
        if existing_admin:
            print("Super Admin already exists!")
            return
        
        admin = User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            full_name="Super Administrator",
            email="admin@store.com",
            role="super_admin",
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        
        print("✅ Super Admin created successfully!")
        print("Username: admin")
        print("Password: admin123")
        print("⚠️  IMPORTANT: Change this password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()