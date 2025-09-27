from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from ..models.sentiment import SocialSentiment
from ..schemas.sentiment import SocialSentimentResponse

class SocialService:
    def __init__(self, db: Session):
        self.db = db

    async def get_social_sentiment(self, symbol: str, platform: Optional[str] = None,
                                 limit: int = 50, timeframe: str = "1d") -> List[SocialSentimentResponse]:
        """Get social media sentiment analysis for a stock."""
        try:
            # Mock social sentiment data
            # In real implementation, this would fetch from database and analyze social media
            
            social_posts = []
            base_date = datetime.utcnow()
            
            platforms_to_check = [platform] if platform and platform != "all" else ["twitter", "reddit", "stocktwits"]
            
            for i in range(limit):
                platform_name = random.choice(platforms_to_check)
                content = self._generate_mock_content(symbol, platform_name)
                sentiment_score = random.uniform(-0.8, 0.8)
                confidence = random.uniform(0.5, 0.9)
                
                # Generate engagement metrics
                engagement_metrics = {
                    "likes": random.randint(0, 1000),
                    "retweets": random.randint(0, 500),
                    "replies": random.randint(0, 100),
                    "shares": random.randint(0, 200)
                }
                
                social_posts.append(SocialSentimentResponse(
                    id=i + 1,
                    sentiment_analysis_id=1,  # Mock sentiment analysis ID
                    platform=platform_name,
                    content=content,
                    author=f"user_{random.randint(1, 1000)}",
                    post_id=f"post_{random.randint(10000, 99999)}",
                    created_at=base_date - timedelta(minutes=random.randint(0, 1440)),
                    sentiment_score=sentiment_score,
                    confidence=confidence,
                    engagement_metrics=engagement_metrics
                ))
            
            return social_posts
        except Exception as e:
            print(f"Error getting social sentiment for {symbol}: {e}")
            return []

    def _generate_mock_content(self, symbol: str, platform: str) -> str:
        """Generate mock social media content."""
        if platform == "twitter":
            templates = [
                f"$SYMBOL looking bullish today! 🚀",
                f"Not sure about $SYMBOL, seems overvalued",
                f"$SYMBOL earnings beat expectations again",
                f"$SYMBOL chart showing strong support levels",
                f"$SYMBOL to the moon! 🌙",
                f"$SYMBOL facing headwinds in current market",
                f"$SYMBOL partnership announcement is huge",
                f"$SYMBOL technical analysis suggests pullback"
            ]
        elif platform == "reddit":
            templates = [
                f"DD: Why I'm bullish on {symbol}",
                f"{symbol} earnings call was disappointing",
                f"Thoughts on {symbol} recent price action?",
                f"{symbol} is undervalued compared to peers",
                f"{symbol} facing regulatory challenges",
                f"{symbol} new product launch looks promising",
                f"Should I buy more {symbol} at this price?",
                f"{symbol} management team is solid"
            ]
        elif platform == "stocktwits":
            templates = [
                f"$SYMBOL #bullish #stocks",
                f"$SYMBOL #bearish #market",
                f"$SYMBOL #earnings #growth",
                f"$SYMBOL #technical #analysis",
                f"$SYMBOL #long #investment",
                f"$SYMBOL #short #trading",
                f"$SYMBOL #news #update",
                f"$SYMBOL #chart #pattern"
            ]
        else:
            templates = [
                f"Discussion about {symbol}",
                f"{symbol} market update",
                f"{symbol} investment thesis",
                f"{symbol} risk analysis"
            ]
        
        template = random.choice(templates)
        return template.replace("SYMBOL", symbol)

    async def get_twitter_sentiment(self, symbol: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get Twitter sentiment for a stock."""
        try:
            tweets = []
            base_date = datetime.utcnow()
            
            for i in range(limit):
                content = self._generate_mock_content(symbol, "twitter")
                sentiment_score = random.uniform(-0.8, 0.8)
                
                tweets.append({
                    "id": f"tweet_{random.randint(100000, 999999)}",
                    "content": content,
                    "author": f"@user_{random.randint(1, 1000)}",
                    "created_at": (base_date - timedelta(minutes=random.randint(0, 1440))).isoformat(),
                    "sentiment_score": sentiment_score,
                    "engagement": {
                        "likes": random.randint(0, 1000),
                        "retweets": random.randint(0, 500),
                        "replies": random.randint(0, 100)
                    }
                })
            
            return tweets
        except Exception as e:
            print(f"Error getting Twitter sentiment for {symbol}: {e}")
            return []

    async def get_reddit_sentiment(self, symbol: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get Reddit sentiment for a stock."""
        try:
            posts = []
            base_date = datetime.utcnow()
            
            for i in range(limit):
                content = self._generate_mock_content(symbol, "reddit")
                sentiment_score = random.uniform(-0.8, 0.8)
                
                posts.append({
                    "id": f"reddit_{random.randint(10000, 99999)}",
                    "title": f"Discussion about {symbol}",
                    "content": content,
                    "subreddit": random.choice(["investing", "stocks", "SecurityAnalysis", "ValueInvesting"]),
                    "author": f"u/user_{random.randint(1, 1000)}",
                    "created_at": (base_date - timedelta(hours=random.randint(0, 24))).isoformat(),
                    "sentiment_score": sentiment_score,
                    "engagement": {
                        "upvotes": random.randint(0, 500),
                        "comments": random.randint(0, 100),
                        "awards": random.randint(0, 10)
                    }
                })
            
            return posts
        except Exception as e:
            print(f"Error getting Reddit sentiment for {symbol}: {e}")
            return []

    async def get_stocktwits_sentiment(self, symbol: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get StockTwits sentiment for a stock."""
        try:
            posts = []
            base_date = datetime.utcnow()
            
            for i in range(limit):
                content = self._generate_mock_content(symbol, "stocktwits")
                sentiment_score = random.uniform(-0.8, 0.8)
                
                posts.append({
                    "id": f"stocktwits_{random.randint(10000, 99999)}",
                    "content": content,
                    "author": f"user_{random.randint(1, 1000)}",
                    "created_at": (base_date - timedelta(minutes=random.randint(0, 1440))).isoformat(),
                    "sentiment_score": sentiment_score,
                    "engagement": {
                        "likes": random.randint(0, 200),
                        "replies": random.randint(0, 50),
                        "shares": random.randint(0, 100)
                    }
                })
            
            return posts
        except Exception as e:
            print(f"Error getting StockTwits sentiment for {symbol}: {e}")
            return []

    async def analyze_social_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of social media text."""
        try:
            # Simple sentiment analysis for social media
            positive_indicators = ['bullish', 'buy', 'moon', 'rocket', 'growth', 'strong', 'up', 'gain']
            negative_indicators = ['bearish', 'sell', 'crash', 'down', 'weak', 'loss', 'dump', 'fall']
            
            text_lower = text.lower()
            positive_count = sum(1 for word in positive_indicators if word in text_lower)
            negative_count = sum(1 for word in negative_indicators if word in text_lower)
            
            # Check for emojis
            positive_emojis = ['🚀', '🌙', '📈', '💪', '🔥', '💰']
            negative_emojis = ['📉', '💸', '😱', '⚠️', '🔻']
            
            positive_emoji_count = sum(1 for emoji in positive_emojis if emoji in text)
            negative_emoji_count = sum(1 for emoji in negative_emojis if emoji in text)
            
            # Calculate sentiment
            total_positive = positive_count + positive_emoji_count
            total_negative = negative_count + negative_emoji_count
            
            if total_positive > total_negative:
                sentiment = 0.3 + (total_positive - total_negative) * 0.2
            elif total_negative > total_positive:
                sentiment = -0.3 - (total_negative - total_positive) * 0.2
            else:
                sentiment = 0.0
            
            # Clamp sentiment to [-1, 1]
            sentiment = max(-1, min(1, sentiment))
            
            # Calculate confidence
            total_indicators = total_positive + total_negative
            confidence = min(0.9, 0.3 + (total_indicators / 10))
            
            return {
                "sentiment": sentiment,
                "confidence": confidence,
                "positive_score": max(0, sentiment),
                "negative_score": max(0, -sentiment),
                "neutral_score": 1 - abs(sentiment),
                "indicators": {
                    "positive_count": total_positive,
                    "negative_count": total_negative
                }
            }
        except Exception as e:
            print(f"Error analyzing social sentiment: {e}")
            return {
                "sentiment": 0.0,
                "confidence": 0.0,
                "positive_score": 0.33,
                "negative_score": 0.33,
                "neutral_score": 0.34
            }