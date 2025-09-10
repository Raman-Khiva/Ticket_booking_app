import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { bookTicket, selectIsBooking, selectBookingSuccess } from '@/store/slices/ticketSlice';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { Event } from '@/store/slices/eventSlice';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EventCardProps {
  event: Event;
  showBookButton?: boolean; // Optional prop to control if book button should be shown
}

const EventCard = ({ event, showBookButton = true }: EventCardProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isBookingThisEvent, setIsBookingThisEvent] = useState(false);
  
  // Redux selectors
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isBooking = useAppSelector(selectIsBooking);
  const bookingSuccess = useAppSelector(selectBookingSuccess);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  // Check if event is in the past
  const isEventPast = new Date(event.date) < new Date();
  
  // Check if tickets are sold out
  const isSoldOut = event.available_tickets <= 0;
  
  // Check if low availability (less than 20% or less than 10 tickets)
  const isLowAvailability = !isSoldOut && (
    event.available_tickets < Math.min(event.total_tickets * 0.2, 10)
  );

  // Check if user is the organizer of this event
  const isOrganizer = user?.id === event.organizer_id;

  // Handle booking success
  useEffect(() => {
    if (bookingSuccess && isBookingThisEvent) {
      toast({
        title: "Booking Successful!",
        description: `You've successfully booked a ticket for ${event.title}`,
      });
      setIsBookingThisEvent(false);
    }
  }, [bookingSuccess, isBookingThisEvent, event.title, toast]);

  const handleBookTicket = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to book tickets",
        variant: "destructive"
      });
      return;
    }

    if (isOrganizer) {
      toast({
        title: "Cannot Book Own Event",
        description: "You cannot book tickets for your own event",
        variant: "destructive"
      });
      return;
    }

    if (isSoldOut || isEventPast) {
      return;
    }

    try {
      setIsBookingThisEvent(true);
      await dispatch(bookTicket(event.id)).unwrap();
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: typeof error === 'string' ? error : "Failed to book ticket",
        variant: "destructive"
      });
      setIsBookingThisEvent(false);
    }
  };

  const getEventStatus = () => {
    if (isEventPast) return { text: "Event Ended", variant: "secondary" as const };
    if (isSoldOut) return { text: "Sold Out", variant: "destructive" as const };
    if (isLowAvailability) return { text: "Few Left!", variant: "default" as const };
    return null;
  };

  const eventStatus = getEventStatus();

  const getButtonText = () => {
    if (isEventPast) return "Event Ended";
    if (isSoldOut) return "Sold Out";
    if (isOrganizer) return "Your Event";
    return "Book Ticket";
  };

  const isButtonDisabled = isEventPast || isSoldOut || isOrganizer || (isBooking && isBookingThisEvent);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="p-0">
        <div className="relative">
          {/* Placeholder image - you can add actual image URLs to your Event interface */}
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-primary/40" />
          </div>
          
          {/* Event status badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
              {formatPrice(event.price)}
            </Badge>
          </div>
          
          {eventStatus && (
            <div className="absolute top-3 right-3">
              <Badge variant={eventStatus.variant} className="bg-card/80 backdrop-blur-sm">
                {eventStatus.text}
              </Badge>
            </div>
          )}

          {isOrganizer && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="outline" className="bg-card/80 backdrop-blur-sm">
                Your Event
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{event.available_tickets} / {event.total_tickets} available</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Created {new Date(event.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between gap-4">
        <div className="flex items-center text-lg font-semibold text-primary">
          <DollarSign className="h-5 w-5 mr-1" />
          <span>{formatPrice(event.price)}</span>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          
          {showBookButton && (
            <Button 
              onClick={handleBookTicket}
              disabled={isButtonDisabled}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              {isBooking && isBookingThisEvent ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                getButtonText()
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;