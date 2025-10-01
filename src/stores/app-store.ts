import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { Seminar, Attendee, SeminarFormValues, AttendeeFormValues, BulkAttendee } from '@shared/types';
import { formatISO } from 'date-fns';
type AppState = {
  seminars: Seminar[];
  attendeesBySeminar: Record<string, Attendee[]>;
  seminarsLoading: boolean;
  attendeesLoading: Record<string, boolean>;
  error: string | null;
};
type AppActions = {
  fetchSeminars: () => Promise<Seminar[]>;
  createSeminar: (data: SeminarFormValues) => Promise<Seminar | undefined>;
  updateSeminar: (id: string, data: SeminarFormValues) => Promise<Seminar | undefined>;
  deleteSeminar: (id: string) => Promise<void>;
  fetchAttendees: (seminarId: string) => Promise<void>;
  createAttendee: (data: AttendeeFormValues) => Promise<Attendee | undefined>;
  updateAttendee: (id: string, data: AttendeeFormValues) => Promise<Attendee | undefined>;
  deleteAttendee: (attendee: Attendee) => Promise<void>;
  bulkCreateAttendees: (seminarId: string, attendees: BulkAttendee[]) => Promise<Attendee[] | undefined>;
  checkInAttendee: (attendeeId: string) => Promise<Attendee | undefined>;
};
export const useAppStore = create<AppState & AppActions>()(
  immer((set, get) => ({
    seminars: [],
    attendeesBySeminar: {},
    seminarsLoading: false,
    attendeesLoading: {},
    error: null,
    fetchSeminars: async () => {
      set({ seminarsLoading: true, error: null });
      try {
        const seminars = await api<Seminar[]>('/api/seminars');
        set({ seminars, seminarsLoading: false });
        return seminars;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch seminars';
        set({ error: errorMessage, seminarsLoading: false });
        return [];
      }
    },
    createSeminar: async (data) => {
      try {
        const payload = {
          ...data,
          startDate: formatISO(data.startDate),
          endDate: formatISO(data.endDate),
        };
        const newSeminar = await api<Seminar>('/api/seminars', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        set((state) => {
          state.seminars.push(newSeminar);
        });
        return newSeminar;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create seminar';
        set({ error: errorMessage });
        return undefined;
      }
    },
    updateSeminar: async (id, data) => {
      try {
        const payload = {
          ...data,
          startDate: formatISO(data.startDate),
          endDate: formatISO(data.endDate),
        };
        const updatedSeminar = await api<Seminar>(`/api/seminars/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        set((state) => {
          const index = state.seminars.findIndex((s) => s.id === id);
          if (index !== -1) {
            state.seminars[index] = updatedSeminar;
          }
        });
        return updatedSeminar;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update seminar';
        set({ error: errorMessage });
        return undefined;
      }
    },
    deleteSeminar: async (id: string) => {
      try {
        await api<{ id: string }>(`/api/seminars/${id}`, { method: 'DELETE' });
        set((state) => {
          state.seminars = state.seminars.filter((s) => s.id !== id);
          delete state.attendeesBySeminar[id];
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete seminar';
        set({ error: errorMessage });
      }
    },
    fetchAttendees: async (seminarId: string) => {
      if (get().attendeesBySeminar[seminarId] || get().attendeesLoading[seminarId]) return;
      set(state => { state.attendeesLoading[seminarId] = true; state.error = null; });
      try {
        const attendees = await api<Attendee[]>(`/api/seminars/${seminarId}/attendees`);
        set((state) => {
          state.attendeesBySeminar[seminarId] = attendees;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendees';
        set({ error: errorMessage });
      } finally {
        set(state => { state.attendeesLoading[seminarId] = false; });
      }
    },
    createAttendee: async (data) => {
      try {
        const newAttendee = await api<Attendee>('/api/attendees', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        set(state => {
          if (!state.attendeesBySeminar[data.seminarId]) {
            state.attendeesBySeminar[data.seminarId] = [];
          }
          state.attendeesBySeminar[data.seminarId].push(newAttendee);
        });
        return newAttendee;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create attendee';
        set({ error: errorMessage });
        return undefined;
      }
    },
    updateAttendee: async (id, data) => {
      try {
        const updatedAttendee = await api<Attendee>(`/api/attendees/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        set(state => {
          const seminarAttendees = state.attendeesBySeminar[data.seminarId];
          if (seminarAttendees) {
            const index = seminarAttendees.findIndex(a => a.id === id);
            if (index !== -1) {
              seminarAttendees[index] = updatedAttendee;
            }
          }
        });
        return updatedAttendee;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update attendee';
        set({ error: errorMessage });
        return undefined;
      }
    },
    deleteAttendee: async (attendee) => {
      try {
        await api<{ id: string }>(`/api/attendees/${attendee.id}`, { method: 'DELETE' });
        set(state => {
          const seminarAttendees = state.attendeesBySeminar[attendee.seminarId];
          if (seminarAttendees) {
            state.attendeesBySeminar[attendee.seminarId] = seminarAttendees.filter(a => a.id !== attendee.id);
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete attendee';
        set({ error: errorMessage });
      }
    },
    bulkCreateAttendees: async (seminarId, attendees) => {
      try {
        const newAttendees = await api<Attendee[]>('/api/attendees/bulk', {
          method: 'POST',
          body: JSON.stringify({ seminarId, attendees }),
        });
        set(state => {
          if (!state.attendeesBySeminar[seminarId]) {
            state.attendeesBySeminar[seminarId] = [];
          }
          state.attendeesBySeminar[seminarId].push(...newAttendees);
        });
        return newAttendees;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to bulk create attendees';
        set({ error: errorMessage });
        return undefined;
      }
    },
    checkInAttendee: async (attendeeId: string) => {
      try {
        const updatedAttendee = await api<Attendee>(`/api/attendees/${attendeeId}/checkin`, {
          method: 'POST',
        });
        set((state) => {
          const seminarAttendees = state.attendeesBySeminar[updatedAttendee.seminarId];
          if (seminarAttendees) {
            const index = seminarAttendees.findIndex((a) => a.id === attendeeId);
            if (index !== -1) {
              seminarAttendees[index] = updatedAttendee;
            }
          }
        });
        return updatedAttendee;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to check in attendee';
        set({ error: errorMessage });
        return undefined;
      }
    },
  }))
);