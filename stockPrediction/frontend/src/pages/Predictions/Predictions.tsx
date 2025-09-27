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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Psychology,
  Timeline,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPredictions, generatePrediction } from '../../store/slices/predictionSlice';
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
      id={`predictions-tabpanel-${index}`}
      aria-labelledby={`predictions-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Predictions: React.FC = () => {
  const dispatch = useAppDispatch();
  const { predictions, loading, error } = useAppSelector((state) => state.prediction);
  
  const [searchSymbol, setSearchSymbol] = useState('AAPL');
  const [tabValue, setTabValue] = useState(0);
  const [selectedModel, setSelectedModel] = useState('ensemble');

  useEffect(() => {
    if (searchSymbol) {
      dispatch(fetchPredictions(searchSymbol));
    }
  }, [dispatch, searchSymbol]);

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      dispatch(fetchPredictions(searchSymbol.toUpperCase()));
    }
  };

  const handleGeneratePrediction = () => {
    if (searchSymbol.trim()) {
      dispatch(generatePrediction({
        symbol: searchSymbol.toUpperCase(),
        timeframe: '1d',
        model_type: selectedModel,
      }));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock prediction data for demonstration
  const mockPredictions = [
    {
      symbol: 'AAPL',
      prediction: 'Bullish' as const,
      confidence: 85,
      targetPrice: 180,
      currentPrice: 175,
      timeframe: '1 Week',
    },
    {
      symbol: 'MSFT',
      prediction: 'Neutral' as const,
      confidence: 72,
      targetPrice: 350,
      currentPrice: 345,
      timeframe: '1 Week',
    },
    {
      symbol: 'GOOGL',
      prediction: 'Bullish' as const,
      confidence: 78,
      targetPrice: 2800,
      currentPrice: 2750,
      timeframe: '1 Week',
    },
  ];

  const mockModelPerformance = [
    { model: 'LSTM Neural Network', accuracy: 85, predictions: 1200 },
    { model: 'Random Forest', accuracy: 78, predictions: 950 },
    { model: 'Sentiment Enhanced', accuracy: 82, predictions: 1100 },
    { model: 'Ensemble Model', accuracy: 88, predictions: 1500 },
  ];

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'Bullish': return 'success';
      case 'Bearish': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Predictions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Machine learning-powered stock price predictions
        </Typography>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<Search />}
              sx={{ minWidth: 120 }}
            >
              Get Predictions
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              label="Model Type"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 200 }}
            >
              <option value="lstm">LSTM Neural Network</option>
              <option value="random_forest">Random Forest</option>
              <option value="ensemble">Ensemble Model</option>
              <option value="sentiment_enhanced">Sentiment Enhanced</option>
            </TextField>
            <Button
              variant="outlined"
              onClick={handleGeneratePrediction}
              startIcon={<Psychology />}
            >
              Generate New Prediction
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Generating predictions...
          </Typography>
        </Box>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Timeline />} label="Current Predictions" />
            <Tab icon={<Psychology />} label="Model Performance" />
          </Tabs>
        </Box>

        {/* Current Predictions Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Predictions for {searchSymbol.toUpperCase()}
          </Typography>
          
          <Grid container spacing={3}>
            {mockPredictions.map((prediction, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <PredictionCard
                  symbol={prediction.symbol}
                  prediction={prediction.prediction}
                  confidence={prediction.confidence}
                  targetPrice={prediction.targetPrice}
                  currentPrice={prediction.currentPrice}
                  timeframe={prediction.timeframe}
                />
              </Grid>
            ))}
          </Grid>

          {predictions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Historical Predictions
              </Typography>
              <List>
                {predictions.slice(0, 5).map((prediction, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      {prediction.predicted_price > prediction.currentPrice ? (
                        <TrendingUp color="success" />
                      ) : (
                        <TrendingDown color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${prediction.symbol} - ${prediction.timeframe}`}
                      secondary={`Predicted: $${prediction.predicted_price.toFixed(2)} | Confidence: ${(prediction.confidence * 100).toFixed(0)}%`}
                    />
                    <Chip
                      label={prediction.predicted_price > prediction.currentPrice ? 'Bullish' : 'Bearish'}
                      color={getPredictionColor(prediction.predicted_price > prediction.currentPrice ? 'Bullish' : 'Bearish') as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </TabPanel>

        {/* Model Performance Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Model Performance Metrics
          </Typography>
          
          <Grid container spacing={3}>
            {mockModelPerformance.map((model, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {model.model}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Accuracy</Typography>
                        <Typography variant="body2">{model.accuracy}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={model.accuracy}
                        color={model.accuracy >= 80 ? 'success' : model.accuracy >= 70 ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {model.predictions.toLocaleString()} predictions made
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Model Comparison
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Our ensemble model combines multiple machine learning approaches:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="LSTM Neural Networks"
                      secondary="Deep learning for time series analysis"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Random Forest"
                      secondary="Ensemble learning with technical indicators"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Sentiment Analysis"
                      secondary="News and social media sentiment integration"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Technical Indicators"
                      secondary="RSI, MACD, Bollinger Bands, and more"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default Predictions;
