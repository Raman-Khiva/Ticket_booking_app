import TicketCard from '@/components/TicketCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket as TicketIcon } from 'lucide-react';
import { mockTickets, mockEvents } from '@/lib/mockData';

const Tickets = () => {
  const userTickets = mockTickets.map(ticket => {
    const event = mockEvents.find(e => e.id === ticket.eventId);
    return { ticket, event };
  }).filter(item => item.event);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your booked event tickets
        </p>
      </div>

      {userTickets.length > 0 ? (
        <div className="space-y-6">
          {userTickets.map(({ ticket, event }) => (
            event && (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                event={event} 
                showQR={true}
              />
            )
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <TicketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-xl text-foreground">No Tickets Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven't booked any tickets yet. Browse events to get started!
            </p>
            <a 
              href="/events" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Browse Events
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tickets;