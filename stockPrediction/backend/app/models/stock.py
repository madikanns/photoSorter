from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base

class Stock(Base):
    """Stock information model."""
    __tablename__ = "stocks"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    exchange = Column(String(50))
    sector = Column(String(100))
    industry = Column(String(100))
    market_cap = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    # Relationships
    prices = relationship("StockPrice", back_populates="stock")
    indicators = relationship("StockIndicator", back_populates="stock")
    sentiments = relationship("SentimentAnalysis", back_populates="stock")
    predictions = relationship("Prediction", back_populates="stock")

class StockPrice(Base):
    """Stock price data model."""
    __tablename__ = "stock_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    open_price = Column(Float, nullable=False)
    high_price = Column(Float, nullable=False)
    low_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=False)
    volume = Column(Integer)
    adjusted_close = Column(Float)
    
    # Relationships
    stock = relationship("Stock", back_populates="prices")
    
    # Indexes
    __table_args__ = (
        Index('ix_stock_prices_stock_date', 'stock_id', 'date'),
    )

class StockIndicator(Base):
    """Technical indicators model."""
    __tablename__ = "stock_indicators"
    
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    indicator_type = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    metadata = Column(JSONB)
    
    # Relationships
    stock = relationship("Stock", back_populates="indicators")
    
    # Indexes
    __table_args__ = (
        Index('ix_stock_indicators_stock_date_type', 'stock_id', 'date', 'indicator_type'),
    )
