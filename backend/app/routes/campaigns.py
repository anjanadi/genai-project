from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..dependencies import get_db, get_current_user

router = APIRouter()

@router.post("/campaigns", response_model=schemas.CampaignOut)
def save_campaign(campaign: schemas.CampaignCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud.create_campaign(db, campaign, user.id)

@router.get("/campaigns", response_model=list[schemas.CampaignOut])
def get_campaigns(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud.get_user_campaigns(db, user.id)
