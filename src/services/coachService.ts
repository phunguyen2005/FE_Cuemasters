import api from './api';
import { Coach, CoachAvailabilitySlot } from '../types';

export const coachService = {
  getCoaches: async (): Promise<Coach[]> => {
    try {
      const response = await api.get<Coach[]>('/coaches');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch coaches", error);
      return [];
    }
  },
  
  getCoachAvailability: async (coachId: string, date: string): Promise<CoachAvailabilitySlot[]> => {
    try {
      const response = await api.get<CoachAvailabilitySlot[]>(`/coaches/${coachId}/availability`, { params: { date } });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch coach availability", error);
      return [];
    }
  },

  bookCoach: async (payload: {
    tableId: number;
    coachId: string;
    bookingDate: string; // yyyy-MM-dd
    startTime: string;   // HH:mm
    endTime: string;     // HH:mm
  }) => {
    const response = await api.post('/bookings', {
      tableId: payload.tableId,
      bookingDate: payload.bookingDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      coachId: payload.coachId,
      fnBOrders: []
    });
    return response.data;
  }
};
