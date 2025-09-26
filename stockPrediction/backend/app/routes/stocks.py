from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

from ..database import get_db
from ..models.stock import Stock, StockPrice, StockIndicator
from ..schemas.stock import StockResponse, StockPriceResponse, StockIndicatorResponse
from ..services.stock_service import StockService
from ..services.technical_analysis import TechnicalAnalysisService
from ..utils.auth import get_current_user

router = APIRouter()

@router.get("/search", response_model=List[StockResponse])
async def search_stocks(
    query: str = Query(..., min_length=1, max_length=50),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search for stocks by symbol or name."""
    try:
        stock_service = StockService(db)
        stocks = await stock_service.search_stocks(query, limit)
        return stocks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search stocks: {str(e)}"
        )

@router.get("/{symbol}", response_model=StockResponse)
async def get_stock(
    symbol: str,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific stock."""
    try:
        stock_service = StockService(db)
        stock = await stock_service.get_stock_by_symbol(symbol.upper())
        
        if not stock:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stock {symbol} not found"
            )
        
        return stock
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock: {str(e)}"
        )

@router.get("/{symbol}/price", response_model=StockPriceResponse)
async def get_stock_price(
    symbol: str,
    period: str = Query("1d", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max)$"),
    interval: str = Query("1m", regex="^(1m|2m|5m|15m|30m|60m|90m|1h|1d|5d|1wk|1mo|3mo)$"),
    db: Session = Depends(get_db)
):
    """Get current and historical price data for a stock."""
    try:
        stock_service = StockService(db)
        price_data = await stock_service.get_stock_price(symbol.upper(), period, interval)
        
        if not price_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Price data for {symbol} not found"
            )
        
        return price_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock price: {str(e)}"
        )

@router.get("/{symbol}/history", response_model=List[StockPriceResponse])
async def get_stock_history(
    symbol: str,
    start_date: Optional[str] = Query(None, regex="^\d{4}-\d{2}-\d{2}$"),
    end_date: Optional[str] = Query(None, regex="^\d{4}-\d{2}-\d{2}$"),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get historical price data for a stock."""
    try:
        stock_service = StockService(db)
        
        # Parse dates
        start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        history = await stock_service.get_stock_history(
            symbol.upper(), 
            start_date=start, 
            end_date=end, 
            limit=limit
        )
        
        return history
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock history: {str(e)}"
        )

@router.get("/{symbol}/indicators", response_model=List[StockIndicatorResponse])
async def get_stock_indicators(
    symbol: str,
    indicators: Optional[str] = Query(None, description="Comma-separated list of indicators"),
    db: Session = Depends(get_db)
):
    """Get technical indicators for a stock."""
    try:
        technical_service = TechnicalAnalysisService(db)
        
        # Parse indicators
        indicator_list = indicators.split(",") if indicators else [
            "sma_20", "ema_12", "rsi", "macd", "bollinger_bands"
        ]
        
        indicators_data = await technical_service.calculate_indicators(
            symbol.upper(), 
            indicator_list
        )
        
        return indicators_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock indicators: {str(e)}"
        )

@router.get("/{symbol}/quote")
async def get_stock_quote(
    symbol: str,
    db: Session = Depends(get_db)
):
    """Get real-time quote for a stock."""
    try:
        stock_service = StockService(db)
        quote = await stock_service.get_real_time_quote(symbol.upper())
        
        if not quote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quote for {symbol} not found"
            )
        
        return quote
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock quote: {str(e)}"
        )

@router.get("/{symbol}/news")
async def get_stock_news(
    symbol: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get news related to a specific stock."""
    try:
        stock_service = StockService(db)
        news = await stock_service.get_stock_news(symbol.upper(), limit)
        
        return news
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock news: {str(e)}"
        )

@router.get("/{symbol}/recommendations")
async def get_stock_recommendations(
    symbol: str,
    db: Session = Depends(get_db)
):
    """Get analyst recommendations for a stock."""
    try:
        stock_service = StockService(db)
        recommendations = await stock_service.get_analyst_recommendations(symbol.upper())
        
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock recommendations: {str(e)}"
        )

@router.get("/market/overview")
async def get_market_overview(
    db: Session = Depends(get_db)
):
    """Get overall market overview and key indices."""
    try:
        stock_service = StockService(db)
        overview = await stock_service.get_market_overview()
        
        return overview
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get market overview: {str(e)}"
        )

@router.get("/market/top-gainers")
async def get_top_gainers(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get top gaining stocks."""
    try:
        stock_service = StockService(db)
        gainers = await stock_service.get_top_gainers(limit)
        
        return gainers
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get top gainers: {str(e)}"
        )

@router.get("/market/top-losers")
async def get_top_losers(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get top losing stocks."""
    try:
        stock_service = StockService(db)
        losers = await stock_service.get_top_losers(limit)
        
        return losers
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get top losers: {str(e)}"
        )

@router.get("/market/most-active")
async def get_most_active(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get most actively traded stocks."""
    try:
        stock_service = StockService(db)
        active = await stock_service.get_most_active(limit)
        
        return active
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get most active stocks: {str(e)}"
        )
