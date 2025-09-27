from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class SentimentBase(BaseModel):
    overall_sentiment: float = Field(..., ge=-1, le=1)
    confidence: float = Field(..., ge=0, le=1)
    positive_score: float = Field(0, ge=0, le=1)
    negative_score: float = Field(0, ge=0, le=1)
    neutral_score: float = Field(0, ge=0, le=1)
    source_count: int = Field(0, ge=0)

class SentimentCreate(SentimentBase):
    stock_id: int
    date: datetime
    metadata: Optional[Dict[str, Any]] = None

class SentimentResponse(SentimentBase):
    id: int
    stock_id: int
    date: datetime
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class NewsSentimentBase(BaseModel):
    title: str
    content: Optional[str] = None
    source: Optional[str] = Field(None, max_length=100)
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    sentiment_score: float = Field(..., ge=-1, le=1)
    confidence: float = Field(..., ge=0, le=1)
    keywords: Optional[List[str]] = None

class NewsSentimentCreate(NewsSentimentBase):
    sentiment_analysis_id: int

class NewsSentimentResponse(NewsSentimentBase):
    id: int
    sentiment_analysis_id: int
    
    class Config:
        from_attributes = True

class SocialSentimentBase(BaseModel):
    platform: str = Field(..., max_length=50)
    content: str
    author: Optional[str] = Field(None, max_length=100)
    post_id: Optional[str] = Field(None, max_length=100)
    created_at: Optional[datetime] = None
    sentiment_score: float = Field(..., ge=-1, le=1)
    confidence: float = Field(..., ge=0, le=1)
    engagement_metrics: Optional[Dict[str, Any]] = None

class SocialSentimentCreate(SocialSentimentBase):
    sentiment_analysis_id: int

class SocialSentimentResponse(SocialSentimentBase):
    id: int
    sentiment_analysis_id: int
    
    class Config:
        from_attributes = True

class SentimentTrend(BaseModel):
    date: datetime
    sentiment: float
    confidence: float
    source: str

class SentimentSource(BaseModel):
    source: str
    sentiment: float
    confidence: float
    count: int
    weight: float

class SentimentAlert(BaseModel):
    symbol: str
    alert_type: str  # significant_change, extreme_sentiment, etc.
    current_sentiment: float
    previous_sentiment: float
    change: float
    confidence: float
    timestamp: datetime
