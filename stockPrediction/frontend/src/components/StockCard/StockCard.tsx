import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
} from '@mui/icons-material';

interface StockCardProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    change_percent: number;
    volume?: number;
  };
  onAddToWatchlist: () => void;
  onRemoveFromWatchlist: () => void;
  isInWatchlist: boolean;
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
}) => {
  const isPositive = stock.change >= 0;

  const handleWatchlistClick = () => {
    if (isInWatchlist) {
      onRemoveFromWatchlist();
    } else {
      onAddToWatchlist();
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {stock.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {stock.name}
            </Typography>
          </Box>
          <IconButton onClick={handleWatchlistClick} size="small">
            {isInWatchlist ? <Star color="primary" /> : <StarBorder />}
          </IconButton>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h5" component="div" gutterBottom>
            ${stock.price.toFixed(2)}
          </Typography>
          
          <Chip
            icon={isPositive ? <TrendingUp /> : <TrendingDown />}
            label={`${isPositive ? '+' : ''}${stock.change.toFixed(2)} (${stock.change_percent.toFixed(2)}%)`}
            color={isPositive ? 'success' : 'error'}
            size="small"
            sx={{ mb: 1 }}
          />
        </Box>

        {stock.volume && (
          <Typography variant="body2" color="text.secondary">
            Volume: {stock.volume.toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StockCard;
