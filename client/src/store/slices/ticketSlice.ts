// store/slices/ticketSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { Event } from './eventSlice'

// Types
export interface Ticket {
  id: string
  event_id: string
  user_id: string
  qr_code: string
  status: 'active' | 'used' | 'cancelled'
  price: number
  created_at: string
  updated_at: string
  event?: Event // Populated event details
}

export interface TicketWithEvent {
  id: string
  event: {
    id: string
    title: string
    description: string
    date: string
    location: string
    price: number
  }
  qr_code: string
  status: 'active' | 'used' | 'cancelled'
  price: number
  created_at: string
}

export interface ValidateTicketRequest {
  qr_code: string
}

export interface ValidateTicketResponse {
  message: string
  ticket: {
    id: string
    event: string
    user_id: string
  }
}

export interface TicketState {
  myTickets: TicketWithEvent[]
  validatedTicket: ValidateTicketResponse | null
  isLoading: boolean
  isBooking: boolean
  isValidating: boolean
  error: string | null
  bookingSuccess: boolean
  validationSuccess: boolean
}

const API_BASE =  'http://localhost:8080'

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
})

// Async Thunks
export const bookTicket = createAsyncThunk<
  Ticket,
  string, // eventId
  { rejectValue: string; state: RootState }
>('tickets/book', async (eventId, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()
    if (!auth.token) {
      return rejectWithValue('No authentication token')
    }

    const response = await fetch(`${API_BASE}/tickets/book/${eventId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${auth.token}` },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to book ticket')
    }

    return data
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

export const fetchMyTickets = createAsyncThunk<
  { tickets: TicketWithEvent[] },
  void,
  { rejectValue: string; state: RootState }
>('tickets/fetchMy', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()
    if (!auth.token) {
      return rejectWithValue('No authentication token')
    }

    const response = await fetch(`${API_BASE}/tickets/my`, {
      headers: { 'Authorization': `Bearer ${auth.token}` },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch tickets')
    }

    return data
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

export const validateTicket = createAsyncThunk<
  ValidateTicketResponse,
  ValidateTicketRequest,
  { rejectValue: string; state: RootState }
>('tickets/validate', async (request, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()
    if (!auth.token) {
      return rejectWithValue('No authentication token')
    }

    const response = await fetch(`${API_BASE}/tickets/validate`, {
      method: 'POST',
      headers: getAuthHeaders(auth.token),
      body: JSON.stringify(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to validate ticket')
    }

    return data
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

// Cancel ticket (if needed - not in original API but useful)
export const cancelTicket = createAsyncThunk<
  string, // ticketId
  string, // ticketId
  { rejectValue: string; state: RootState }
>('tickets/cancel', async (ticketId, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()
    if (!auth.token) {
      return rejectWithValue('No authentication token')
    }

    // This endpoint might not exist in your API, adjust as needed
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${auth.token}` },
    })

    if (!response.ok) {
      const data = await response.json()
      return rejectWithValue(data.error || 'Failed to cancel ticket')
    }

    return ticketId
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

// Initial state
const initialState: TicketState = {
  myTickets: [],
  validatedTicket: null,
  isLoading: false,
  isBooking: false,
  isValidating: false,
  error: null,
  bookingSuccess: false,
  validationSuccess: false,
}

// Ticket Slice
const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearBookingSuccess: (state) => {
      state.bookingSuccess = false
    },
    clearValidationSuccess: (state) => {
      state.validationSuccess = false
    },
    clearValidatedTicket: (state) => {
      state.validatedTicket = null
    },
    updateTicketStatus: (state, action: PayloadAction<{ ticketId: string; status: 'active' | 'used' | 'cancelled' }>) => {
      const { ticketId, status } = action.payload
      const ticket = state.myTickets.find(ticket => ticket.id === ticketId)
      if (ticket) {
        ticket.status = status
      }
    },
    // Local storage sync actions
    syncTicketsFromStorage: (state, action: PayloadAction<TicketWithEvent[]>) => {
      state.myTickets = action.payload
    },
  },
  extraReducers: (builder) => {
    // Book Ticket
    builder
      .addCase(bookTicket.pending, (state) => {
        state.isBooking = true
        state.error = null
        state.bookingSuccess = false
      })
      .addCase(bookTicket.fulfilled, (state, action) => {
        state.isBooking = false
        state.bookingSuccess = true
        state.error = null
        
        // Note: The booked ticket will be fetched in the next fetchMyTickets call
        // since the API response format doesn't match TicketWithEvent
      })
      .addCase(bookTicket.rejected, (state, action) => {
        state.isBooking = false
        state.error = action.payload || 'Failed to book ticket'
        state.bookingSuccess = false
      })

    // Fetch My Tickets
    builder
      .addCase(fetchMyTickets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyTickets.fulfilled, (state, action) => {
        state.isLoading = false
        state.myTickets = action.payload.tickets
        state.error = null
        
        // Store tickets in localStorage for offline access
        try {
          localStorage.setItem('myTickets', JSON.stringify(action.payload.tickets))
        } catch (error) {
          console.warn('Failed to save tickets to localStorage:', error)
        }
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch tickets'
      })

    // Validate Ticket
    builder
      .addCase(validateTicket.pending, (state) => {
        state.isValidating = true
        state.error = null
        state.validationSuccess = false
      })
      .addCase(validateTicket.fulfilled, (state, action) => {
        state.isValidating = false
        state.validatedTicket = action.payload
        state.validationSuccess = true
        state.error = null
      })
      .addCase(validateTicket.rejected, (state, action) => {
        state.isValidating = false
        state.error = action.payload || 'Failed to validate ticket'
        state.validationSuccess = false
      })

    // Cancel Ticket
    builder
      .addCase(cancelTicket.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelTicket.fulfilled, (state, action) => {
        state.isLoading = false
        const ticketId = action.payload
        
        // Update ticket status to cancelled
        const ticket = state.myTickets.find(ticket => ticket.id === ticketId)
        if (ticket) {
          ticket.status = 'cancelled'
        }
        
        // Update localStorage
        try {
          localStorage.setItem('myTickets', JSON.stringify(state.myTickets))
        } catch (error) {
          console.warn('Failed to update tickets in localStorage:', error)
        }
        
        state.error = null
      })
      .addCase(cancelTicket.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to cancel ticket'
      })
  },
})

export const {
  clearError,
  clearBookingSuccess,
  clearValidationSuccess,
  clearValidatedTicket,
  updateTicketStatus,
  syncTicketsFromStorage,
} = ticketSlice.actions

export default ticketSlice.reducer

// Selectors
export const selectMyTickets = (state: RootState) => state.tickets.myTickets
export const selectValidatedTicket = (state: RootState) => state.tickets.validatedTicket
export const selectTicketsLoading = (state: RootState) => state.tickets.isLoading
export const selectTicketsError = (state: RootState) => state.tickets.error
export const selectIsBooking = (state: RootState) => state.tickets.isBooking
export const selectIsValidating = (state: RootState) => state.tickets.isValidating
export const selectBookingSuccess = (state: RootState) => state.tickets.bookingSuccess
export const selectValidationSuccess = (state: RootState) => state.tickets.validationSuccess

// Filtered tickets selectors
export const selectActiveTickets = (state: RootState) => 
  state.tickets.myTickets?.filter(ticket => ticket.status === 'active') ?? [];

export const selectUsedTickets = (state: RootState) => 
  state.tickets.myTickets?.filter(ticket => ticket.status === 'used') ?? [];

export const selectCancelledTickets = (state: RootState) => 
  state.tickets.myTickets?.filter(ticket => ticket.status === 'cancelled') ?? [];

export const selectUpcomingTickets = (state: RootState) => 
  state.tickets.myTickets?.filter(ticket => {
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    return eventDate > now && ticket.status === 'active';
  }) ?? [];

export const selectPastTickets = (state: RootState) => 
  state.tickets.myTickets?.filter(ticket => {
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    return eventDate <= now;
  }) ?? [];
