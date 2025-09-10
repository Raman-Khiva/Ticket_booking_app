// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import authSlice from '@/store/slices/authSlice'
import eventSlice from '@/store/slices/eventSlice'
import ticketSlice from '@/store/slices/ticketSlice'
// import uiSlice from '@/store/slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    events: eventSlice,
    tickets: ticketSlice,
    // ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector