from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class StockBase(BaseModel):
    symbol: str = Field(..., max_length=10)
    name: str = Field(..., max_length=255)
    exchange: Optional[str] = Field(None, max_length=50)
    sector: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    market_cap: Optional[float] = None

class StockCreate(StockBase):
    pass

class StockUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    exchange: Optional[str] = Field(None, max_length=50)
    sector: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    market_cap: Optional[float] = None
    is_active: Optional[bool] = None

class StockResponse(StockBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StockPriceBase(BaseModel):
    date: datetime
    open_price: float
    high_price: float
    low_price: float
    close_price: float
    volume: Optional[int] = None
    adjusted_close: Optional[float] = None

class StockPriceCreate(StockPriceBase):
    stock_id: int

class StockPriceResponse(StockPriceBase):
    id: int
    stock_id: int
    
    class Config:
        from_attributes = True

class StockIndicatorBase(BaseModel):
    date: datetime
    indicator_type: str = Field(..., max_length=50)
    value: float
    metadata: Optional[Dict[str, Any]] = None

class StockIndicatorCreate(StockIndicatorBase):
    stock_id: int

class StockIndicatorResponse(StockIndicatorBase):
    id: int
    stock_id: int
    
    class Config:
        from_attributes = True

class StockQuote(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    high_52_week: Optional[float] = None
    low_52_week: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    last_updated: datetime

class MarketOverview(BaseModel):
    sp500: Optional[StockQuote] = None
    nasdaq: Optional[StockQuote] = None
    dow: Optional[StockQuote] = None
    vix: Optional[StockQuote] = None
    timestamp: datetime
