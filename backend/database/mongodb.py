from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import get_settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def connect_to_mongo() -> None:
    global _client, _db
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client[settings.mongodb_db_name]


def close_mongo_connection() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def get_database() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return _db


async def ensure_indexes() -> None:
    db = get_database()
    await db.users.create_index("wallet", unique=True)
    await db.products.create_index("serialNumber", unique=True)
    await db.warranties.create_index("productId")
    await db.warranties.create_index("ownerWallet")
    # warrantyId is only unique within a given deployed contract - a redeploy
    # (new address) resets the on-chain counter back to 1, so the index must
    # be scoped per contractAddress rather than on warrantyId alone.
    await db.warranties.create_index([("contractAddress", 1), ("warrantyId", 1)], unique=True)
    await db.transfers.create_index("productId")
    await db.notifications.create_index("userWallet")
