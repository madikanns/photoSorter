import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';

interface PredictionCardProps {
  symbol: string;
  prediction: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number; // 0-100
  targetPrice: number;
  currentPrice: number;
  timeframe: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  symbol,
  prediction,
  confidence,
  targetPrice,
  currentPrice,
  timeframe,
}) => {
  const priceChange = targetPrice - currentPrice;
  const priceChangePercent = (priceChange / currentPrice) * 100;
  
  const getPredictionColor = (pred: string) => {
    switch (pred) {
      case 'Bullish': return 'success';
      case 'Bearish': return 'error';
      default: return 'warning';
    }
  };

  const getPredictionIcon = (pred: string) => {
    switch (pred) {
      case 'Bullish': return <TrendingUp />;
      case 'Bearish': return <TrendingDown />;
      default: return <TrendingFlat />;
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'success';
    if (conf >= 60) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {symbol}
          </Typography>
          <Chip
            icon={getPredictionIcon(prediction)}
            label={prediction}
            color={getPredictionColor(prediction) as any}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Price
          </Typography>
          <Typography variant="h6">
            ${currentPrice.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Target Price ({timeframe})
          </Typography>
          <Typography variant="h6" sx={{ 
            color: priceChange >= 0 ? 'success.main' : 'error.main' 
          }}>
            ${targetPrice.toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: priceChange >= 0 ? 'success.main' : 'error.main' 
          }}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(1)}%)
          </Typography>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Confidence
            </Typography>
            <Typography variant="body2" color={`${getConfidenceColor(confidence)}.main`}>
              {confidence}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={confidence}
            color={getConfidenceColor(confidence) as any}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
