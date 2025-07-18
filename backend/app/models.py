from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)

    campaigns = relationship("Campaign", back_populates="owner")

class Campaign(Base):
    __tablename__ = 'campaigns'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    product = Column(Text)
    audience = Column(Text)
    tone = Column(String)
    language = Column(String)
    ad_copy = Column(Text)
    social_media = Column(Text)
    quote = Column(Text)
    image_url = Column(Text)
    created_at = Column(DateTime, default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="campaigns")
