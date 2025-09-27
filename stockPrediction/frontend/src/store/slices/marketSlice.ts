import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface MarketData {
  sp500?: {
    price: number;
    change: number;
  };
  nasdaq?: {
    price: number;
    change: number;
  };
  dow?: {
    price: number;
    change: number;
  };
  sentiment?: {
    overall: number;
  };
  historical?: Array<{
    date: string;
    close: number;
  }>;
  news?: Array<{
    title: string;
    source: string;
    published_at: string;
    sentiment: number;
  }>;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
}

interface MarketState {
  marketData: MarketData;
  topStocks: Stock[];
  loading: boolean;
  error: string | null;
}

const initialState: MarketState = {
  marketData: {},
  topStocks: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchMarketData = createAsyncThunk(
  'market/fetchMarketData',
  async () => {
    const response = await api.get('/stocks/market/overview');
    return response.data;
  }
);

export const fetchTopStocks = createAsyncThunk(
  'market/fetchTopStocks',
  async () => {
    const [gainers, active] = await Promise.all([
      api.get('/stocks/market/top-gainers?limit=5'),
      api.get('/stocks/market/most-active?limit=5')
    ]);
    
    return [...gainers.data, ...active.data];
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch market data
      .addCase(fetchMarketData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketData.fulfilled, (state, action: PayloadAction<MarketData>) => {
        state.loading = false;
        state.marketData = action.payload;
      })
      .addCase(fetchMarketData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch market data';
      })
      // Fetch top stocks
      .addCase(fetchTopStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopStocks.fulfilled, (state, action: PayloadAction<Stock[]>) => {
        state.loading = false;
        state.topStocks = action.payload;
      })
      .addCase(fetchTopStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch top stocks';
      });
  },
});

export const { clearError } = marketSlice.actions;
export default marketSlice.reducer;
