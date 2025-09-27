from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class PredictionBase(BaseModel):
    date: datetime
    timeframe: str = Field(..., max_length=10)
    predicted_price: float
    confidence: float = Field(..., ge=0, le=1)
    actual_price: Optional[float] = None
    accuracy: Optional[float] = None
    features_used: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class PredictionCreate(PredictionBase):
    stock_id: int
    model_id: int

class PredictionResponse(PredictionBase):
    id: int
    stock_id: int
    model_id: int
    
    class Config:
        from_attributes = True

class PredictionModelBase(BaseModel):
    name: str = Field(..., max_length=100)
    model_type: str = Field(..., max_length=50)
    version: str = Field(..., max_length=20)
    is_active: bool = True
    training_date: Optional[datetime] = None
    accuracy_score: Optional[float] = None
    model_parameters: Optional[Dict[str, Any]] = None
    model_path: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None

class PredictionModelCreate(PredictionModelBase):
    pass

class PredictionModelResponse(PredictionModelBase):
    id: int
    
    class Config:
        from_attributes = True

class PredictionAccuracyBase(BaseModel):
    timeframe: str = Field(..., max_length=10)
    date: datetime
    accuracy_score: float = Field(..., ge=0, le=1)
    mae: Optional[float] = None  # Mean Absolute Error
    mse: Optional[float] = None  # Mean Squared Error
    rmse: Optional[float] = None  # Root Mean Squared Error
    r2_score: Optional[float] = None  # R-squared score
    sample_size: Optional[int] = None

class PredictionAccuracyCreate(PredictionAccuracyBase):
    model_id: int

class PredictionAccuracyResponse(PredictionAccuracyBase):
    id: int
    model_id: int
    
    class Config:
        from_attributes = True

class PredictionConfidence(BaseModel):
    symbol: str
    timeframe: str
    confidence: float
    factors: List[str]
    risk_level: str  # low, medium, high
    recommendation: str  # buy, hold, sell

class PredictionLeaderboard(BaseModel):
    symbol: str
    accuracy: float
    predictions_count: int
    timeframe: str
    model_type: str
    rank: int
