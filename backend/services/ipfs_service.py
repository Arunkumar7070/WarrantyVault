import httpx
from fastapi import UploadFile

from config import get_settings

PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"


async def upload_to_ipfs(file: UploadFile) -> tuple[str, str]:
    """Uploads a file to IPFS via Pinata. Returns (cid, gateway_url)."""
    settings = get_settings()
    if not settings.pinata_jwt:
        raise RuntimeError("PINATA_JWT is not configured")

    content = await file.read()
    files = {"file": (file.filename, content, file.content_type or "application/octet-stream")}
    headers = {"Authorization": f"Bearer {settings.pinata_jwt}"}

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(PINATA_PIN_FILE_URL, headers=headers, files=files)
        response.raise_for_status()
        data = response.json()

    cid = data["IpfsHash"]
    return cid, f"{settings.pinata_gateway_url}/{cid}"
