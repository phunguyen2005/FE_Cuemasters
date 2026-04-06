import { create } from 'zustand';
import { Coach, CoachAvailabilitySlot } from '../types';
import { coachService } from '../services/coachService';

interface CoachState {
  coaches: Coach[];
  selectedCoach: Coach | null;
  availability: CoachAvailabilitySlot[];
  isLoading: boolean;
  fetchCoaches: () => Promise<void>;
  setSelectedCoach: (coach: Coach | null) => void;
  fetchAvailability: (coachId: string, date: string) => Promise<void>;
}

export const useCoachStore = create<CoachState>((set) => ({
  coaches: [],
  selectedCoach: null,
  availability: [],
  isLoading: false,
  
  fetchCoaches: async () => {
    set({ isLoading: true });
    try {
      const coaches = await coachService.getCoaches();
      set({ coaches });
    } finally {
      set({ isLoading: false });
    }
  },
  
  setSelectedCoach: (coach) => set({ selectedCoach: coach, availability: [] }),
  
  fetchAvailability: async (coachId, date) => {
    set({ isLoading: true });
    try {
      const availability = await coachService.getCoachAvailability(coachId, date);
      set({ availability });
    } finally {
      set({ isLoading: false });
    }
  }
}));
