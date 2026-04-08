import { create } from 'zustand';
import { MembershipPlan, UserMembership } from '../types';
import { membershipService } from '../services/membershipService';

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (typeof (error as any).response?.data?.message === 'string' ||
      typeof (error as any).response?.data?.Message === 'string')
  ) {
    return (
      (error as any).response?.data?.message ||
      (error as any).response?.data?.Message ||
      fallbackMessage
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

interface MembershipState {
  plans: MembershipPlan[];
  myMembership: UserMembership | null;
  isLoading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  fetchMyMembership: () => Promise<void>;
  subscribe: (planId: number, autoRenew: boolean) => Promise<UserMembership>;
  cancelAutoRenew: () => Promise<boolean>;
  clearError: () => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  plans: [],
  myMembership: null,
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const plans = await membershipService.getPlans();
      set({ plans });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Khong the tai danh sach goi thanh vien.') });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyMembership: async () => {
    set({ isLoading: true, error: null });
    try {
      const myMembership = await membershipService.getMyMembership();
      set({ myMembership });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Khong the tai goi thanh vien hien tai.') });
    } finally {
      set({ isLoading: false });
    }
  },

  subscribe: async (planId, autoRenew) => {
    set({ isLoading: true, error: null });
    try {
      const myMembership = await membershipService.subscribe({ planId, autoRenew });
      set({ myMembership });
      return myMembership;
    } catch (error) {
      const message = getErrorMessage(error, 'Khong the dang ky goi thanh vien luc nay.');
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelAutoRenew: async () => {
    set({ isLoading: true, error: null });
    try {
      await membershipService.cancelAutoRenew();
      set((state) => ({
        myMembership: state.myMembership ? { ...state.myMembership, autoRenew: false } : null,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error, 'Khong the cap nhat trang thai gia han tu dong.');
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
