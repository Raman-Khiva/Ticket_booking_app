import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Ticket, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  selectAuth, 
  updateUser, 
  selectUser 
} from '@/store/slices/authSlice';
import { 
  fetchMyTickets, 
  selectMyTickets, 
  selectTicketsLoading 
} from '@/store/slices/ticketSlice';
import { 
  fetchMyEvents, 
  selectMyEvents 
} from '@/store/slices/eventSlice'; 
import type { AppDispatch } from '@/store/store';

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const { isAuthenticated } = useSelector(selectAuth);
  const myTickets = useSelector(selectMyTickets);
  const myEvents = useSelector(selectMyEvents);
  const ticketsLoading = useSelector(selectTicketsLoading);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const { toast } = useToast();

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  // Fetch user's tickets and events on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchMyTickets());
      if (user.role === 'organizer') {
        dispatch(fetchMyEvents());
      }
    }
  }, [dispatch, isAuthenticated, user]);

  // Redirect if not authenticated (you might want to handle this at route level)
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
            <Link to="/auth/login">
              <Button className="mt-4">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    // Update user in Redux state
    dispatch(updateUser({
      name: formData.name,
      email: formData.email,
    }));
    
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleCancel = () => {
    setFormData({ 
      name: user.name, 
      email: user.email 
    });
    setIsEditing(false);
  };

  // Calculate statistics
  const tickets = myTickets || []; // fallback to empty array

const totalTickets = tickets.length;
const activeTickets = tickets.filter(ticket => ticket.status === 'active').length;
const usedTickets = tickets.filter(ticket => ticket.status === 'used').length;

const totalEvents = user.role === 'organizer' ? (myEvents?.length || 0) : 0;

  // Calculate member since date
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : 'Recently';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={user.role === 'organizer' ? 'default' : 'secondary'}>
                {user.role === 'organizer' ? 'Event Organizer' : 'Event Attendee'}
              </Badge>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{user.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ticket className="h-5 w-5" />
              <span>Account Statistics</span>
              {ticketsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.role === 'organizer' ? (
              // Organizer statistics
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{totalEvents}</div>
                  <div className="text-sm text-muted-foreground">Events Created</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {myEvents.reduce((sum, event) => sum + (event.total_tickets - event.available_tickets), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tickets Sold</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {myEvents.reduce((sum, event) => sum + event.available_tickets, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Available Tickets</div>
                </div>
              </div>
            ) : (
              // Regular user statistics
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{totalTickets}</div>
                  <div className="text-sm text-muted-foreground">Total Tickets</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{activeTickets}</div>
                  <div className="text-sm text-muted-foreground">Active Tickets</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{usedTickets}</div>
                  <div className="text-sm text-muted-foreground">Events Attended</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.role !== 'organizer' && (
              <Link to="/tickets" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Ticket className="h-4 w-4 mr-2" />
                  View My Tickets
                </Button>
              </Link>
            )}
            
            <Link to="/events" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Browse Events
              </Button>
            </Link>
            
            {user.role === 'organizer' && (
              <>
                <Link to="/admin/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Organizer Dashboard
                  </Button>
                </Link>
                <Link to="/admin/events/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;