import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, User, DollarSign } from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';

interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  qrCode: string;
  status: 'active' | 'used' | 'cancelled';
  price: number;
  createdAt: string;
  checkInTime?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  location: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketCardProps {
  ticket: Ticket;
  event: Event;
  showQR?: boolean;
}

const TicketCard = ({ ticket, event, showQR = true }: TicketCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'used':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'VALID';
      case 'used':
        return 'USED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.toUpperCase();
    }
  };

  const isEventPast = new Date(event.date) < new Date();
  const isEventUpcoming = new Date(event.date) > new Date();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(ticket.status)} variant="outline">
                {getStatusLabel(ticket.status)}
              </Badge>
              {isEventPast && ticket.status === 'active' && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  EVENT ENDED
                </Badge>
              )}
              {isEventUpcoming && ticket.status === 'active' && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  UPCOMING
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Ticket ID</p>
            <p className="font-mono text-sm font-medium">{ticket.id}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                <span>{formatTime(event.date)}</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-3 text-primary flex-shrink-0 mt-0.5" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                <span className="font-medium">${ticket.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>Purchased: {formatDate(ticket.createdAt)}</span>
              </div>
            </div>

            {event.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </div>
            )}

            {ticket.checkInTime && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Checked in: {formatDateTime(ticket.checkInTime)}
                </p>
              </div>
            )}

            {ticket.status === 'used' && !ticket.checkInTime && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600 font-medium">
                  ✓ Ticket has been used
                </p>
              </div>
            )}
          </div>

          {showQR && ticket.status === 'active' && (
            <div className="flex flex-col items-center justify-center">
              <QRCodeDisplay 
                value={ticket.qrCode} 
                size={150}
                title="Scan for Entry"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Present this QR code at the event entrance
              </p>
            </div>
          )}

          {showQR && ticket.status !== 'active' && (
            <div className="flex flex-col items-center justify-center">
              <div className="w-[150px] h-[150px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    {ticket.status === 'used' ? 'Already Used' : 'Not Available'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional event info footer */}
        <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Event ID: {event.id}</span>
            <span>
              {event.availableTickets > 0 
                ? `${event.availableTickets} tickets available`
                : 'Sold out'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;