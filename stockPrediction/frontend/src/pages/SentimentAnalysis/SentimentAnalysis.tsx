import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
} from '@mui/material';
import {
  Search,
  Twitter,
  Reddit,
  Article,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchSentiment, fetchSentimentTrends } from '../../store/slices/sentimentSlice';
import SentimentGauge from '../../components/SentimentGauge/SentimentGauge';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SentimentAnalysis: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentSentiment, sentimentHistory, loading, error } = useAppSelector(
    (state) => state.sentiment
  );
  
  const [searchSymbol, setSearchSymbol] = useState('AAPL');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (searchSymbol) {
      dispatch(fetchSentiment(searchSymbol));
      dispatch(fetchSentimentTrends({ symbol: searchSymbol, days: 7 }));
    }
  }, [dispatch, searchSymbol]);

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      dispatch(fetchSentiment(searchSymbol.toUpperCase()));
      dispatch(fetchSentimentTrends({ symbol: searchSymbol.toUpperCase(), days: 7 }));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data for demonstration
  const mockNewsData = [
    {
      title: `${searchSymbol} reports strong quarterly earnings`,
      source: 'Reuters',
      sentiment: 0.7,
      time: '2 hours ago',
    },
    {
      title: `Analysts upgrade ${searchSymbol} price target`,
      source: 'Bloomberg',
      sentiment: 0.5,
      time: '4 hours ago',
    },
    {
      title: `${searchSymbol} faces regulatory challenges`,
      source: 'CNBC',
      sentiment: -0.3,
      time: '6 hours ago',
    },
  ];

  const mockSocialData = [
    {
      platform: 'Twitter',
      content: `$${searchSymbol} looking bullish today! 🚀`,
      sentiment: 0.8,
      engagement: 125,
    },
    {
      platform: 'Reddit',
      content: `DD: Why I'm bullish on ${searchSymbol}`,
      sentiment: 0.6,
      engagement: 89,
    },
    {
      platform: 'StockTwits',
      content: `$${searchSymbol} #bullish #stocks`,
      sentiment: 0.4,
      engagement: 45,
    },
  ];

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'success';
    if (sentiment < -0.2) return 'error';
    return 'warning';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sentiment Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time sentiment analysis from news and social media
        </Typography>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
              Analyze
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Overall Sentiment */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Overall Sentiment
              </Typography>
              <SentimentGauge
                value={currentSentiment?.overall_sentiment || 0}
                size={150}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sentiment Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                    <Typography variant="h4" color="success.contrastText">
                      {currentSentiment ? (currentSentiment.positive_score * 100).toFixed(0) : 0}%
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      Positive
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                    <Typography variant="h4" color="warning.contrastText">
                      {currentSentiment ? (currentSentiment.neutral_score * 100).toFixed(0) : 0}%
                    </Typography>
                    <Typography variant="body2" color="warning.contrastText">
                      Neutral
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                    <Typography variant="h4" color="error.contrastText">
                      {currentSentiment ? (currentSentiment.negative_score * 100).toFixed(0) : 0}%
                    </Typography>
                    <Typography variant="body2" color="error.contrastText">
                      Negative
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Confidence: {currentSentiment ? (currentSentiment.confidence * 100).toFixed(0) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sources: {currentSentiment?.source_count || 0} articles and posts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Analysis */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Article />} label="News Sentiment" />
            <Tab icon={<Twitter />} label="Social Media" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            News Sentiment Analysis
          </Typography>
          <List>
            {mockNewsData.map((news, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={news.title}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {news.source} • {news.time}
                      </Typography>
                      <Chip
                        label={`Sentiment: ${(news.sentiment * 100).toFixed(0)}%`}
                        color={getSentimentColor(news.sentiment) as any}
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Social Media Sentiment
          </Typography>
          <List>
            {mockSocialData.map((post, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={post.content}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {post.platform} • {post.engagement} interactions
                      </Typography>
                      <Chip
                        label={`Sentiment: ${(post.sentiment * 100).toFixed(0)}%`}
                        color={getSentimentColor(post.sentiment) as any}
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default SentimentAnalysis;
