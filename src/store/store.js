import { configureStore } from '@reduxjs/toolkit';
import { courseApi } from '../features/api/courseApi';

export const store = configureStore({
  reducer: {
    [courseApi.reducerPath]: courseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(courseApi.middleware),
}); 