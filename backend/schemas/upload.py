from pydantic import BaseModel


class UploadResponse(BaseModel):
    cid: str
    url: str
