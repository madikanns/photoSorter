import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface SentimentData {
  overall_sentiment: number;
  confidence: number;
  positive_score: number;
  negative_score: number;
  neutral_score: number;
  source_count: number;
}

interface SentimentState {
  currentSentiment: SentimentData | null;
  sentimentHistory: Array<{
    date: string;
    sentiment: number;
    confidence: number;
  }>;
  loading: boolean;
  error: string | null;
}

const initialState: SentimentState = {
  currentSentiment: null,
  sentimentHistory: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSentiment = createAsyncThunk(
  'sentiment/fetchSentiment',
  async (symbol: string) => {
    const response = await api.get(`/sentiment/${symbol}`);
    return response.data;
  }
);

export const fetchSentimentTrends = createAsyncThunk(
  'sentiment/fetchTrends',
  async (data: { symbol: string; days: number }) => {
    const response = await api.get(`/sentiment/${data.symbol}/trends?days=${data.days}`);
    return response.data;
  }
);

const sentimentSlice = createSlice({
  name: 'sentiment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sentiment
      .addCase(fetchSentiment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSentiment.fulfilled, (state, action: PayloadAction<SentimentData>) => {
        state.loading = false;
        state.currentSentiment = action.payload;
      })
      .addCase(fetchSentiment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sentiment';
      })
      // Fetch sentiment trends
      .addCase(fetchSentimentTrends.fulfilled, (state, action) => {
        state.sentimentHistory = action.payload;
      });
  },
});

export const { clearError } = sentimentSlice.actions;
export default sentimentSlice.reducer;
