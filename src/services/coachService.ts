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
  }
};
