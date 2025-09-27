import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  Psychology,
  Timeline,
  Assessment,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchSentiment } from '../../store/slices/sentimentSlice';
import { fetchPredictions } from '../../store/slices/predictionSlice';
import { addToWatchlist, removeFromWatchlist } from '../../store/slices/portfolioSlice';
import SentimentGauge from '../../components/SentimentGauge/SentimentGauge';
import PredictionCard from '../../components/PredictionCard/PredictionCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stock-tabpanel-${index}`}
      aria-labelledby={`stock-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StockAnalysis: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const dispatch = useAppDispatch();
  const { currentSentiment, loading: sentimentLoading } = useAppSelector((state) => state.sentiment);
  const { predictions, loading: predictionLoading } = useAppSelector((state) => state.prediction);
  const { watchlist } = useAppSelector((state) => state.portfolio);
  
  const [tabValue, setTabValue] = useState(0);
  const [stockData, setStockData] = useState({
    price: 175.50,
    change: 5.25,
    changePercent: 3.08,
    volume: 45000000,
    marketCap: 2800000000000,
    peRatio: 28.5,
    high52Week: 182.50,
    low52Week: 124.17,
  });

  useEffect(() => {
    if (symbol) {
      dispatch(fetchSentiment(symbol));
      dispatch(fetchPredictions(symbol));
    }
  }, [dispatch, symbol]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleWatchlistToggle = () => {
    if (symbol) {
      if (isInWatchlist(symbol)) {
        dispatch(removeFromWatchlist(symbol));
      } else {
        dispatch(addToWatchlist(symbol));
      }
    }
  };

  const isInWatchlist = (stockSymbol: string) => {
    return watchlist.includes(stockSymbol.toUpperCase());
  };

  const isPositive = stockData.change >= 0;

  // Mock technical indicators
  const technicalIndicators = [
    { name: 'RSI (14)', value: 65.2, status: 'Neutral' },
    { name: 'MACD', value: 2.45, status: 'Bullish' },
    { name: 'SMA (20)', value: 168.30, status: 'Above' },
    { name: 'SMA (50)', value: 165.80, status: 'Above' },
    { name: 'Bollinger Bands', value: 'Upper', status: 'Near Upper' },
  ];

  const mockNews = [
    {
      title: `${symbol} reports strong quarterly earnings`,
      source: 'Reuters',
      time: '2 hours ago',
      sentiment: 0.7,
    },
    {
      title: `Analysts upgrade ${symbol} price target`,
      source: 'Bloomberg',
      time: '4 hours ago',
      sentiment: 0.5,
    },
    {
      title: `${symbol} faces regulatory challenges`,
      source: 'CNBC',
      time: '6 hours ago',
      sentiment: -0.3,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {symbol?.toUpperCase()}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Apple Inc.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={isInWatchlist(symbol || '') ? <Star /> : <StarBorder />}
            onClick={handleWatchlistToggle}
          >
            {isInWatchlist(symbol || '') ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </Button>
        </Box>

        {/* Price Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h3" gutterBottom>
                  ${stockData.price.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    icon={isPositive ? <TrendingUp /> : <TrendingDown />}
                    label={`${isPositive ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)`}
                    color={isPositive ? 'success' : 'error'}
                    size="large"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Volume: {stockData.volume.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Market Cap
                    </Typography>
                    <Typography variant="h6">
                      ${(stockData.marketCap / 1000000000).toFixed(1)}B
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      P/E Ratio
                    </Typography>
                    <Typography variant="h6">
                      {stockData.peRatio}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      52W High
                    </Typography>
                    <Typography variant="h6">
                      ${stockData.high52Week}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      52W Low
                    </Typography>
                    <Typography variant="h6">
                      ${stockData.low52Week}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Sentiment Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Market Sentiment
              </Typography>
              <SentimentGauge
                value={currentSentiment?.overall_sentiment || 0}
                size={120}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Predictions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <PredictionCard
                    symbol={symbol || 'AAPL'}
                    prediction="Bullish"
                    confidence={85}
                    targetPrice={180}
                    currentPrice={stockData.price}
                    timeframe="1 Week"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PredictionCard
                    symbol={symbol || 'AAPL'}
                    prediction="Neutral"
                    confidence={72}
                    targetPrice={175}
                    currentPrice={stockData.price}
                    timeframe="1 Month"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Analysis Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Timeline />} label="Technical Analysis" />
            <Tab icon={<Psychology />} label="Sentiment Analysis" />
            <Tab icon={<Assessment />} label="News & Events" />
          </Tabs>
        </Box>

        {/* Technical Analysis Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Technical Indicators
          </Typography>
          <Grid container spacing={2}>
            {technicalIndicators.map((indicator, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {indicator.name}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {indicator.value}
                    </Typography>
                    <Chip
                      label={indicator.status}
                      color={
                        indicator.status === 'Bullish' ? 'success' :
                        indicator.status === 'Bearish' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Sentiment Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Sentiment Breakdown
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    News Sentiment
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Positive</Typography>
                    <Typography variant="body2">65%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={65} color="success" sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Neutral</Typography>
                    <Typography variant="body2">25%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={25} color="warning" sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Negative</Typography>
                    <Typography variant="body2">10%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={10} color="error" />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Social Media Sentiment
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Positive</Typography>
                    <Typography variant="body2">58%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={58} color="success" sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Neutral</Typography>
                    <Typography variant="body2">30%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={30} color="warning" sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Negative</Typography>
                    <Typography variant="body2">12%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={12} color="error" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* News & Events Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Latest News
          </Typography>
          <List>
            {mockNews.map((news, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  {news.sentiment > 0.3 ? (
                    <TrendingUp color="success" />
                  ) : news.sentiment < -0.3 ? (
                    <TrendingDown color="error" />
                  ) : (
                    <Assessment color="warning" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={news.title}
                  secondary={`${news.source} • ${news.time}`}
                />
                <Chip
                  label={`Sentiment: ${(news.sentiment * 100).toFixed(0)}%`}
                  color={news.sentiment > 0.3 ? 'success' : news.sentiment < -0.3 ? 'error' : 'warning'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default StockAnalysis;
