import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface PortfolioItem {
  id: number;
  symbol: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
  purchase_date: string;
}

interface Alert {
  id: number;
  symbol: string;
  alert_type: string;
  target_value: number;
  condition: string;
  is_active: boolean;
}

interface PortfolioState {
  portfolio: PortfolioItem[];
  watchlist: string[];
  alerts: Alert[];
  performance: {
    total_value: number;
    total_cost: number;
    total_gain: number;
    total_gain_percent: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  portfolio: [],
  watchlist: [],
  alerts: [],
  performance: {
    total_value: 0,
    total_cost: 0,
    total_gain: 0,
    total_gain_percent: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetchPortfolio',
  async () => {
    const response = await api.get('/portfolio/');
    return response.data;
  }
);

export const fetchWatchlist = createAsyncThunk(
  'portfolio/fetchWatchlist',
  async () => {
    const response = await api.get('/portfolio/watchlist');
    return response.data;
  }
);

export const fetchPortfolioPerformance = createAsyncThunk(
  'portfolio/fetchPerformance',
  async () => {
    const response = await api.get('/portfolio/performance');
    return response.data;
  }
);

export const addToPortfolio = createAsyncThunk(
  'portfolio/addToPortfolio',
  async (data: { symbol: string; quantity: number; purchase_price: number }) => {
    const response = await api.post('/portfolio/add', data);
    return response.data;
  }
);

export const addToWatchlistAsync = createAsyncThunk(
  'portfolio/addToWatchlist',
  async (symbol: string) => {
    const response = await api.post('/portfolio/watchlist/add', { symbol });
    return response.data;
  }
);

export const removeFromWatchlistAsync = createAsyncThunk(
  'portfolio/removeFromWatchlist',
  async (symbol: string) => {
    await api.delete(`/portfolio/watchlist/${symbol}`);
    return symbol;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    // Local watchlist management (for quick UI updates)
    addToWatchlist: (state, action: PayloadAction<string>) => {
      const symbol = action.payload.toUpperCase();
      if (!state.watchlist.includes(symbol)) {
        state.watchlist.push(symbol);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      const symbol = action.payload.toUpperCase();
      state.watchlist = state.watchlist.filter(s => s !== symbol);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch portfolio
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action: PayloadAction<PortfolioItem[]>) => {
        state.loading = false;
        state.portfolio = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch portfolio';
      })
      // Fetch watchlist
      .addCase(fetchWatchlist.fulfilled, (state, action: PayloadAction<Array<{symbol: string}>>) => {
        state.watchlist = action.payload.map(item => item.symbol);
      })
      // Fetch performance
      .addCase(fetchPortfolioPerformance.fulfilled, (state, action) => {
        state.performance = action.payload;
      })
      // Add to portfolio
      .addCase(addToPortfolio.fulfilled, (state, action) => {
        state.portfolio.push(action.payload.portfolio_item);
      })
      // Add to watchlist async
      .addCase(addToWatchlistAsync.fulfilled, (state, action) => {
        const symbol = action.payload.watchlist_item.symbol;
        if (!state.watchlist.includes(symbol)) {
          state.watchlist.push(symbol);
        }
      })
      // Remove from watchlist async
      .addCase(removeFromWatchlistAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.watchlist = state.watchlist.filter(s => s !== action.payload);
      });
  },
});

export const { addToWatchlist, removeFromWatchlist, clearError } = portfolioSlice.actions;
export default portfolioSlice.reducer;
