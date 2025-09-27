from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from .base import Base

class Portfolio(Base):
    """User portfolio model."""
    __tablename__ = "portfolio"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    symbol = Column(String(10), nullable=False)
    quantity = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    current_price = Column(Float)
    notes = Column(Text)
    
    # Indexes
    __table_args__ = (
        Index('ix_portfolio_user_symbol', 'user_id', 'symbol'),
    )

class Watchlist(Base):
    """User watchlist model."""
    __tablename__ = "watchlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    symbol = Column(String(10), nullable=False)
    added_date = Column(DateTime, nullable=False)
    notes = Column(Text)
    
    # Indexes
    __table_args__ = (
        Index('ix_watchlist_user_symbol', 'user_id', 'symbol'),
    )

class Alert(Base):
    """User alerts model."""
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    symbol = Column(String(10), nullable=False)
    alert_type = Column(String(50), nullable=False)  # price, sentiment, volume
    target_value = Column(Float, nullable=False)
    condition = Column(String(20), nullable=False)  # above, below, equals
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime, nullable=False)
    triggered_date = Column(DateTime)
    notes = Column(Text)
    
    # Indexes
    __table_args__ = (
        Index('ix_alerts_user_active', 'user_id', 'is_active'),
    )
