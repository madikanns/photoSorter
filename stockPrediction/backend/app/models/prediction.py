from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from .base import Base

class Prediction(Base):
    """Stock prediction model."""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("prediction_models.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    timeframe = Column(String(10), nullable=False)  # 1d, 1w, 1m, 3m, 6m, 1y
    predicted_price = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)  # 0 to 1
    actual_price = Column(Float)  # Filled when actual price is available
    accuracy = Column(Float)  # Calculated accuracy
    features_used = Column(JSONB)
    metadata = Column(JSONB)
    
    # Relationships
    stock = relationship("Stock", back_populates="predictions")
    model = relationship("PredictionModel", back_populates="predictions")
    
    # Indexes
    __table_args__ = (
        Index('ix_predictions_stock_date_timeframe', 'stock_id', 'date', 'timeframe'),
    )

class PredictionModel(Base):
    """ML model information."""
    __tablename__ = "prediction_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)  # lstm, random_forest, ensemble
    version = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True)
    training_date = Column(DateTime)
    accuracy_score = Column(Float)
    model_parameters = Column(JSONB)
    model_path = Column(String(255))
    description = Column(Text)
    
    # Relationships
    predictions = relationship("Prediction", back_populates="model")
    accuracies = relationship("PredictionAccuracy", back_populates="model")
    
    # Indexes
    __table_args__ = (
        Index('ix_prediction_models_type_active', 'model_type', 'is_active'),
    )

class PredictionAccuracy(Base):
    """Model accuracy tracking."""
    __tablename__ = "prediction_accuracy"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("prediction_models.id"), nullable=False)
    timeframe = Column(String(10), nullable=False)
    date = Column(DateTime, nullable=False)
    accuracy_score = Column(Float, nullable=False)
    mae = Column(Float)  # Mean Absolute Error
    mse = Column(Float)  # Mean Squared Error
    rmse = Column(Float)  # Root Mean Squared Error
    r2_score = Column(Float)  # R-squared score
    sample_size = Column(Integer)
    
    # Relationships
    model = relationship("PredictionModel", back_populates="accuracies")
    
    # Indexes
    __table_args__ = (
        Index('ix_prediction_accuracy_model_timeframe', 'model_id', 'timeframe', 'date'),
    )
