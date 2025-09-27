import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from ..models.stock import Stock, StockPrice, StockIndicator
from ..schemas.stock import StockResponse, StockPriceResponse, StockQuote, MarketOverview

class StockService:
    def __init__(self, db: Session):
        self.db = db

    async def search_stocks(self, query: str, limit: int = 10) -> List[StockResponse]:
        """Search for stocks by symbol or name."""
        stocks = self.db.query(Stock).filter(
            and_(
                Stock.is_active == True,
                (Stock.symbol.ilike(f"%{query}%") | Stock.name.ilike(f"%{query}%"))
            )
        ).limit(limit).all()
        
        return [StockResponse.from_orm(stock) for stock in stocks]

    async def get_stock_by_symbol(self, symbol: str) -> Optional[StockResponse]:
        """Get stock by symbol."""
        stock = self.db.query(Stock).filter(
            and_(Stock.symbol == symbol.upper(), Stock.is_active == True)
        ).first()
        
        if not stock:
            return None
        
        return StockResponse.from_orm(stock)

    async def get_stock_price(self, symbol: str, period: str = "1d", interval: str = "1m") -> Optional[StockPriceResponse]:
        """Get stock price data."""
        try:
            # Get stock from database
            stock = self.db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
            if not stock:
                return None

            # Fetch data from Yahoo Finance
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval=interval)
            
            if data.empty:
                return None

            # Get latest price
            latest = data.iloc[-1]
            
            return StockPriceResponse(
                id=0,  # Will be set when saved to database
                stock_id=stock.id,
                date=latest.name,
                open_price=float(latest['Open']),
                high_price=float(latest['High']),
                low_price=float(latest['Low']),
                close_price=float(latest['Close']),
                volume=int(latest['Volume']),
                adjusted_close=float(latest['Close'])  # Simplified
            )
        except Exception as e:
            print(f"Error fetching stock price for {symbol}: {e}")
            return None

    async def get_stock_history(self, symbol: str, start_date: Optional[datetime] = None, 
                              end_date: Optional[datetime] = None, limit: int = 100) -> List[StockPriceResponse]:
        """Get historical stock data."""
        try:
            stock = self.db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
            if not stock:
                return []

            # Fetch from Yahoo Finance
            ticker = yf.Ticker(symbol)
            data = ticker.history(
                start=start_date,
                end=end_date,
                period="max" if not start_date and not end_date else None
            )
            
            if data.empty:
                return []

            # Convert to response format
            history = []
            for date, row in data.tail(limit).iterrows():
                history.append(StockPriceResponse(
                    id=0,
                    stock_id=stock.id,
                    date=date,
                    open_price=float(row['Open']),
                    high_price=float(row['High']),
                    low_price=float(row['Low']),
                    close_price=float(row['Close']),
                    volume=int(row['Volume']),
                    adjusted_close=float(row['Close'])
                ))
            
            return history
        except Exception as e:
            print(f"Error fetching stock history for {symbol}: {e}")
            return []

    async def get_real_time_quote(self, symbol: str) -> Optional[StockQuote]:
        """Get real-time stock quote."""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            if not info or 'currentPrice' not in info:
                return None

            # Calculate change
            current_price = info.get('currentPrice', 0)
            previous_close = info.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100 if previous_close > 0 else 0

            return StockQuote(
                symbol=symbol.upper(),
                price=current_price,
                change=change,
                change_percent=change_percent,
                volume=info.get('volume', 0),
                market_cap=info.get('marketCap'),
                high_52_week=info.get('fiftyTwoWeekHigh'),
                low_52_week=info.get('fiftyTwoWeekLow'),
                pe_ratio=info.get('trailingPE'),
                dividend_yield=info.get('dividendYield'),
                last_updated=datetime.utcnow()
            )
        except Exception as e:
            print(f"Error fetching quote for {symbol}: {e}")
            return None

    async def get_stock_news(self, symbol: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get news related to a stock."""
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.news
            
            return news[:limit] if news else []
        except Exception as e:
            print(f"Error fetching news for {symbol}: {e}")
            return []

    async def get_analyst_recommendations(self, symbol: str) -> Dict[str, Any]:
        """Get analyst recommendations."""
        try:
            ticker = yf.Ticker(symbol)
            recommendations = ticker.recommendations
            
            if recommendations is None or recommendations.empty:
                return {"recommendations": [], "summary": {}}
            
            # Get latest recommendations
            latest = recommendations.tail(10)
            
            return {
                "recommendations": latest.to_dict('records'),
                "summary": {
                    "total": len(latest),
                    "latest_date": latest.index[-1].strftime('%Y-%m-%d') if not latest.empty else None
                }
            }
        except Exception as e:
            print(f"Error fetching recommendations for {symbol}: {e}")
            return {"recommendations": [], "summary": {}}

    async def get_market_overview(self) -> MarketOverview:
        """Get market overview with key indices."""
        try:
            # Fetch major indices
            indices = {
                '^GSPC': 'S&P 500',
                '^IXIC': 'NASDAQ',
                '^DJI': 'DOW',
                '^VIX': 'VIX'
            }
            
            overview_data = {}
            
            for symbol, name in indices.items():
                try:
                    ticker = yf.Ticker(symbol)
                    info = ticker.info
                    
                    current_price = info.get('currentPrice', 0)
                    previous_close = info.get('previousClose', current_price)
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100 if previous_close > 0 else 0
                    
                    overview_data[name.lower().replace(' ', '').replace('&', '')] = StockQuote(
                        symbol=symbol,
                        price=current_price,
                        change=change,
                        change_percent=change_percent,
                        volume=info.get('volume', 0),
                        market_cap=info.get('marketCap'),
                        high_52_week=info.get('fiftyTwoWeekHigh'),
                        low_52_week=info.get('fiftyTwoWeekLow'),
                        pe_ratio=info.get('trailingPE'),
                        dividend_yield=info.get('dividendYield'),
                        last_updated=datetime.utcnow()
                    )
                except Exception as e:
                    print(f"Error fetching {name}: {e}")
                    continue
            
            return MarketOverview(
                sp500=overview_data.get('sp500'),
                nasdaq=overview_data.get('nasdaq'),
                dow=overview_data.get('dow'),
                vix=overview_data.get('vix'),
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            print(f"Error fetching market overview: {e}")
            return MarketOverview(timestamp=datetime.utcnow())

    async def get_top_gainers(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top gaining stocks."""
        try:
            # This would typically come from a market data provider
            # For now, return mock data
            return [
                {
                    "symbol": "AAPL",
                    "name": "Apple Inc.",
                    "price": 175.50,
                    "change": 5.25,
                    "change_percent": 3.08
                },
                {
                    "symbol": "MSFT",
                    "name": "Microsoft Corporation",
                    "price": 345.20,
                    "change": 8.75,
                    "change_percent": 2.60
                }
            ][:limit]
        except Exception as e:
            print(f"Error fetching top gainers: {e}")
            return []

    async def get_top_losers(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top losing stocks."""
        try:
            # Mock data for now
            return [
                {
                    "symbol": "TSLA",
                    "name": "Tesla Inc.",
                    "price": 180.25,
                    "change": -12.50,
                    "change_percent": -6.48
                }
            ][:limit]
        except Exception as e:
            print(f"Error fetching top losers: {e}")
            return []

    async def get_most_active(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most actively traded stocks."""
        try:
            # Mock data for now
            return [
                {
                    "symbol": "NVDA",
                    "name": "NVIDIA Corporation",
                    "price": 450.75,
                    "volume": 45000000,
                    "change": 15.25,
                    "change_percent": 3.51
                }
            ][:limit]
        except Exception as e:
            print(f"Error fetching most active: {e}")
            return []
