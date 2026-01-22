from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import engine, Base
from app.routers import auth, product, bills, user, reports

Base.metadata.create_all(bind=engine)

security = HTTPBearer()

app = FastAPI(
    title="Store Management System API",
    description="API for managing store inventory, bills, and users",
    version="1.0.0",
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True,
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(product.router)
app.include_router(bills.router)
app.include_router(user.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "message": "Store Management System API",
        "docs": "/docs",
        "redoc": "/redoc"
    }
