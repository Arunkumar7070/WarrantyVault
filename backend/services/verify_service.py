from bson import ObjectId
from fastapi import HTTPException, status

from blockchain.service import get_warranty_status_onchain, verify_by_serial_onchain
from config import get_settings
from database.mongodb import get_database
from models.common import WarrantyStatus
from models.product import COLLECTION as PRODUCTS_COLLECTION
from models.warranty import COLLECTION as WARRANTIES_COLLECTION
from schemas.verify import VerifyRequest, VerifyResponse


async def verify_warranty(payload: VerifyRequest) -> VerifyResponse:
    if payload.warrantyId is None and not payload.serialNumber:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Provide either warrantyId or serialNumber"
        )

    if payload.warrantyId is not None:
        warranty_id = payload.warrantyId
        onchain_status = get_warranty_status_onchain(warranty_id)
    else:
        onchain_status, warranty_id = verify_by_serial_onchain(payload.serialNumber)

    if onchain_status == WarrantyStatus.NOT_FOUND or warranty_id == 0:
        return VerifyResponse(status=WarrantyStatus.NOT_FOUND)

    db = get_database()
    contract_address = get_settings().contract_address
    warranty_doc = await db[WARRANTIES_COLLECTION].find_one(
        {"warrantyId": warranty_id, "contractAddress": contract_address}
    )
    if warranty_doc is None:
        return VerifyResponse(status=onchain_status, warrantyId=warranty_id)

    product_doc = await db[PRODUCTS_COLLECTION].find_one({"_id": ObjectId(warranty_doc["productId"])})

    return VerifyResponse(
        status=onchain_status,
        warrantyId=warranty_id,
        productId=warranty_doc["productId"],
        productName=product_doc["name"] if product_doc else None,
        ownerWallet=warranty_doc["ownerWallet"],
        expiryDate=warranty_doc["expiryDate"],
    )
