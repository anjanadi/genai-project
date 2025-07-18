# backend/app/routers/analytics.py
from fastapi import APIRouter, Depends, HTTPException
from ..dependencies import get_current_user  


router = APIRouter()

@router.get("/analytics")
def get_analytics(current_user=Depends(get_current_user)):
    # Dummy data for now
    return {
        "total_impressions": 12458,
        "total_clicks": 1843,
        "conversions": 327,
        "conversion_rate": "2.63%",
        "campaigns": [
            {"title": "Eco Bottle", "impressions": 5823, "clicks": 723, "rate": "2.31%"},
            {"title": "Summer Sale", "impressions": 6635, "clicks": 1120, "rate": "3.02%"}
        ]
    }
