from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Application
    app_name: str = "StockPrediction"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    
    # Database
    database_url: str = "postgresql://user:password@localhost/stockprediction"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_db: int = 0
    
    # API Keys
    yahoo_finance_api_key: Optional[str] = None
    alpha_vantage_api_key: Optional[str] = None
    news_api_key: Optional[str] = None
    twitter_api_key: Optional[str] = None
    twitter_api_secret: Optional[str] = None
    twitter_access_token: Optional[str] = None
    twitter_access_token_secret: Optional[str] = None
    reddit_client_id: Optional[str] = None
    reddit_client_secret: Optional[str] = None
    reddit_user_agent: Optional[str] = None
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    cors_credentials: bool = True
    cors_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_headers: List[str] = ["*"]
    
    # Logging
    log_level: str = "INFO"
    
    # ML Models
    model_update_interval: int = 3600  # 1 hour
    prediction_horizon_days: int = 7
    sentiment_update_interval: int = 300  # 5 minutes
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    
    # Data Collection
    max_news_articles: int = 1000
    max_tweets: int = 500
    max_reddit_posts: int = 200
    
    # Model Settings
    lstm_sequence_length: int = 60
    lstm_units: int = 50
    lstm_dropout: float = 0.2
    lstm_recurrent_dropout: float = 0.2
    
    # Technical Analysis
    moving_average_periods: List[int] = [5, 10, 20, 50, 200]
    rsi_period: int = 14
    macd_fast: int = 12
    macd_slow: int = 26
    macd_signal: int = 9
    
    # Sentiment Analysis
    sentiment_model_name: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    sentiment_batch_size: int = 32
    sentiment_max_length: int = 512
    
    # Portfolio
    max_portfolio_size: int = 50
    max_watchlist_size: int = 100
    
    # Alerts
    max_alerts_per_user: int = 20
    alert_cooldown_minutes: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = False

def get_cors_config():
    """Get CORS configuration."""
    return {
        "allow_origins": settings.cors_origins,
        "allow_credentials": settings.cors_credentials,
        "allow_methods": settings.cors_methods,
        "allow_headers": settings.cors_headers,
    }

# Create settings instance
settings = Settings()
