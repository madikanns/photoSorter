import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface Prediction {
  id: number;
  symbol: string;
  predicted_price: number;
  confidence: number;
  timeframe: string;
  date: string;
}

interface PredictionState {
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
}

const initialState: PredictionState = {
  predictions: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPredictions = createAsyncThunk(
  'prediction/fetchPredictions',
  async (symbol: string) => {
    const response = await api.get(`/predictions/${symbol}`);
    return response.data;
  }
);

export const generatePrediction = createAsyncThunk(
  'prediction/generatePrediction',
  async (data: { symbol: string; timeframe: string; model_type: string }) => {
    const response = await api.post(`/predictions/${data.symbol}/predict`, {
      timeframe: data.timeframe,
      model_type: data.model_type,
    });
    return response.data;
  }
);

const predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch predictions
      .addCase(fetchPredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPredictions.fulfilled, (state, action: PayloadAction<Prediction[]>) => {
        state.loading = false;
        state.predictions = action.payload;
      })
      .addCase(fetchPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch predictions';
      })
      // Generate prediction
      .addCase(generatePrediction.fulfilled, (state, action) => {
        state.predictions.unshift(action.payload.prediction);
      });
  },
});

export const { clearError } = predictionSlice.actions;
export default predictionSlice.reducer;
