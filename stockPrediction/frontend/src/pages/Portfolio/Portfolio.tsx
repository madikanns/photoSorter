import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Add,
  Delete,
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchPortfolio, 
  fetchWatchlist, 
  fetchPortfolioPerformance,
  addToWatchlist,
  removeFromWatchlist 
} from '../../store/slices/portfolioSlice';

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
      id={`portfolio-tabpanel-${index}`}
      aria-labelledby={`portfolio-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Portfolio: React.FC = () => {
  const dispatch = useAppDispatch();
  const { portfolio, watchlist, performance, loading, error } = useAppSelector(
    (state) => state.portfolio
  );
  
  const [tabValue, setTabValue] = useState(0);
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [addWatchlistOpen, setAddWatchlistOpen] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    quantity: 0,
    purchasePrice: 0,
  });
  const [watchlistSymbol, setWatchlistSymbol] = useState('');

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchWatchlist());
    dispatch(fetchPortfolioPerformance());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddToPortfolio = () => {
    // Mock implementation - in real app, this would call the API
    console.log('Adding to portfolio:', newStock);
    setAddStockOpen(false);
    setNewStock({ symbol: '', quantity: 0, purchasePrice: 0 });
  };

  const handleAddToWatchlist = () => {
    if (watchlistSymbol.trim()) {
      dispatch(addToWatchlist(watchlistSymbol.toUpperCase()));
      setAddWatchlistOpen(false);
      setWatchlistSymbol('');
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    dispatch(removeFromWatchlist(symbol));
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol.toUpperCase());
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Portfolio Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your investments and manage your watchlist
        </Typography>
      </Box>

      {/* Performance Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4" color="primary">
                ${performance.total_value.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Cost
              </Typography>
              <Typography variant="h4">
                ${performance.total_cost.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Gain/Loss
              </Typography>
              <Typography 
                variant="h4" 
                color={performance.total_gain >= 0 ? 'success.main' : 'error.main'}
              >
                ${performance.total_gain.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gain %
              </Typography>
              <Typography 
                variant="h4" 
                color={performance.total_gain_percent >= 0 ? 'success.main' : 'error.main'}
              >
                {performance.total_gain_percent.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Portfolio" />
            <Tab label="Watchlist" />
          </Tabs>
        </Box>

        {/* Portfolio Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Your Portfolio</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddStockOpen(true)}
            >
              Add Stock
            </Button>
          </Box>

          {portfolio.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No stocks in your portfolio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start building your portfolio by adding stocks
              </Typography>
              <Button
                variant="contained"
                onClick={() => setAddStockOpen(true)}
              >
                Add Your First Stock
              </Button>
            </Paper>
          ) : (
            <List>
              {portfolio.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={item.symbol}
                    secondary={`${item.quantity} shares @ $${item.purchase_price}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete">
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Watchlist Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Watchlist</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddWatchlistOpen(true)}
            >
              Add to Watchlist
            </Button>
          </Box>

          {watchlist.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Your watchlist is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add stocks to track their performance
              </Typography>
              <Button
                variant="contained"
                onClick={() => setAddWatchlistOpen(true)}
              >
                Add to Watchlist
              </Button>
            </Paper>
          ) : (
            <List>
              {watchlist.map((symbol, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={symbol}
                    secondary="Track this stock's performance"
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="remove"
                      onClick={() => handleRemoveFromWatchlist(symbol)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Card>

      {/* Add Stock Dialog */}
      <Dialog open={addStockOpen} onClose={() => setAddStockOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Stock to Portfolio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Stock Symbol"
            fullWidth
            variant="outlined"
            value={newStock.symbol}
            onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={newStock.quantity}
            onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Purchase Price"
            type="number"
            fullWidth
            variant="outlined"
            value={newStock.purchasePrice}
            onChange={(e) => setNewStock({ ...newStock, purchasePrice: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStockOpen(false)}>Cancel</Button>
          <Button onClick={handleAddToPortfolio} variant="contained">
            Add Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add to Watchlist Dialog */}
      <Dialog open={addWatchlistOpen} onClose={() => setAddWatchlistOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Stock to Watchlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Stock Symbol"
            fullWidth
            variant="outlined"
            value={watchlistSymbol}
            onChange={(e) => setWatchlistSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL, MSFT, GOOGL"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddWatchlistOpen(false)}>Cancel</Button>
          <Button onClick={handleAddToWatchlist} variant="contained">
            Add to Watchlist
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Portfolio;
