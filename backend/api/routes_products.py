from fastapi import APIRouter, Depends

from auth.dependencies import CurrentUser, get_current_user
from schemas.product import ProductCreateRequest, ProductResponse, TransferRequest, TransferResponse
from services.product_service import create_product, get_product, list_products, list_transfers, transfer_product

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductResponse, status_code=201)
async def register_product(payload: ProductCreateRequest, current_user: CurrentUser = Depends(get_current_user)):
    return await create_product(current_user, payload)


@router.get("", response_model=list[ProductResponse])
async def get_products(current_user: CurrentUser = Depends(get_current_user)):
    return await list_products(current_user)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_by_id(product_id: str):
    return await get_product(product_id)


@router.post("/{product_id}/transfer", response_model=TransferResponse)
async def transfer_product_ownership(
    product_id: str, payload: TransferRequest, current_user: CurrentUser = Depends(get_current_user)
):
    return await transfer_product(current_user, product_id, payload)


@router.get("/{product_id}/transfers", response_model=list[TransferResponse])
async def get_product_transfers(product_id: str):
    return await list_transfers(product_id)
