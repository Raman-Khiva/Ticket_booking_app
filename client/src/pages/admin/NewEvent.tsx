import { useNavigate } from 'react-router-dom';
import EventForm from '@/components/EventForm';
import { Event } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const AdminNewEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (eventData: Partial<Event>) => {
    // In a real app, this would create the event via API
    console.log('Creating event:', eventData);
    
    toast({
      title: "Event Created Successfully!",
      description: `"${eventData.title}" has been created and is now live.`,
    });

    // Redirect to events list
    navigate('/admin/events');
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create your new event
        </p>
      </div>

      <EventForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AdminNewEvent;