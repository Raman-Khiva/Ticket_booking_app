import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, Clock, Share2 } from 'lucide-react';
import { mockEvents } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const availableTickets = event.capacity - event.bookedCount;
  const isLowAvailability = availableTickets < event.capacity * 0.2;

  const handleBookTicket = () => {
    toast({
      title: "Ticket Booked Successfully!",
      description: `Your ticket for ${event.title} has been booked.`,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Event link has been copied to clipboard.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Event Header */}
        <div className="mb-8">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
          />
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{event.category}</Badge>
                {isLowAvailability && (
                  <Badge variant="destructive">Few tickets left!</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">About This Event</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Event Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-foreground">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-foreground">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Users className="h-5 w-5 mr-3 text-primary" />
                  <span>{availableTickets} of {event.capacity} tickets available</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <h2 className="text-xl font-semibold">Book Your Ticket</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Price:</span>
                  <div className="flex items-center text-2xl font-bold text-primary">
                    <DollarSign className="h-6 w-6" />
                    <span>{event.price}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tickets Available:</span>
                    <span className={isLowAvailability ? 'text-accent font-medium' : ''}>
                      {availableTickets}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(event.bookedCount / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleBookTicket}
                  className="w-full"
                  size="lg"
                  disabled={availableTickets === 0}
                >
                  {availableTickets === 0 ? 'Sold Out' : 'Book Ticket'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Secure payment • Instant confirmation • QR code delivery
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;