from auth.dependencies import CurrentUser
from database.mongodb import get_database
from models.common import UserRole, WarrantyStatus
from models.product import COLLECTION as PRODUCTS_COLLECTION
from models.warranty import COLLECTION as WARRANTIES_COLLECTION
from schemas.dashboard import DashboardStats
from services.product_service import get_warranty_for_product, to_product_response
from services.warranty_utils import compute_offline_status


async def get_dashboard_stats(current_user: CurrentUser) -> DashboardStats:
    db = get_database()
    product_query = {} if current_user.role == UserRole.ADMIN else {"ownerWallet": current_user.wallet}
    warranty_query = {} if current_user.role == UserRole.ADMIN else {"ownerWallet": current_user.wallet}

    total_products = await db[PRODUCTS_COLLECTION].count_documents(product_query)

    active_count = 0
    expired_count = 0
    async for warranty_doc in db[WARRANTIES_COLLECTION].find(warranty_query):
        if compute_offline_status(warranty_doc["expiryDate"]) == WarrantyStatus.ACTIVE:
            active_count += 1
        else:
            expired_count += 1

    recent_docs = await db[PRODUCTS_COLLECTION].find(product_query).sort("createdAt", -1).to_list(length=5)
    recent_products = []
    for doc in recent_docs:
        warranty_doc = await get_warranty_for_product(db, str(doc["_id"]))
        recent_products.append(to_product_response(doc, warranty_doc))

    return DashboardStats(
        totalProducts=total_products,
        activeWarranties=active_count,
        expiredWarranties=expired_count,
        recentProducts=recent_products,
    )
