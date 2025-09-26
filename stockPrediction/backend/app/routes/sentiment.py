from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models.sentiment import SentimentAnalysis, NewsSentiment, SocialSentiment
from ..schemas.sentiment import SentimentResponse, NewsSentimentResponse, SocialSentimentResponse
from ..services.sentiment_service import SentimentService
from ..services.news_service import NewsService
from ..services.social_service import SocialService
from ..utils.auth import get_current_user

router = APIRouter()

@router.get("/{symbol}", response_model=SentimentResponse)
async def get_stock_sentiment(
    symbol: str,
    timeframe: str = Query("1d", regex="^(1h|1d|1w|1m)$"),
    db: Session = Depends(get_db)
):
    """Get overall sentiment analysis for a stock."""
    try:
        sentiment_service = SentimentService(db)
        sentiment = await sentiment_service.get_stock_sentiment(symbol.upper(), timeframe)
        
        if not sentiment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sentiment data for {symbol} not found"
            )
        
        return sentiment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock sentiment: {str(e)}"
        )

@router.get("/{symbol}/news", response_model=List[NewsSentimentResponse])
async def get_news_sentiment(
    symbol: str,
    limit: int = Query(20, ge=1, le=100),
    timeframe: str = Query("1d", regex="^(1h|1d|1w|1m)$"),
    db: Session = Depends(get_db)
):
    """Get news sentiment analysis for a stock."""
    try:
        news_service = NewsService(db)
        news_sentiment = await news_service.get_news_sentiment(
            symbol.upper(), 
            limit=limit, 
            timeframe=timeframe
        )
        
        return news_sentiment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get news sentiment: {str(e)}"
        )

@router.get("/{symbol}/social", response_model=List[SocialSentimentResponse])
async def get_social_sentiment(
    symbol: str,
    platform: Optional[str] = Query(None, regex="^(twitter|reddit|stocktwits|all)$"),
    limit: int = Query(50, ge=1, le=200),
    timeframe: str = Query("1d", regex="^(1h|1d|1w|1m)$"),
    db: Session = Depends(get_db)
):
    """Get social media sentiment analysis for a stock."""
    try:
        social_service = SocialService(db)
        social_sentiment = await social_service.get_social_sentiment(
            symbol.upper(),
            platform=platform,
            limit=limit,
            timeframe=timeframe
        )
        
        return social_sentiment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get social sentiment: {str(e)}"
        )

@router.post("/analyze")
async def analyze_text_sentiment(
    text: str,
    db: Session = Depends(get_db)
):
    """Analyze sentiment of custom text."""
    try:
        sentiment_service = SentimentService(db)
        analysis = await sentiment_service.analyze_text(text)
        
        return {
            "text": text,
            "sentiment": analysis.sentiment,
            "confidence": analysis.confidence,
            "positive_score": analysis.positive_score,
            "negative_score": analysis.negative_score,
            "neutral_score": analysis.neutral_score,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze text sentiment: {str(e)}"
        )

@router.get("/{symbol}/trends")
async def get_sentiment_trends(
    symbol: str,
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get sentiment trends over time for a stock."""
    try:
        sentiment_service = SentimentService(db)
        trends = await sentiment_service.get_sentiment_trends(symbol.upper(), days)
        
        return trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sentiment trends: {str(e)}"
        )

@router.get("/{symbol}/sources")
async def get_sentiment_sources(
    symbol: str,
    timeframe: str = Query("1d", regex="^(1h|1d|1w|1m)$"),
    db: Session = Depends(get_db)
):
    """Get sentiment breakdown by source (news, social, etc.)."""
    try:
        sentiment_service = SentimentService(db)
        sources = await sentiment_service.get_sentiment_by_source(symbol.upper(), timeframe)
        
        return sources
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sentiment sources: {str(e)}"
        )

@router.get("/market/overview")
async def get_market_sentiment(
    db: Session = Depends(get_db)
):
    """Get overall market sentiment."""
    try:
        sentiment_service = SentimentService(db)
        market_sentiment = await sentiment_service.get_market_sentiment()
        
        return market_sentiment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get market sentiment: {str(e)}"
        )

@router.get("/{symbol}/alerts")
async def get_sentiment_alerts(
    symbol: str,
    threshold: float = Query(0.7, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """Get sentiment alerts for significant sentiment changes."""
    try:
        sentiment_service = SentimentService(db)
        alerts = await sentiment_service.get_sentiment_alerts(
            symbol.upper(), 
            threshold=threshold
        )
        
        return alerts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get sentiment alerts: {str(e)}"
        )

@router.post("/{symbol}/refresh")
async def refresh_sentiment_data(
    symbol: str,
    db: Session = Depends(get_db)
):
    """Manually refresh sentiment data for a stock."""
    try:
        sentiment_service = SentimentService(db)
        result = await sentiment_service.refresh_sentiment_data(symbol.upper())
        
        return {
            "symbol": symbol.upper(),
            "status": "success",
            "message": "Sentiment data refreshed successfully",
            "timestamp": datetime.utcnow(),
            "data_points": result.get("data_points", 0)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh sentiment data: {str(e)}"
        )

@router.get("/{symbol}/comparison")
async def compare_sentiment(
    symbol: str,
    compare_symbols: str = Query(..., description="Comma-separated list of symbols to compare"),
    timeframe: str = Query("1d", regex="^(1h|1d|1w|1m)$"),
    db: Session = Depends(get_db)
):
    """Compare sentiment between multiple stocks."""
    try:
        sentiment_service = SentimentService(db)
        symbols = [s.strip().upper() for s in compare_symbols.split(",")]
        comparison = await sentiment_service.compare_sentiment(
            symbol.upper(), 
            symbols, 
            timeframe
        )
        
        return comparison
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare sentiment: {str(e)}"
        )
