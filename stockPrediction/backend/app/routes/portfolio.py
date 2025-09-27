from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.portfolio import Portfolio, Watchlist, Alert
from ..schemas.portfolio import PortfolioResponse, WatchlistResponse, AlertResponse
from ..utils.auth import get_current_user_optional

router = APIRouter()

@router.get("/", response_model=List[PortfolioResponse])
async def get_user_portfolio(
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get user's portfolio."""
    try:
        # For demo purposes, return mock portfolio
        # In real implementation, filter by user_id
        portfolio_items = db.query(Portfolio).all()
        
        return [PortfolioResponse.from_orm(item) for item in portfolio_items]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get portfolio: {str(e)}"
        )

@router.post("/add")
async def add_to_portfolio(
    symbol: str,
    quantity: float,
    purchase_price: float,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Add stock to portfolio."""
    try:
        # Create portfolio entry
        portfolio_item = Portfolio(
            user_id=current_user.get("id", 1) if current_user else 1,
            symbol=symbol.upper(),
            quantity=quantity,
            purchase_price=purchase_price,
            purchase_date=datetime.utcnow()
        )
        
        db.add(portfolio_item)
        db.commit()
        db.refresh(portfolio_item)
        
        return {
            "message": f"Added {quantity} shares of {symbol} to portfolio",
            "portfolio_item": PortfolioResponse.from_orm(portfolio_item)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add to portfolio: {str(e)}"
        )

@router.get("/watchlist", response_model=List[WatchlistResponse])
async def get_watchlist(
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get user's watchlist."""
    try:
        user_id = current_user.get("id", 1) if current_user else 1
        watchlist_items = db.query(Watchlist).filter(Watchlist.user_id == user_id).all()
        
        return [WatchlistResponse.from_orm(item) for item in watchlist_items]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get watchlist: {str(e)}"
        )

@router.post("/watchlist/add")
async def add_to_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Add stock to watchlist."""
    try:
        user_id = current_user.get("id", 1) if current_user else 1
        
        # Check if already in watchlist
        existing = db.query(Watchlist).filter(
            Watchlist.user_id == user_id,
            Watchlist.symbol == symbol.upper()
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{symbol} is already in watchlist"
            )
        
        watchlist_item = Watchlist(
            user_id=user_id,
            symbol=symbol.upper(),
            added_date=datetime.utcnow()
        )
        
        db.add(watchlist_item)
        db.commit()
        db.refresh(watchlist_item)
        
        return {
            "message": f"Added {symbol} to watchlist",
            "watchlist_item": WatchlistResponse.from_orm(watchlist_item)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add to watchlist: {str(e)}"
        )

@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Remove stock from watchlist."""
    try:
        user_id = current_user.get("id", 1) if current_user else 1
        
        watchlist_item = db.query(Watchlist).filter(
            Watchlist.user_id == user_id,
            Watchlist.symbol == symbol.upper()
        ).first()
        
        if not watchlist_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{symbol} not found in watchlist"
            )
        
        db.delete(watchlist_item)
        db.commit()
        
        return {"message": f"Removed {symbol} from watchlist"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove from watchlist: {str(e)}"
        )

@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get user's alerts."""
    try:
        user_id = current_user.get("id", 1) if current_user else 1
        alerts = db.query(Alert).filter(Alert.user_id == user_id).all()
        
        return [AlertResponse.from_orm(alert) for alert in alerts]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get alerts: {str(e)}"
        )

@router.post("/alerts/create")
async def create_alert(
    symbol: str,
    alert_type: str,
    target_value: float,
    condition: str,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Create a new alert."""
    try:
        user_id = current_user.get("id", 1) if current_user else 1
        
        alert = Alert(
            user_id=user_id,
            symbol=symbol.upper(),
            alert_type=alert_type,
            target_value=target_value,
            condition=condition,
            is_active=True,
            created_date=datetime.utcnow()
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        return {
            "message": f"Alert created for {symbol}",
            "alert": AlertResponse.from_orm(alert)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create alert: {str(e)}"
        )

@router.get("/performance")
async def get_portfolio_performance(
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """Get portfolio performance metrics."""
    try:
        user_id = current_user.get("id", 1) if current_user else 1
        
        # Get portfolio items
        portfolio_items = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
        
        if not portfolio_items:
            return {"message": "No portfolio items found"}
        
        # Calculate performance metrics
        total_value = 0
        total_cost = 0
        
        for item in portfolio_items:
            # Mock current price (in real implementation, fetch from API)
            current_price = item.purchase_price * 1.05  # 5% gain for demo
            current_value = item.quantity * current_price
            cost = item.quantity * item.purchase_price
            
            total_value += current_value
            total_cost += cost
        
        total_gain = total_value - total_cost
        total_gain_percent = (total_gain / total_cost) * 100 if total_cost > 0 else 0
        
        return {
            "total_value": total_value,
            "total_cost": total_cost,
            "total_gain": total_gain,
            "total_gain_percent": total_gain_percent,
            "portfolio_items": len(portfolio_items)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get portfolio performance: {str(e)}"
        )
