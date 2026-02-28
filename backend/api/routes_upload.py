from fastapi import APIRouter, Depends, UploadFile

from auth.dependencies import get_current_user
from schemas.upload import UploadResponse
from services.ipfs_service import upload_to_ipfs

router = APIRouter(tags=["upload"])


@router.post("/upload", response_model=UploadResponse, dependencies=[Depends(get_current_user)])
async def upload_invoice(file: UploadFile):
    cid, url = await upload_to_ipfs(file)
    return UploadResponse(cid=cid, url=url)
