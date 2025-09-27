from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from ..models.sentiment import SentimentAnalysis, NewsSentiment, SocialSentiment
from ..schemas.sentiment import SentimentResponse, NewsSentimentResponse, SocialSentimentResponse

class SentimentService:
    def __init__(self, db: Session):
        self.db = db

    async def get_stock_sentiment(self, symbol: str, timeframe: str = "1d") -> Optional[SentimentResponse]:
        """Get overall sentiment analysis for a stock."""
        try:
            # For demo purposes, generate mock sentiment data
            # In real implementation, this would fetch from database and aggregate
            
            # Generate realistic sentiment scores
            base_sentiment = random.uniform(-0.3, 0.3)  # Slightly positive/negative
            confidence = random.uniform(0.6, 0.9)
            
            # Calculate component scores
            if base_sentiment > 0:
                positive_score = min(0.8, base_sentiment + random.uniform(0.1, 0.3))
                negative_score = max(0.1, 0.5 - base_sentiment)
            else:
                negative_score = min(0.8, abs(base_sentiment) + random.uniform(0.1, 0.3))
                positive_score = max(0.1, 0.5 - abs(base_sentiment))
            
            neutral_score = 1 - positive_score - negative_score
            
            return SentimentResponse(
                id=1,
                stock_id=1,  # Mock stock ID
                date=datetime.utcnow(),
                overall_sentiment=base_sentiment,
                confidence=confidence,
                positive_score=positive_score,
                negative_score=negative_score,
                neutral_score=neutral_score,
                source_count=random.randint(10, 50),
                metadata={
                    "timeframe": timeframe,
                    "sources": ["news", "twitter", "reddit", "stocktwits"],
                    "last_updated": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            print(f"Error getting sentiment for {symbol}: {e}")
            return None

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of custom text."""
        try:
            # Simple sentiment analysis (in real implementation, use ML models)
            positive_words = ['good', 'great', 'excellent', 'amazing', 'bullish', 'buy', 'strong', 'growth']
            negative_words = ['bad', 'terrible', 'awful', 'bearish', 'sell', 'weak', 'decline', 'crash']
            
            text_lower = text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            if positive_count > negative_count:
                sentiment = 0.5 + (positive_count - negative_count) * 0.1
            elif negative_count > positive_count:
                sentiment = -0.5 - (negative_count - positive_count) * 0.1
            else:
                sentiment = 0.0
            
            # Clamp sentiment to [-1, 1]
            sentiment = max(-1, min(1, sentiment))
            
            # Calculate confidence based on word count
            total_words = len(text.split())
            confidence = min(0.9, 0.3 + (total_words / 100))
            
            return {
                "sentiment": sentiment,
                "confidence": confidence,
                "positive_score": max(0, sentiment),
                "negative_score": max(0, -sentiment),
                "neutral_score": 1 - abs(sentiment)
            }
        except Exception as e:
            print(f"Error analyzing text: {e}")
            return {
                "sentiment": 0.0,
                "confidence": 0.0,
                "positive_score": 0.33,
                "negative_score": 0.33,
                "neutral_score": 0.34
            }

    async def get_sentiment_trends(self, symbol: str, days: int = 7) -> List[Dict[str, Any]]:
        """Get sentiment trends over time."""
        try:
            trends = []
            base_date = datetime.utcnow()
            
            for i in range(days):
                date = base_date - timedelta(days=i)
                # Generate trending sentiment data
                sentiment = random.uniform(-0.5, 0.5)
                confidence = random.uniform(0.6, 0.9)
                
                trends.append({
                    "date": date.isoformat(),
                    "sentiment": sentiment,
                    "confidence": confidence,
                    "source": "aggregated"
                })
            
            return trends
        except Exception as e:
            print(f"Error getting sentiment trends for {symbol}: {e}")
            return []

    async def get_sentiment_by_source(self, symbol: str, timeframe: str = "1d") -> Dict[str, Any]:
        """Get sentiment breakdown by source."""
        try:
            sources = {
                "news": {
                    "sentiment": random.uniform(-0.4, 0.4),
                    "confidence": random.uniform(0.7, 0.9),
                    "count": random.randint(5, 20),
                    "weight": 0.4
                },
                "twitter": {
                    "sentiment": random.uniform(-0.6, 0.6),
                    "confidence": random.uniform(0.5, 0.8),
                    "count": random.randint(20, 100),
                    "weight": 0.3
                },
                "reddit": {
                    "sentiment": random.uniform(-0.5, 0.5),
                    "confidence": random.uniform(0.6, 0.8),
                    "count": random.randint(10, 50),
                    "weight": 0.2
                },
                "stocktwits": {
                    "sentiment": random.uniform(-0.4, 0.4),
                    "confidence": random.uniform(0.6, 0.9),
                    "count": random.randint(5, 30),
                    "weight": 0.1
                }
            }
            
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "sources": sources,
                "overall": {
                    "sentiment": sum(s["sentiment"] * s["weight"] for s in sources.values()),
                    "confidence": sum(s["confidence"] * s["weight"] for s in sources.values()),
                    "total_count": sum(s["count"] for s in sources.values())
                }
            }
        except Exception as e:
            print(f"Error getting sentiment by source for {symbol}: {e}")
            return {}

    async def get_market_sentiment(self) -> Dict[str, Any]:
        """Get overall market sentiment."""
        try:
            return {
                "overall_sentiment": random.uniform(-0.2, 0.2),
                "confidence": random.uniform(0.7, 0.9),
                "fear_greed_index": random.randint(20, 80),
                "vix_sentiment": random.uniform(-0.3, 0.3),
                "sector_sentiment": {
                    "technology": random.uniform(-0.3, 0.3),
                    "healthcare": random.uniform(-0.2, 0.2),
                    "finance": random.uniform(-0.4, 0.4),
                    "energy": random.uniform(-0.5, 0.5)
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error getting market sentiment: {e}")
            return {}

    async def get_sentiment_alerts(self, symbol: str, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Get sentiment alerts for significant changes."""
        try:
            # Generate mock alerts
            alerts = []
            
            if random.random() > 0.7:  # 30% chance of alert
                alert_type = random.choice(["significant_change", "extreme_sentiment", "volume_spike"])
                current_sentiment = random.uniform(-0.8, 0.8)
                previous_sentiment = current_sentiment + random.uniform(-0.3, 0.3)
                change = abs(current_sentiment - previous_sentiment)
                
                if change > threshold:
                    alerts.append({
                        "symbol": symbol,
                        "alert_type": alert_type,
                        "current_sentiment": current_sentiment,
                        "previous_sentiment": previous_sentiment,
                        "change": change,
                        "confidence": random.uniform(0.6, 0.9),
                        "timestamp": datetime.utcnow().isoformat()
                    })
            
            return alerts
        except Exception as e:
            print(f"Error getting sentiment alerts for {symbol}: {e}")
            return []

    async def refresh_sentiment_data(self, symbol: str) -> Dict[str, Any]:
        """Manually refresh sentiment data for a stock."""
        try:
            # Simulate data collection
            data_points = random.randint(10, 50)
            
            return {
                "symbol": symbol,
                "status": "success",
                "data_points": data_points,
                "sources_updated": ["news", "twitter", "reddit"],
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error refreshing sentiment data for {symbol}: {e}")
            return {"status": "error", "message": str(e)}

    async def compare_sentiment(self, symbol: str, compare_symbols: List[str], timeframe: str = "1d") -> Dict[str, Any]:
        """Compare sentiment between multiple stocks."""
        try:
            comparison = {
                "primary_symbol": symbol,
                "timeframe": timeframe,
                "comparison": []
            }
            
            for comp_symbol in compare_symbols:
                comp_sentiment = await self.get_stock_sentiment(comp_symbol, timeframe)
                if comp_sentiment:
                    comparison["comparison"].append({
                        "symbol": comp_symbol,
                        "sentiment": comp_sentiment.overall_sentiment,
                        "confidence": comp_sentiment.confidence,
                        "rank": random.randint(1, len(compare_symbols))
                    })
            
            return comparison
        except Exception as e:
            print(f"Error comparing sentiment: {e}")
            return {}
