from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import routes_auth, routes_dashboard, routes_products, routes_upload, routes_user, routes_verify
from config import get_settings
from database.mongodb import close_mongo_connection, connect_to_mongo, ensure_indexes
from middleware.error_handlers import register_error_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    await ensure_indexes()
    yield
    close_mongo_connection()


app = FastAPI(title="WarrantyVault API", version="1.0.0", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(routes_auth.router)
app.include_router(routes_user.router)
app.include_router(routes_products.router)
app.include_router(routes_verify.router)
app.include_router(routes_upload.router)
app.include_router(routes_dashboard.router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
