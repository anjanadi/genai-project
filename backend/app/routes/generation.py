from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_db, get_current_user
from ..services.ai_service import generate_campaign

router = APIRouter()

@router.post("/generate-campaign")
def generate(data: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    result = generate_campaign(**data)
    return result
