from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PortfolioBase(BaseModel):
    symbol: str = Field(..., max_length=10)
    quantity: float
    purchase_price: float
    purchase_date: datetime
    current_price: Optional[float] = None
    notes: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    user_id: int

class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class WatchlistBase(BaseModel):
    symbol: str = Field(..., max_length=10)
    added_date: datetime
    notes: Optional[str] = None

class WatchlistCreate(WatchlistBase):
    user_id: int

class WatchlistResponse(WatchlistBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    symbol: str = Field(..., max_length=10)
    alert_type: str = Field(..., max_length=50)
    target_value: float
    condition: str = Field(..., max_length=20)
    is_active: bool = True
    created_date: datetime
    triggered_date: Optional[datetime] = None
    notes: Optional[str] = None

class AlertCreate(AlertBase):
    user_id: int

class AlertResponse(AlertBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True
