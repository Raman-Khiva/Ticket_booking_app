export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  category: string;
  image: string;
  organizerId: string;
  bookedCount: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled';
  purchaseDate: string;
  checkInTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer';
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    description: 'Annual technology conference featuring the latest innovations in AI, web development, and digital transformation.',
    date: '2024-04-15',
    time: '09:00',
    location: 'Convention Center, Downtown',
    capacity: 500,
    price: 99,
    category: 'Technology',
    image: '/api/placeholder/400/250',
    organizerId: 'org1',
    bookedCount: 245
  },
  {
    id: '2',
    title: 'Music Festival Summer',
    description: 'Three-day music festival featuring top artists from around the world. Food, drinks, and entertainment included.',
    date: '2024-06-20',
    time: '14:00',
    location: 'Central Park Amphitheater',
    capacity: 2000,
    price: 149,
    category: 'Music',
    image: '/api/placeholder/400/250',
    organizerId: 'org2',
    bookedCount: 1456
  },
  {
    id: '3',
    title: 'Business Summit',
    description: 'Executive summit for business leaders and entrepreneurs. Networking opportunities and keynote speakers.',
    date: '2024-05-10',
    time: '08:30',
    location: 'Hilton Hotel, Conference Room A',
    capacity: 200,
    price: 199,
    category: 'Business',
    image: '/api/placeholder/400/250',
    organizerId: 'org1',
    bookedCount: 89
  },
  {
    id: '4',
    title: 'Art Gallery Opening',
    description: 'Opening night for contemporary art exhibition featuring local and international artists.',
    date: '2024-03-25',
    time: '18:00',
    location: 'Modern Art Gallery',
    capacity: 150,
    price: 25,
    category: 'Art',
    image: '/api/placeholder/400/250',
    organizerId: 'org3',
    bookedCount: 78
  }
];

export const mockTickets: Ticket[] = [
  {
    id: 'ticket1',
    eventId: '1',
    userId: 'user1',
    qrCode: 'TKT001-TECH-2024-USER1',
    status: 'valid',
    purchaseDate: '2024-02-15',
  },
  {
    id: 'ticket2',
    eventId: '2',
    userId: 'user1',
    qrCode: 'TKT002-MUSIC-2024-USER1',
    status: 'valid',
    purchaseDate: '2024-02-20',
  }
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  },
  {
    id: 'org1',
    name: 'EventPro Organizers',
    email: 'contact@eventpro.com',
    role: 'organizer'
  }
];

export const getCurrentUser = (): User => mockUsers[0];
export const isOrganizer = (user: User): boolean => user.role === 'organizer';