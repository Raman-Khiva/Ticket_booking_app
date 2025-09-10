// store/slices/eventSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

// Types
export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  price: number
  total_tickets: number
  available_tickets: number
  organizer_id: string
  created_at: string
  updated_at: string
}

export interface EventFormData {
  title: string
  description: string
  date: string
  location: string
  price: number
  total_tickets: number
}

export interface EventsResponse {
  events: Event[]
  count: number
}

export interface EventState {
  events: Event[]
  currentEvent: Event | null
  myEvents: Event[]
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  filters: {
    search: string
    dateRange: {
      start: string | null
      end: string | null
    }
    priceRange: {
      min: number | null
      max: number | null
    }
  }
}

const API_BASE = 'http://localhost:8080'

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
})

// Async Thunks
export const fetchAllEvents = createAsyncThunk<
  EventsResponse,
  void,
  { rejectValue: string }
>('events/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE}/events`, {
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch events')
    }

    return data
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

export const fetchEventById = createAsyncThunk<
  Event,
  string,
  { rejectValue: string }
>('events/fetchById', async (eventId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE}/events/${eventId}`, {
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.error || 'Event not found')
    }

    return data
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

export const createEvent = createAsyncThunk<
  Event,
  EventFormData,
  { rejectValue: string; state: RootState }
>('events/create', async (eventData, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()
    if (!auth.token) {
      return rejectWithValue('No authentication token')
    }

    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getAuthHeaders(auth.token),
      body: JSON.stringify(eventData),
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to create event')
    }

    return data.event
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

export const updateEvent = createAsyncThunk<
  Event,
  { id: string; data: Partial<EventFormData> },
  { rejectValue: string; state: RootState }
>('events/update', async ({ id, data }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()
    if (!auth.token) {
      return rejectWithValue('No authentication token')
    }

    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(auth.token),
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to update event')
    }

    return result.event
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

export const deleteEvent = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('events/delete', async (eventId, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()
    if (!auth.token) {
      return rejectWithValue('No authentication token')
    }

    const response = await fetch(`${API_BASE}/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth.token}` },
    })

    if (!response.ok) {
      const data = await response.json()
      return rejectWithValue(data.error || 'Failed to delete event')
    }

    return eventId
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

// Fetch events created by the current user (organizer)
export const fetchMyEvents = createAsyncThunk<
  Event[],
  void,
  { rejectValue: string; state: RootState }
>('events/fetchMy', async (_, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState()
    if (!auth.token || !auth.user) {
      return rejectWithValue('No authentication token')
    }

    const response = await fetch(`${API_BASE}/events`, {
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch events')
    }

    // Filter events by organizer_id
    const myEvents = data.events.filter((event: Event) => event.organizer_id === auth.user?.id)
    return myEvents
  } catch (error) {
    return rejectWithValue('Network error occurred')
  }
})

// Initial state
const initialState: EventState = {
  events: [],
  currentEvent: null,
  myEvents: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {
    search: '',
    dateRange: {
      start: null,
      end: null,
    },
    priceRange: {
      min: null,
      max: null,
    },
  },
}

// Event Slice
const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload
    },
    setDateRangeFilter: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
      state.filters.dateRange = action.payload
    },
    setPriceRangeFilter: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.filters.priceRange = action.payload
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        dateRange: { start: null, end: null },
        priceRange: { min: null, max: null },
      }
    },
    updateEventTickets: (state, action: PayloadAction<{ eventId: string; ticketChange: number }>) => {
      const { eventId, ticketChange } = action.payload
      
      // Update in events array
      const eventIndex = state.events.findIndex(event => event.id === eventId)
      if (eventIndex !== -1) {
        state.events[eventIndex].available_tickets += ticketChange
      }
      
      // Update current event if it's the same
      if (state.currentEvent?.id === eventId) {
        state.currentEvent.available_tickets += ticketChange
      }
      
      // Update in my events
      const myEventIndex = state.myEvents.findIndex(event => event.id === eventId)
      if (myEventIndex !== -1) {
        state.myEvents[myEventIndex].available_tickets += ticketChange
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch All Events
    builder
      .addCase(fetchAllEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.events = action.payload.events
        state.error = null
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch events'
      })

    // Fetch Event By ID
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentEvent = action.payload
        state.error = null
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch event'
      })

    // Create Event
    builder
      .addCase(createEvent.pending, (state) => {
        state.isCreating = true
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isCreating = false
        state.events.unshift(action.payload)
        state.myEvents.unshift(action.payload)
        state.error = null
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isCreating = false
        state.error = action.payload || 'Failed to create event'
      })

    // Update Event
    builder
      .addCase(updateEvent.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isUpdating = false
        const updatedEvent = action.payload
        
        // Update in events array
        const eventIndex = state.events.findIndex(event => event.id === updatedEvent.id)
        if (eventIndex !== -1) {
          state.events[eventIndex] = updatedEvent
        }
        
        // Update in my events
        const myEventIndex = state.myEvents.findIndex(event => event.id === updatedEvent.id)
        if (myEventIndex !== -1) {
          state.myEvents[myEventIndex] = updatedEvent
        }
        
        // Update current event
        if (state.currentEvent?.id === updatedEvent.id) {
          state.currentEvent = updatedEvent
        }
        
        state.error = null
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload || 'Failed to update event'
      })

    // Delete Event
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.isDeleting = true
        state.error = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isDeleting = false
        const eventId = action.payload
        
        // Remove from events array
        state.events = state.events.filter(event => event.id !== eventId)
        
        // Remove from my events
        state.myEvents = state.myEvents.filter(event => event.id !== eventId)
        
        // Clear current event if it was deleted
        if (state.currentEvent?.id === eventId) {
          state.currentEvent = null
        }
        
        state.error = null
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isDeleting = false
        state.error = action.payload || 'Failed to delete event'
      })

    // Fetch My Events
    builder
      .addCase(fetchMyEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.myEvents = action.payload
        state.error = null
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch your events'
      })
  },
})

export const {
  clearError,
  clearCurrentEvent,
  setSearchFilter,
  setDateRangeFilter,
  setPriceRangeFilter,
  clearFilters,
  updateEventTickets,
} = eventSlice.actions

export default eventSlice.reducer

// Selectors
export const selectEvents = (state: RootState) => state.events.events
export const selectCurrentEvent = (state: RootState) => state.events.currentEvent
export const selectMyEvents = (state: RootState) => state.events.myEvents
export const selectEventsLoading = (state: RootState) => state.events.isLoading
export const selectEventsError = (state: RootState) => state.events.error
export const selectEventFilters = (state: RootState) => state.events.filters

// Filtered events selector
export const selectFilteredEvents = (state: RootState) => {
  const { events, filters } = state.events
  
  return events.filter((event) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }
    
    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const eventDate = new Date(event.date)
      
      if (filters.dateRange.start && eventDate < new Date(filters.dateRange.start)) {
        return false
      }
      
      if (filters.dateRange.end && eventDate > new Date(filters.dateRange.end)) {
        return false
      }
    }
    
    // Price range filter
    if (filters.priceRange.min !== null && event.price < filters.priceRange.min) {
      return false
    }
    
    if (filters.priceRange.max !== null && event.price > filters.priceRange.max) {
      return false
    }
    
    return true
  })
}