import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Refresh,
  Add,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchMarketData, fetchTopStocks } from '../../store/slices/marketSlice';
import { addToWatchlist, removeFromWatchlist } from '../../store/slices/portfolioSlice';
import StockCard from '../../components/StockCard/StockCard';
import SentimentGauge from '../../components/SentimentGauge/SentimentGauge';
import PredictionCard from '../../components/PredictionCard/PredictionCard';
import NewsCard from '../../components/NewsCard/NewsCard';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { marketData, topStocks, loading, error } = useAppSelector((state) => state.market);
  const { watchlist } = useAppSelector((state) => state.portfolio);
  
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  useEffect(() => {
    dispatch(fetchMarketData());
    dispatch(fetchTopStocks());
  }, [dispatch]);

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      // Navigate to stock analysis page
      window.location.href = `/stock/${searchSymbol.toUpperCase()}`;
    }
  };

  const handleAddToWatchlist = (symbol: string) => {
    dispatch(addToWatchlist(symbol));
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    dispatch(removeFromWatchlist(symbol));
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol);
  };

  // Chart data for market overview
  const chartData = {
    labels: marketData.historical?.map((item: any) => item.date) || [],
    datasets: [
      {
        label: 'S&P 500',
        data: marketData.historical?.map((item: any) => item.close) || [],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading market data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load market data: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Stock Market Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered stock analysis and predictions
        </Typography>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search for a stock symbol (e.g., AAPL, MSFT, GOOGL)"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<Search />}
              sx={{ minWidth: 120 }}
            >
              Search
            </Button>
            <IconButton onClick={() => dispatch(fetchMarketData())}>
              <Refresh />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Market Overview</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
                    <Chip
                      key={timeframe}
                      label={timeframe}
                      variant={selectedTimeframe === timeframe ? 'filled' : 'outlined'}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Market Sentiment
                  </Typography>
                  <SentimentGauge
                    value={marketData.sentiment?.overall || 0}
                    size={120}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Key Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">S&P 500</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {marketData.sp500?.price || 'N/A'}
                        </Typography>
                        {marketData.sp500?.change && (
                          <Chip
                            label={`${marketData.sp500.change > 0 ? '+' : ''}${marketData.sp500.change}%`}
                            color={marketData.sp500.change > 0 ? 'success' : 'error'}
                            size="small"
                            icon={marketData.sp500.change > 0 ? <TrendingUp /> : <TrendingDown />}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">NASDAQ</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {marketData.nasdaq?.price || 'N/A'}
                        </Typography>
                        {marketData.nasdaq?.change && (
                          <Chip
                            label={`${marketData.nasdaq.change > 0 ? '+' : ''}${marketData.nasdaq.change}%`}
                            color={marketData.nasdaq.change > 0 ? 'success' : 'error'}
                            size="small"
                            icon={marketData.nasdaq.change > 0 ? <TrendingUp /> : <TrendingDown />}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">DOW</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {marketData.dow?.price || 'N/A'}
                        </Typography>
                        {marketData.dow?.change && (
                          <Chip
                            label={`${marketData.dow.change > 0 ? '+' : ''}${marketData.dow.change}%`}
                            color={marketData.dow.change > 0 ? 'success' : 'error'}
                            size="small"
                            icon={marketData.dow.change > 0 ? <TrendingUp /> : <TrendingDown />}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Top Stocks */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Top Performing Stocks</Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => window.location.href = '/portfolio'}
            >
              Manage Portfolio
            </Button>
          </Box>
        </Grid>
        
        {topStocks.map((stock: any) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={stock.symbol}>
            <StockCard
              stock={stock}
              onAddToWatchlist={() => handleAddToWatchlist(stock.symbol)}
              onRemoveFromWatchlist={() => handleRemoveFromWatchlist(stock.symbol)}
              isInWatchlist={isInWatchlist(stock.symbol)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Predictions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            AI Predictions
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <PredictionCard
            symbol="AAPL"
            prediction="Bullish"
            confidence={85}
            targetPrice={180}
            currentPrice={175}
            timeframe="1 Week"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <PredictionCard
            symbol="MSFT"
            prediction="Neutral"
            confidence={72}
            targetPrice={350}
            currentPrice={345}
            timeframe="1 Week"
          />
        </Grid>
      </Grid>

      {/* News */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Latest News
          </Typography>
        </Grid>
        
        {marketData.news?.slice(0, 3).map((article: any, index: number) => (
          <Grid item xs={12} md={4} key={index}>
            <NewsCard article={article} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
