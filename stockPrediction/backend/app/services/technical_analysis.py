import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..models.stock import Stock, StockPrice, StockIndicator
from ..schemas.stock import StockIndicatorResponse

class TechnicalAnalysisService:
    def __init__(self, db: Session):
        self.db = db

    async def calculate_indicators(self, symbol: str, indicators: List[str]) -> List[StockIndicatorResponse]:
        """Calculate technical indicators for a stock."""
        try:
            # Get stock data
            stock = self.db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
            if not stock:
                return []

            # Get price data
            prices = self.db.query(StockPrice).filter(
                StockPrice.stock_id == stock.id
            ).order_by(StockPrice.date.desc()).limit(200).all()

            if len(prices) < 20:  # Need minimum data for indicators
                return []

            # Convert to DataFrame
            df = pd.DataFrame([{
                'date': p.date,
                'open': p.open_price,
                'high': p.high_price,
                'low': p.low_price,
                'close': p.close_price,
                'volume': p.volume
            } for p in prices])

            df = df.sort_values('date')
            df.set_index('date', inplace=True)

            results = []
            current_date = datetime.utcnow()

            for indicator in indicators:
                try:
                    if indicator == "sma_20":
                        value = self._calculate_sma(df['close'], 20)
                        if not np.isnan(value):
                            results.append(StockIndicatorResponse(
                                id=0,
                                stock_id=stock.id,
                                date=current_date,
                                indicator_type="SMA_20",
                                value=float(value),
                                metadata={"period": 20}
                            ))
                    
                    elif indicator == "ema_12":
                        value = self._calculate_ema(df['close'], 12)
                        if not np.isnan(value):
                            results.append(StockIndicatorResponse(
                                id=0,
                                stock_id=stock.id,
                                date=current_date,
                                indicator_type="EMA_12",
                                value=float(value),
                                metadata={"period": 12}
                            ))
                    
                    elif indicator == "rsi":
                        value = self._calculate_rsi(df['close'], 14)
                        if not np.isnan(value):
                            results.append(StockIndicatorResponse(
                                id=0,
                                stock_id=stock.id,
                                date=current_date,
                                indicator_type="RSI",
                                value=float(value),
                                metadata={"period": 14, "overbought": 70, "oversold": 30}
                            ))
                    
                    elif indicator == "macd":
                        macd_line, signal_line, histogram = self._calculate_macd(df['close'])
                        if not np.isnan(macd_line):
                            results.append(StockIndicatorResponse(
                                id=0,
                                stock_id=stock.id,
                                date=current_date,
                                indicator_type="MACD",
                                value=float(macd_line),
                                metadata={
                                    "macd_line": float(macd_line),
                                    "signal_line": float(signal_line),
                                    "histogram": float(histogram)
                                }
                            ))
                    
                    elif indicator == "bollinger_bands":
                        upper, middle, lower = self._calculate_bollinger_bands(df['close'], 20, 2)
                        if not np.isnan(upper):
                            results.append(StockIndicatorResponse(
                                id=0,
                                stock_id=stock.id,
                                date=current_date,
                                indicator_type="BOLLINGER_BANDS",
                                value=float(middle),
                                metadata={
                                    "upper_band": float(upper),
                                    "middle_band": float(middle),
                                    "lower_band": float(lower),
                                    "period": 20,
                                    "std_dev": 2
                                }
                            ))
                
                except Exception as e:
                    print(f"Error calculating {indicator} for {symbol}: {e}")
                    continue

            return results

        except Exception as e:
            print(f"Error calculating indicators for {symbol}: {e}")
            return []

    def _calculate_sma(self, prices: pd.Series, period: int) -> float:
        """Calculate Simple Moving Average."""
        if len(prices) < period:
            return np.nan
        return prices.tail(period).mean()

    def _calculate_ema(self, prices: pd.Series, period: int) -> float:
        """Calculate Exponential Moving Average."""
        if len(prices) < period:
            return np.nan
        return prices.ewm(span=period).mean().iloc[-1]

    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> float:
        """Calculate Relative Strength Index."""
        if len(prices) < period + 1:
            return np.nan
        
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi.iloc[-1]

    def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> tuple:
        """Calculate MACD (Moving Average Convergence Divergence)."""
        if len(prices) < slow:
            return np.nan, np.nan, np.nan
        
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal).mean()
        histogram = macd_line - signal_line
        
        return macd_line.iloc[-1], signal_line.iloc[-1], histogram.iloc[-1]

    def _calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: float = 2) -> tuple:
        """Calculate Bollinger Bands."""
        if len(prices) < period:
            return np.nan, np.nan, np.nan
        
        sma = prices.rolling(window=period).mean()
        std = prices.rolling(window=period).std()
        
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        
        return upper_band.iloc[-1], sma.iloc[-1], lower_band.iloc[-1]

    def _calculate_stochastic(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> tuple:
        """Calculate Stochastic Oscillator."""
        if len(close) < period:
            return np.nan, np.nan
        
        lowest_low = low.rolling(window=period).min()
        highest_high = high.rolling(window=period).max()
        
        k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
        d_percent = k_percent.rolling(window=3).mean()
        
        return k_percent.iloc[-1], d_percent.iloc[-1]

    def _calculate_williams_r(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> float:
        """Calculate Williams %R."""
        if len(close) < period:
            return np.nan
        
        highest_high = high.rolling(window=period).max()
        lowest_low = low.rolling(window=period).min()
        
        williams_r = -100 * ((highest_high - close) / (highest_high - lowest_low))
        
        return williams_r.iloc[-1]

    def _calculate_atr(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> float:
        """Calculate Average True Range."""
        if len(close) < period + 1:
            return np.nan
        
        high_low = high - low
        high_close = np.abs(high - close.shift())
        low_close = np.abs(low - close.shift())
        
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        atr = true_range.rolling(window=period).mean()
        
        return atr.iloc[-1]
