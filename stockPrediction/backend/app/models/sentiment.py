from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base

class SentimentAnalysis(Base):
    """Overall sentiment analysis model."""
    __tablename__ = "sentiment_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    overall_sentiment = Column(Float, nullable=False)  # -1 to 1
    confidence = Column(Float, nullable=False)  # 0 to 1
    positive_score = Column(Float, default=0)
    negative_score = Column(Float, default=0)
    neutral_score = Column(Float, default=0)
    source_count = Column(Integer, default=0)
    metadata = Column(JSONB)
    
    # Relationships
    stock = relationship("Stock", back_populates="sentiments")
    news_sentiments = relationship("NewsSentiment", back_populates="sentiment_analysis")
    social_sentiments = relationship("SocialSentiment", back_populates="sentiment_analysis")
    
    # Indexes
    __table_args__ = (
        Index('ix_sentiment_analysis_stock_date', 'stock_id', 'date'),
    )

class NewsSentiment(Base):
    """News sentiment analysis model."""
    __tablename__ = "news_sentiment"
    
    id = Column(Integer, primary_key=True, index=True)
    sentiment_analysis_id = Column(Integer, ForeignKey("sentiment_analysis.id"), nullable=False)
    title = Column(Text, nullable=False)
    content = Column(Text)
    source = Column(String(100))
    url = Column(Text)
    published_at = Column(DateTime)
    sentiment_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    keywords = Column(JSONB)
    
    # Relationships
    sentiment_analysis = relationship("SentimentAnalysis", back_populates="news_sentiments")
    
    # Indexes
    __table_args__ = (
        Index('ix_news_sentiment_analysis_date', 'sentiment_analysis_id', 'published_at'),
    )

class SocialSentiment(Base):
    """Social media sentiment analysis model."""
    __tablename__ = "social_sentiment"
    
    id = Column(Integer, primary_key=True, index=True)
    sentiment_analysis_id = Column(Integer, ForeignKey("sentiment_analysis.id"), nullable=False)
    platform = Column(String(50), nullable=False)  # twitter, reddit, stocktwits
    content = Column(Text, nullable=False)
    author = Column(String(100))
    post_id = Column(String(100))
    created_at = Column(DateTime)
    sentiment_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    engagement_metrics = Column(JSONB)
    
    # Relationships
    sentiment_analysis = relationship("SentimentAnalysis", back_populates="social_sentiments")
    
    # Indexes
    __table_args__ = (
        Index('ix_social_sentiment_analysis_platform', 'sentiment_analysis_id', 'platform'),
    )
