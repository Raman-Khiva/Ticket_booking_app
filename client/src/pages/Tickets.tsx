import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import TicketCard from '@/components/TicketCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket as TicketIcon, Calendar, Loader2, Filter } from 'lucide-react';
import { 
  fetchMyTickets, 
  selectMyTickets, 
  selectTicketsLoading, 
  selectTicketsError,
  selectActiveTickets,
  selectUsedTickets,
  selectUpcomingTickets,
  selectPastTickets
} from '@/store/slices/ticketSlice';
import { 
  selectAuth, 
  selectIsAuthenticated 
} from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';

// Mock data fallback for testing
const mockTickets = [
  {
    id: "1",
    event: {
      id: "1",
      title: "Tech Conference 2024",
      description: "Annual technology conference",
      date: "2024-10-15T09:00:00Z",
      location: "Convention Center",
      price: 99
    },
    qr_code: "QR123456",
    status: "active" as const,
    price: 99,
    created_at: "2024-09-01T10:00:00Z"
  },
  {
    id: "2", 
    event: {
      id: "2",
      title: "Music Festival",
      description: "Three-day music festival",
      date: "2024-08-20T18:00:00Z",
      location: "City Park",
      price: 149
    },
    qr_code: "QR789012",
    status: "used" as const,
    price: 149,
    created_at: "2024-07-15T14:30:00Z"
  }
];

const Tickets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const myTickets = useSelector(selectMyTickets);
  const activeTickets = useSelector(selectActiveTickets);
  const usedTickets = useSelector(selectUsedTickets);
  const upcomingTickets = useSelector(selectUpcomingTickets);
  const pastTickets = useSelector(selectPastTickets);
  const isLoading = useSelector(selectTicketsLoading);
  const error = useSelector(selectTicketsError);
  const { isAuthenticated } = useSelector(selectAuth);
  
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'upcoming' | 'past'>('all');
  const [useMockData, setUseMockData] = useState(false);

  // Fetch tickets on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyTickets());
    }
  }, [dispatch, isAuthenticated]);

  // Show mock data if no real data and for testing purposes
  useEffect(() => {
    if (!isLoading && myTickets?.length === 0 && !error) {
      setUseMockData(true);
    } else {
      setUseMockData(false);
    }
  }, [isLoading, myTickets?.length, error]);

  // Handle authentication redirect
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardHeader>
            <TicketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-xl text-foreground">Please Login</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view your tickets.
            </p>
            <Link to="/auth/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine which tickets to display
  const getFilteredTickets = () => {
    const tickets = useMockData ? mockTickets : myTickets;
    
    switch (filter) {
      case 'active':
        return useMockData 
          ? tickets.filter(t => t.status === 'active')
          : activeTickets;
      case 'used':
        return useMockData 
          ? tickets.filter(t => t.status === 'used')
          : usedTickets;
      case 'upcoming':
        return useMockData
          ? tickets.filter(t => new Date(t.event.date) > new Date() && t.status === 'active')
          : upcomingTickets;
      case 'past':
        return useMockData
          ? tickets.filter(t => new Date(t.event.date) <= new Date())
          : pastTickets;
      default:
        return tickets;
    }
  };

  const filteredTickets = getFilteredTickets();
  const totalTickets = useMockData ? mockTickets?.length??0 : myTickets?.length??0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your booked event tickets
        </p>
        {useMockData && (
          <Badge variant="outline" className="mt-2">
            Showing sample data for testing
          </Badge>
        )}
      </div>

      {/* Loading State */}
      {isLoading && !useMockData && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your tickets...</span>
        </div>
      )}

      {/* Error State */}
      {error && !useMockData && (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">Error Loading Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => dispatch(fetchMyTickets())}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tickets Display */}
      {!isLoading && (totalTickets > 0 || useMockData) && (
        <>
          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                <Filter className="h-4 w-4 mr-1" />
                All ({totalTickets})
              </Button>
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('upcoming')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Upcoming ({useMockData 
                  ? mockTickets.filter(t => new Date(t.event.date) > new Date() && t.status === 'active').length
                  : upcomingTickets.length
                })
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active ({useMockData 
                  ? mockTickets.filter(t => t.status === 'active').length
                  : activeTickets.length
                })
              </Button>
              <Button
                variant={filter === 'used' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('used')}
              >
                Used ({useMockData 
                  ? mockTickets.filter(t => t.status === 'used').length
                  : usedTickets.length
                })
              </Button>
              <Button
                variant={filter === 'past' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('past')}
              >
                Past Events ({useMockData
                  ? mockTickets.filter(t => new Date(t.event.date) <= new Date()).length
                  : pastTickets.length
                })
              </Button>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length > 0 ? (
            <div className="space-y-6">
              {filteredTickets.map((ticketData) => {
                // Handle both mock data structure and real API structure
                const ticket = useMockData ? ticketData : ticketData;
                const event = useMockData ? ticketData.event : ticketData.event;
                
                // Safety check for event data
                if (!event) {
                  return (
                    <Card key={ticket.id} className="p-4">
                      <p className="text-muted-foreground">Event information unavailable for ticket {ticket.id}</p>
                    </Card>
                  );
                }

                return (
                  <TicketCard 
                    key={ticket.id}
                    ticket={{
                      id: ticket.id,
                      eventId: event.id,
                      userId: useMockData ? "mock-user" :  "unknown",
                      qrCode: ticket.qr_code || `QR_${ticket.id}`,
                      status: ticket.status,
                      price: ticket.price,
                      createdAt: ticket.created_at || new Date().toISOString()
                    }}
                    event={{
                      id: event.id,
                      title: event.title || "Event Title",
                      description: event.description || "Event Description",
                      date: event.date,
                      location: event.location || "Location TBD",
                      price: event.price || 0,
                      totalTickets: useMockData ? 100 : (event as any).total_tickets || 0,
                      availableTickets: useMockData ? 50 : (event as any).available_tickets || 0,
                      organizerId: useMockData ? "mock-organizer" : (event as any).organizer_id || "unknown",
                      createdAt: useMockData ? new Date().toISOString() : (event as any).created_at || new Date().toISOString(),
                      updatedAt: useMockData ? new Date().toISOString() : (event as any).updated_at || new Date().toISOString()
                    }}
                    showQR={true}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardHeader>
                <TicketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-xl text-foreground">
                  No {filter !== 'all' ? filter : ''} Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {filter === 'all' 
                    ? "You haven't booked any tickets yet."
                    : `No ${filter} tickets found.`
                  }
                </p>
                <Button onClick={() => setFilter('all')} className="mr-2">
                  {filter !== 'all' ? 'View All Tickets' : 'Browse Events'}
                </Button>
                {filter === 'all' && (
                  <Link to="/events">
                    <Button variant="outline">Browse Events</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State for No Tickets */}
      {!isLoading && !error && totalTickets === 0 && !useMockData && (
        <Card className="text-center py-12">
          <CardHeader>
            <TicketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-xl text-foreground">No Tickets Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven't booked any tickets yet. Browse events to get started!
            </p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tickets;