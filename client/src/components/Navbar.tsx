import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, User, Settings, Ticket, QrCode } from 'lucide-react';
import { getCurrentUser, isOrganizer } from '@/lib/mockData';

const Navbar = () => {
  const location = useLocation();
  const user = getCurrentUser();
  const userIsOrganizer = isOrganizer(user);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">EventTix</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/events" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/events') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </Link>

            <Link 
              to="/tickets" 
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/tickets') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
              }`}
            >
              <Ticket className="h-4 w-4" />
              <span>My Tickets</span>
            </Link>

            {userIsOrganizer && (
              <>
                <Link 
                  to="/admin/dashboard" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/admin/dashboard') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link 
                  to="/admin/checkin" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    isActive('/admin/checkin') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span>Check-in</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;