from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from ..models.prediction import Prediction, PredictionModel, PredictionAccuracy
from ..schemas.prediction import PredictionResponse, PredictionModelResponse, PredictionAccuracyResponse

class PredictionService:
    def __init__(self, db: Session):
        self.db = db

    async def get_stock_predictions(self, symbol: str, timeframe: str = "1d", 
                                  model_type: Optional[str] = None, limit: int = 10) -> List[PredictionResponse]:
        """Get ML predictions for a stock."""
        try:
            # For demo purposes, generate mock predictions
            # In real implementation, this would fetch from database
            
            predictions = []
            base_price = random.uniform(100, 500)  # Mock current price
            
            for i in range(limit):
                # Generate realistic prediction
                price_change = random.uniform(-0.1, 0.1)  # ±10% change
                predicted_price = base_price * (1 + price_change)
                confidence = random.uniform(0.6, 0.9)
                
                predictions.append(PredictionResponse(
                    id=i + 1,
                    stock_id=1,  # Mock stock ID
                    model_id=1,  # Mock model ID
                    date=datetime.utcnow() + timedelta(days=i),
                    timeframe=timeframe,
                    predicted_price=predicted_price,
                    confidence=confidence,
                    actual_price=None,
                    accuracy=None,
                    features_used={
                        "technical_indicators": ["sma_20", "rsi", "macd"],
                        "sentiment_score": random.uniform(-0.5, 0.5),
                        "volume_trend": random.choice(["increasing", "decreasing", "stable"])
                    },
                    metadata={
                        "model_type": model_type or "ensemble",
                        "prediction_date": datetime.utcnow().isoformat()
                    }
                ))
            
            return predictions
        except Exception as e:
            print(f"Error getting predictions for {symbol}: {e}")
            return []

    async def save_prediction(self, prediction_data: Dict[str, Any]) -> PredictionResponse:
        """Save prediction to database."""
        try:
            # Create prediction record
            prediction = Prediction(
                stock_id=prediction_data.get("stock_id", 1),
                model_id=prediction_data.get("model_id", 1),
                date=prediction_data.get("date", datetime.utcnow()),
                timeframe=prediction_data.get("timeframe", "1d"),
                predicted_price=prediction_data.get("predicted_price", 0),
                confidence=prediction_data.get("confidence", 0.5),
                features_used=prediction_data.get("features_used", {}),
                metadata=prediction_data.get("metadata", {})
            )
            
            self.db.add(prediction)
            self.db.commit()
            self.db.refresh(prediction)
            
            return PredictionResponse.from_orm(prediction)
        except Exception as e:
            print(f"Error saving prediction: {e}")
            raise

    async def get_prediction_models(self, active_only: bool = True) -> List[PredictionModelResponse]:
        """Get available prediction models."""
        try:
            # Mock models for demo
            models = [
                {
                    "id": 1,
                    "name": "LSTM Neural Network",
                    "model_type": "lstm",
                    "version": "1.0.0",
                    "is_active": True,
                    "accuracy_score": 0.75,
                    "description": "Deep learning model for time series prediction"
                },
                {
                    "id": 2,
                    "name": "Random Forest Ensemble",
                    "model_type": "random_forest",
                    "version": "1.2.0",
                    "is_active": True,
                    "accuracy_score": 0.72,
                    "description": "Ensemble learning model with technical indicators"
                },
                {
                    "id": 3,
                    "name": "Sentiment Enhanced LSTM",
                    "model_type": "sentiment_enhanced",
                    "version": "2.0.0",
                    "is_active": True,
                    "accuracy_score": 0.78,
                    "description": "LSTM model enhanced with sentiment analysis"
                }
            ]
            
            if active_only:
                models = [m for m in models if m["is_active"]]
            
            return [PredictionModelResponse(**model) for model in models]
        except Exception as e:
            print(f"Error getting prediction models: {e}")
            return []

    async def get_model_accuracy(self, model_id: int, timeframe: str = "1d", 
                               days_back: int = 30) -> Optional[PredictionAccuracyResponse]:
        """Get accuracy metrics for a specific model."""
        try:
            # Generate mock accuracy data
            accuracy_score = random.uniform(0.6, 0.85)
            mae = random.uniform(5, 20)
            mse = random.uniform(50, 400)
            rmse = mse ** 0.5
            r2_score = random.uniform(0.4, 0.8)
            sample_size = random.randint(50, 200)
            
            return PredictionAccuracyResponse(
                id=1,
                model_id=model_id,
                timeframe=timeframe,
                date=datetime.utcnow(),
                accuracy_score=accuracy_score,
                mae=mae,
                mse=mse,
                rmse=rmse,
                r2_score=r2_score,
                sample_size=sample_size
            )
        except Exception as e:
            print(f"Error getting model accuracy: {e}")
            return None

    async def get_stock_prediction_accuracy(self, symbol: str, timeframe: str = "1d", 
                                          days_back: int = 30) -> Dict[str, Any]:
        """Get prediction accuracy for a specific stock."""
        try:
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "days_back": days_back,
                "accuracy_score": random.uniform(0.6, 0.85),
                "mae": random.uniform(5, 20),
                "rmse": random.uniform(7, 25),
                "r2_score": random.uniform(0.4, 0.8),
                "sample_size": random.randint(20, 100),
                "best_model": random.choice(["lstm", "random_forest", "ensemble"]),
                "last_updated": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error getting prediction accuracy for {symbol}: {e}")
            return {}

    async def get_prediction_history(self, symbol: str, timeframe: str = "1d", 
                                   limit: int = 20) -> List[Dict[str, Any]]:
        """Get historical predictions for a stock."""
        try:
            history = []
            base_date = datetime.utcnow()
            base_price = random.uniform(100, 500)
            
            for i in range(limit):
                date = base_date - timedelta(days=i)
                predicted_price = base_price * (1 + random.uniform(-0.1, 0.1))
                actual_price = predicted_price * (1 + random.uniform(-0.05, 0.05))
                accuracy = random.uniform(0.6, 0.9)
                
                history.append({
                    "date": date.isoformat(),
                    "predicted_price": predicted_price,
                    "actual_price": actual_price,
                    "accuracy": accuracy,
                    "timeframe": timeframe,
                    "model_type": random.choice(["lstm", "random_forest", "ensemble"])
                })
            
            return history
        except Exception as e:
            print(f"Error getting prediction history for {symbol}: {e}")
            return []

    async def get_market_predictions(self, limit: int = 10, timeframe: str = "1d") -> List[Dict[str, Any]]:
        """Get predictions for top market stocks."""
        try:
            symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX", "AMD", "INTC"]
            predictions = []
            
            for symbol in symbols[:limit]:
                base_price = random.uniform(50, 1000)
                predicted_price = base_price * (1 + random.uniform(-0.1, 0.1))
                confidence = random.uniform(0.6, 0.9)
                
                predictions.append({
                    "symbol": symbol,
                    "current_price": base_price,
                    "predicted_price": predicted_price,
                    "confidence": confidence,
                    "timeframe": timeframe,
                    "direction": "bullish" if predicted_price > base_price else "bearish",
                    "change_percent": ((predicted_price - base_price) / base_price) * 100
                })
            
            return predictions
        except Exception as e:
            print(f"Error getting market predictions: {e}")
            return []

    async def get_prediction_confidence(self, symbol: str, timeframe: str = "1d") -> Dict[str, Any]:
        """Get confidence scores for predictions."""
        try:
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "overall_confidence": random.uniform(0.6, 0.9),
                "factors": {
                    "technical_analysis": random.uniform(0.5, 0.9),
                    "sentiment_analysis": random.uniform(0.4, 0.8),
                    "market_conditions": random.uniform(0.6, 0.9),
                    "volume_analysis": random.uniform(0.5, 0.8)
                },
                "risk_level": random.choice(["low", "medium", "high"]),
                "recommendation": random.choice(["buy", "hold", "sell"]),
                "last_updated": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error getting prediction confidence for {symbol}: {e}")
            return {}

    async def get_prediction_leaderboard(self, timeframe: str = "1d", limit: int = 20) -> List[Dict[str, Any]]:
        """Get leaderboard of best performing predictions."""
        try:
            symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX", "AMD", "INTC"]
            leaderboard = []
            
            for i, symbol in enumerate(symbols[:limit]):
                accuracy = random.uniform(0.6, 0.9)
                predictions_count = random.randint(10, 100)
                
                leaderboard.append({
                    "symbol": symbol,
                    "accuracy": accuracy,
                    "predictions_count": predictions_count,
                    "timeframe": timeframe,
                    "model_type": random.choice(["lstm", "random_forest", "ensemble"]),
                    "rank": i + 1
                })
            
            # Sort by accuracy
            leaderboard.sort(key=lambda x: x["accuracy"], reverse=True)
            
            # Update ranks
            for i, item in enumerate(leaderboard):
                item["rank"] = i + 1
            
            return leaderboard
        except Exception as e:
            print(f"Error getting prediction leaderboard: {e}")
            return []
