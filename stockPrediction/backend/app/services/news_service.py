from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from ..models.sentiment import NewsSentiment
from ..schemas.sentiment import NewsSentimentResponse

class NewsService:
    def __init__(self, db: Session):
        self.db = db

    async def get_news_sentiment(self, symbol: str, limit: int = 20, 
                               timeframe: str = "1d") -> List[NewsSentimentResponse]:
        """Get news sentiment analysis for a stock."""
        try:
            # Mock news sentiment data
            # In real implementation, this would fetch from database and analyze news
            
            news_items = []
            base_date = datetime.utcnow()
            
            for i in range(limit):
                # Generate mock news articles
                titles = [
                    f"{symbol} reports strong quarterly earnings",
                    f"Analysts upgrade {symbol} price target",
                    f"{symbol} faces regulatory challenges",
                    f"Market volatility affects {symbol} performance",
                    f"{symbol} announces new product launch",
                    f"Investors bullish on {symbol} prospects",
                    f"{symbol} stock shows mixed signals",
                    f"Breaking: {symbol} makes major acquisition"
                ]
                
                sources = ["Reuters", "Bloomberg", "CNBC", "MarketWatch", "Yahoo Finance", "Seeking Alpha"]
                
                title = random.choice(titles)
                source = random.choice(sources)
                sentiment_score = random.uniform(-0.8, 0.8)
                confidence = random.uniform(0.6, 0.9)
                
                # Generate content based on sentiment
                if sentiment_score > 0.3:
                    content = f"Positive news about {symbol}. The company shows strong fundamentals and growth potential."
                elif sentiment_score < -0.3:
                    content = f"Negative developments for {symbol}. The company faces challenges in the current market."
                else:
                    content = f"Mixed signals for {symbol}. The company shows both opportunities and risks."
                
                news_items.append(NewsSentimentResponse(
                    id=i + 1,
                    sentiment_analysis_id=1,  # Mock sentiment analysis ID
                    title=title,
                    content=content,
                    source=source,
                    url=f"https://example.com/news/{symbol.lower()}-{i}",
                    published_at=base_date - timedelta(hours=i),
                    sentiment_score=sentiment_score,
                    confidence=confidence,
                    keywords=self._extract_keywords(title, content)
                ))
            
            return news_items
        except Exception as e:
            print(f"Error getting news sentiment for {symbol}: {e}")
            return []

    def _extract_keywords(self, title: str, content: str) -> List[str]:
        """Extract keywords from news content."""
        # Simple keyword extraction (in real implementation, use NLP)
        text = (title + " " + content).lower()
        
        keywords = []
        if "earnings" in text:
            keywords.append("earnings")
        if "revenue" in text:
            keywords.append("revenue")
        if "growth" in text:
            keywords.append("growth")
        if "acquisition" in text:
            keywords.append("acquisition")
        if "partnership" in text:
            keywords.append("partnership")
        if "regulation" in text:
            keywords.append("regulation")
        if "competition" in text:
            keywords.append("competition")
        if "innovation" in text:
            keywords.append("innovation")
        
        return keywords[:5]  # Limit to 5 keywords

    async def get_market_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get general market news."""
        try:
            market_news = [
                {
                    "title": "Federal Reserve signals potential rate changes",
                    "source": "Reuters",
                    "published_at": datetime.utcnow().isoformat(),
                    "sentiment": random.uniform(-0.3, 0.3),
                    "impact": "high"
                },
                {
                    "title": "Tech stocks show mixed performance",
                    "source": "Bloomberg",
                    "published_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                    "sentiment": random.uniform(-0.2, 0.2),
                    "impact": "medium"
                },
                {
                    "title": "Energy sector rallies on oil price surge",
                    "source": "CNBC",
                    "published_at": (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                    "sentiment": random.uniform(0.2, 0.6),
                    "impact": "medium"
                }
            ]
            
            return market_news[:limit]
        except Exception as e:
            print(f"Error getting market news: {e}")
            return []

    async def get_sector_news(self, sector: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get news for a specific sector."""
        try:
            sector_news = [
                {
                    "title": f"{sector} sector shows strong fundamentals",
                    "source": "MarketWatch",
                    "published_at": datetime.utcnow().isoformat(),
                    "sentiment": random.uniform(-0.2, 0.4),
                    "sector": sector,
                    "impact": "medium"
                },
                {
                    "title": f"Regulatory changes affect {sector} companies",
                    "source": "Financial Times",
                    "published_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                    "sentiment": random.uniform(-0.4, 0.1),
                    "sector": sector,
                    "impact": "high"
                }
            ]
            
            return sector_news[:limit]
        except Exception as e:
            print(f"Error getting sector news for {sector}: {e}")
            return []

    async def analyze_news_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of news text."""
        try:
            # Simple sentiment analysis (in real implementation, use ML models)
            positive_words = ['good', 'great', 'excellent', 'strong', 'growth', 'profit', 'gain', 'bullish']
            negative_words = ['bad', 'terrible', 'weak', 'loss', 'decline', 'bearish', 'crash', 'crisis']
            
            text_lower = text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            if positive_count > negative_count:
                sentiment = 0.3 + (positive_count - negative_count) * 0.1
            elif negative_count > positive_count:
                sentiment = -0.3 - (negative_count - positive_count) * 0.1
            else:
                sentiment = 0.0
            
            # Clamp sentiment to [-1, 1]
            sentiment = max(-1, min(1, sentiment))
            
            # Calculate confidence
            total_words = len(text.split())
            confidence = min(0.9, 0.4 + (total_words / 200))
            
            return {
                "sentiment": sentiment,
                "confidence": confidence,
                "positive_score": max(0, sentiment),
                "negative_score": max(0, -sentiment),
                "neutral_score": 1 - abs(sentiment)
            }
        except Exception as e:
            print(f"Error analyzing news sentiment: {e}")
            return {
                "sentiment": 0.0,
                "confidence": 0.0,
                "positive_score": 0.33,
                "negative_score": 0.33,
                "neutral_score": 0.34
            }