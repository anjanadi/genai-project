from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class CampaignBase(BaseModel):
    title: str
    product: str
    audience: str
    tone: str
    language: str
    ad_copy: str
    social_media: str
    quote: str
    image_url: Optional[str]

class CampaignCreate(CampaignBase):
    pass

class CampaignOut(CampaignBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
