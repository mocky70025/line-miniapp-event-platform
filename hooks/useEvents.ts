import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

export interface Event {
  id: string;
  organizer_profile_id: string;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  max_stores?: number;
  fee: number;
  category?: string;
  requirements?: string[];
  contact?: string;
  is_public: boolean;
  application_deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface EventApplication {
  id: string;
  event_id: string;
  store_profile_id: string;
  store_name: string;
  contact_name: string;
  phone?: string;
  email?: string;
  product_description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export function usePublishedEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await apiService.getPublishedEvents() as Event[];
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    loading,
    error,
    reload: loadEvents,
  };
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      setError(null);
      const eventData = await apiService.getEventById(eventId) as Event;
      setEvent(eventData);
    } catch (err) {
      console.error('Error loading event:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  return {
    event,
    loading,
    error,
    reload: loadEvent,
  };
}

export function useOrganizerEvents(organizerProfileId: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    if (!organizerProfileId) return;
    
    try {
      setLoading(true);
      setError(null);
      const eventsData = await apiService.getEventsByOrganizer(organizerProfileId) as Event[];
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading organizer events:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<Event>) => {
    try {
      setError(null);
      const newEvent = await apiService.createEvent(eventData) as Event;
      if (newEvent) {
        setEvents(prev => [newEvent, ...prev]);
      }
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      setError(null);
      const updatedEvent = await apiService.updateEvent(eventId, updates) as Event;
      if (updatedEvent) {
        setEvents(prev => prev.map(event => 
          event.id === eventId ? updatedEvent : event
        ));
      }
      return updatedEvent;
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    loadEvents();
  }, [organizerProfileId]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    reload: loadEvents,
  };
}

export function useEventApplications(eventId: string) {
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      setError(null);
      const applicationsData = await apiService.getEventApplications(eventId) as EventApplication[];
      setApplications(applicationsData);
    } catch (err) {
      console.error('Error loading event applications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (applicationId: string, updates: Partial<EventApplication>) => {
    try {
      setError(null);
      const updatedApplication = await apiService.updateEventApplication(applicationId, updates) as EventApplication;
      if (updatedApplication) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? updatedApplication : app
        ));
      }
      return updatedApplication;
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    loadApplications();
  }, [eventId]);

  return {
    applications,
    loading,
    error,
    updateApplication,
    reload: loadApplications,
  };
}

export function useUserEventApplications(storeProfileId: string) {
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    if (!storeProfileId) return;
    
    try {
      setLoading(true);
      setError(null);
      const applicationsData = await apiService.getUserEventApplications(storeProfileId) as EventApplication[];
      setApplications(applicationsData);
    } catch (err) {
      console.error('Error loading user event applications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: Partial<EventApplication>) => {
    try {
      setError(null);
      const newApplication = await apiService.createEventApplication(applicationData) as EventApplication;
      if (newApplication) {
        setApplications(prev => [newApplication, ...prev]);
      }
      return newApplication;
    } catch (err) {
      console.error('Error creating application:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    loadApplications();
  }, [storeProfileId]);

  return {
    applications,
    loading,
    error,
    createApplication,
    reload: loadApplications,
  };
}
