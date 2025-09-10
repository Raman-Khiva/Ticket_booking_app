import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { Ticket, Event } from '@/lib/mockData';
import QRCodeDisplay from './QRCodeDisplay';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-success text-success-foreground';
      case 'used':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-card-foreground mb-1">
              {event.title}
            </h3>
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Ticket ID</p>
            <p className="font-mono text-sm">{ticket.id}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-3 text-primary" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-3 text-primary" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-3 text-primary" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-3 text-primary" />
                <span>Purchased: {formatDate(ticket.purchaseDate)}</span>
              </div>
            </div>

            {ticket.checkInTime && (
              <div className="p-3 bg-success/10 rounded-md">
                <p className="text-sm text-success font-medium">
                  Checked in: {new Date(ticket.checkInTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {showQR && (
            <div className="flex justify-center">
              <QRCodeDisplay 
                value={ticket.qrCode} 
                size={150}
                title="Scan for Entry"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;