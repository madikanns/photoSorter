from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models.prediction import Prediction, PredictionModel, PredictionAccuracy
from ..schemas.prediction import PredictionResponse, PredictionModelResponse, PredictionAccuracyResponse
from ..services.prediction_service import PredictionService
from ..services.ml_service import MLService
from ..utils.auth import get_current_user

router = APIRouter()

@router.get("/{symbol}", response_model=List[PredictionResponse])
async def get_stock_predictions(
    symbol: str,
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    model_type: Optional[str] = Query(None, regex="^(lstm|random_forest|ensemble|sentiment_enhanced)$"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get ML predictions for a stock."""
    try:
        prediction_service = PredictionService(db)
        predictions = await prediction_service.get_stock_predictions(
            symbol.upper(),
            timeframe=timeframe,
            model_type=model_type,
            limit=limit
        )
        
        if not predictions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Predictions for {symbol} not found"
            )
        
        return predictions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stock predictions: {str(e)}"
        )

@router.post("/{symbol}/predict")
async def generate_prediction(
    symbol: str,
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    model_type: str = Query("ensemble", regex="^(lstm|random_forest|ensemble|sentiment_enhanced)$"),
    include_sentiment: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Generate new prediction for a stock."""
    try:
        prediction_service = PredictionService(db)
        ml_service = MLService(db)
        
        # Generate prediction
        prediction = await ml_service.generate_prediction(
            symbol.upper(),
            timeframe=timeframe,
            model_type=model_type,
            include_sentiment=include_sentiment
        )
        
        # Save prediction to database
        saved_prediction = await prediction_service.save_prediction(prediction)
        
        return {
            "symbol": symbol.upper(),
            "prediction": saved_prediction,
            "status": "success",
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate prediction: {str(e)}"
        )

@router.get("/models", response_model=List[PredictionModelResponse])
async def get_prediction_models(
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get available prediction models."""
    try:
        prediction_service = PredictionService(db)
        models = await prediction_service.get_prediction_models(active_only=active_only)
        
        return models
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get prediction models: {str(e)}"
        )

@router.get("/models/{model_id}/accuracy", response_model=PredictionAccuracyResponse)
async def get_model_accuracy(
    model_id: int,
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    days_back: int = Query(30, ge=7, le=365),
    db: Session = Depends(get_db)
):
    """Get accuracy metrics for a specific model."""
    try:
        prediction_service = PredictionService(db)
        accuracy = await prediction_service.get_model_accuracy(
            model_id=model_id,
            timeframe=timeframe,
            days_back=days_back
        )
        
        if not accuracy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Accuracy data for model {model_id} not found"
            )
        
        return accuracy
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model accuracy: {str(e)}"
        )

@router.post("/models/{model_id}/train")
async def train_model(
    model_id: int,
    retrain: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Train or retrain a prediction model."""
    try:
        ml_service = MLService(db)
        result = await ml_service.train_model(model_id, retrain=retrain)
        
        return {
            "model_id": model_id,
            "status": "success",
            "message": "Model training completed successfully",
            "timestamp": datetime.utcnow(),
            "training_metrics": result.get("metrics", {})
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to train model: {str(e)}"
        )

@router.get("/{symbol}/accuracy")
async def get_prediction_accuracy(
    symbol: str,
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    days_back: int = Query(30, ge=7, le=365),
    db: Session = Depends(get_db)
):
    """Get prediction accuracy for a specific stock."""
    try:
        prediction_service = PredictionService(db)
        accuracy = await prediction_service.get_stock_prediction_accuracy(
            symbol.upper(),
            timeframe=timeframe,
            days_back=days_back
        )
        
        return accuracy
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get prediction accuracy: {str(e)}"
        )

@router.get("/{symbol}/history")
async def get_prediction_history(
    symbol: str,
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get historical predictions for a stock."""
    try:
        prediction_service = PredictionService(db)
        history = await prediction_service.get_prediction_history(
            symbol.upper(),
            timeframe=timeframe,
            limit=limit
        )
        
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get prediction history: {str(e)}"
        )

@router.get("/market/overview")
async def get_market_predictions(
    limit: int = Query(10, ge=1, le=50),
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    db: Session = Depends(get_db)
):
    """Get predictions for top market stocks."""
    try:
        prediction_service = PredictionService(db)
        market_predictions = await prediction_service.get_market_predictions(
            limit=limit,
            timeframe=timeframe
        )
        
        return market_predictions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get market predictions: {str(e)}"
        )

@router.get("/{symbol}/confidence")
async def get_prediction_confidence(
    symbol: str,
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    db: Session = Depends(get_db)
):
    """Get confidence scores for predictions."""
    try:
        prediction_service = PredictionService(db)
        confidence = await prediction_service.get_prediction_confidence(
            symbol.upper(),
            timeframe=timeframe
        )
        
        return confidence
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get prediction confidence: {str(e)}"
        )

@router.post("/batch/predict")
async def batch_predict(
    symbols: List[str],
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    model_type: str = Query("ensemble", regex="^(lstm|random_forest|ensemble|sentiment_enhanced)$"),
    db: Session = Depends(get_db)
):
    """Generate predictions for multiple stocks."""
    try:
        prediction_service = PredictionService(db)
        ml_service = MLService(db)
        
        results = []
        for symbol in symbols:
            try:
                prediction = await ml_service.generate_prediction(
                    symbol.upper(),
                    timeframe=timeframe,
                    model_type=model_type
                )
                saved_prediction = await prediction_service.save_prediction(prediction)
                results.append({
                    "symbol": symbol.upper(),
                    "prediction": saved_prediction,
                    "status": "success"
                })
            except Exception as e:
                results.append({
                    "symbol": symbol.upper(),
                    "error": str(e),
                    "status": "failed"
                })
        
        return {
            "batch_id": f"batch_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "results": results,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate batch predictions: {str(e)}"
        )

@router.get("/performance/leaderboard")
async def get_prediction_leaderboard(
    timeframe: str = Query("1d", regex="^(1d|1w|1m|3m|6m|1y)$"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get leaderboard of best performing predictions."""
    try:
        prediction_service = PredictionService(db)
        leaderboard = await prediction_service.get_prediction_leaderboard(
            timeframe=timeframe,
            limit=limit
        )
        
        return leaderboard
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get prediction leaderboard: {str(e)}"
        )
