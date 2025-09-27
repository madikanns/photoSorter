import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import marketReducer from './slices/marketSlice';
import portfolioReducer from './slices/portfolioSlice';
import sentimentReducer from './slices/sentimentSlice';
import predictionReducer from './slices/predictionSlice';

const persistConfig = {
  key: 'stockprediction',
  storage,
  whitelist: ['portfolio'], // Only persist portfolio data
};

const rootReducer = combineReducers({
  market: marketReducer,
  portfolio: portfolioReducer,
  sentiment: sentimentReducer,
  prediction: predictionReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
