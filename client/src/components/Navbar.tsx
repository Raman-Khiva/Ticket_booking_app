import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Settings, 
  Ticket, 
  QrCode, 
  LogOut,
  ChevronDown 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  loadUserFromStorage, 
  logout, 
  selectAuth, 
  selectIsOrganizer 
} from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading } = useSelector(selectAuth);
  const isOrganizer = useSelector(selectIsOrganizer);

  // Load user from localStorage on component mount
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
  };

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

            {isAuthenticated && (
              <Link 
                to="/tickets" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/tickets') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                }`}
              >
                <Ticket className="h-4 w-4" />
                <span>My Tickets</span>
              </Link>
            )}

            {/* Organizer-only navigation */}
            {isAuthenticated && isOrganizer && (
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

            {/* User menu or login button */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role} Account
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  {isOrganizer && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth/login">
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm" disabled={isLoading}>
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - you can implement this later */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;