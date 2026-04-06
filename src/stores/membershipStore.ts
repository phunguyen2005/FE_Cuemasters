import { create } from 'zustand';
import { MembershipPlan, UserMembership } from '../types';
import { membershipService } from '../services/membershipService';

interface MembershipState {
  plans: MembershipPlan[];
  myMembership: UserMembership | null;
  isLoading: boolean;
  fetchPlans: () => Promise<void>;
  fetchMyMembership: () => Promise<void>;
  subscribe: (planId: number) => Promise<boolean>;
  cancelAutoRenew: () => Promise<boolean>;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  plans: [],
  myMembership: null,
  isLoading: false,
  
  fetchPlans: async () => {
    set({ isLoading: true });
    try {
      const plans = await membershipService.getPlans();
      set({ plans });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchMyMembership: async () => {
    set({ isLoading: true });
    try {
      const myMembership = await membershipService.getMyMembership();
      set({ myMembership });
    } finally {
      set({ isLoading: false });
    }
  },
  
  subscribe: async (planId) => {
    set({ isLoading: true });
    try {
      const success = await membershipService.subscribe(planId);
      if (success) {
        // Refresh membership
        const myMembership = await membershipService.getMyMembership();
        set({ myMembership });
      }
      return success;
    } finally {
      set({ isLoading: false });
    }
  },
  
  cancelAutoRenew: async () => {
    set({ isLoading: true });
    try {
      const success = await membershipService.cancelAutoRenew();
      if (success) {
        set((state) => ({
          myMembership: state.myMembership ? { ...state.myMembership, autoRenew: false } : null
        }));
      }
      return success;
    } finally {
      set({ isLoading: false });
    }
  }
}));
