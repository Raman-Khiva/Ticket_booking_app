import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Filter } from 'lucide-react';
import EventCard from '@/components/EventCard';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  fetchAllEvents,
  selectFilteredEvents,
  selectEventsLoading,
  selectEventsError,
  selectEventFilters,
  setSearchFilter,
  setPriceRangeFilter,
  clearFilters,
  clearError
} from '@/store/slices/eventSlice';

const Events = () => {
  const dispatch = useAppDispatch();
  
  // Redux state selectors
  const filteredEvents = useAppSelector(selectFilteredEvents);
  const isLoading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const filters = useAppSelector(selectEventFilters);

  // Load events on component mount
  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  // Clear error when component unmounts or on retry
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [error, dispatch]);

  const handleSearchChange = (value: string) => {
    dispatch(setSearchFilter(value));
  };

  const handlePriceFilterChange = (priceRange: string) => {
    switch (priceRange) {
      case 'free':
        dispatch(setPriceRangeFilter({ min: 0, max: 0 }));
        break;
      case 'under-50':
        dispatch(setPriceRangeFilter({ min: 0.01, max: 50 }));
        break;
      case '50-200':
        dispatch(setPriceRangeFilter({ min: 50, max: 200 }));
        break;
      case 'over-200':
        dispatch(setPriceRangeFilter({ min: 200, max: null }));
        break;
      default:
        dispatch(setPriceRangeFilter({ min: null, max: null }));
    }
  };

  const handleRefresh = () => {
    dispatch(fetchAllEvents());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Get current price filter value for select
  const getCurrentPriceFilter = () => {
    const { min, max } = filters.priceRange;
    if (min === 0 && max === 0) return 'free';
    if (min === 0.01 && max === 50) return 'under-50';
    if (min === 50 && max === 200) return '50-200';
    if (min === 200 && max === null) return 'over-200';
    return 'all';
  };

  const hasActiveFilters = filters.search || filters.priceRange.min !== null || filters.priceRange.max !== null;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load events</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Browse Events</h1>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            className="gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events by title, description, or location..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={getCurrentPriceFilter()} onValueChange={handlePriceFilterChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="free">Free Events</SelectItem>
              <SelectItem value="under-50">Under $50</SelectItem>
              <SelectItem value="50-200">$50 - $200</SelectItem>
              <SelectItem value="over-200">Over $200</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              onClick={handleClearFilters}
              variant="outline"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count and Active Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <p className="text-muted-foreground">
            {isLoading ? 'Loading events...' : 
             `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
          </p>
          
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 text-sm">
              {filters.search && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  Search: "{filters.search}"
                </span>
              )}
              {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  Price: {getCurrentPriceFilter().replace('-', ' - $').replace('under', 'Under $')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="bg-muted h-48 rounded mb-4"></div>
              <div className="bg-muted h-4 rounded mb-2"></div>
              <div className="bg-muted h-3 rounded mb-2 w-3/4"></div>
              <div className="bg-muted h-3 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {hasActiveFilters ? 'No events match your criteria' : 'No events found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or clear filters to see all events.'
              : 'There are no events available at the moment.'
            }
          </p>
          {hasActiveFilters && (
            <Button onClick={handleClearFilters} variant="outline">
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;