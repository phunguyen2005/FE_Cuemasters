import api from './api';
import { MembershipPlan, UserMembership } from '../types';

export const membershipService = {
  getPlans: async (): Promise<MembershipPlan[]> => {
    try {
      const response = await api.get<MembershipPlan[]>('/memberships/plans');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch membership plans", error);
      return [];
    }
  },
  
  getMyMembership: async (): Promise<UserMembership | null> => {
    try {
      const response = await api.get<UserMembership>('/memberships/my');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  subscribe: async (planId: number): Promise<boolean> => {
    try {
      const response = await api.post('/memberships/subscribe', { planId });
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error("Failed to subscribe", error);
      throw error;
    }
  },
  
  cancelAutoRenew: async (): Promise<boolean> => {
    try {
      const response = await api.put('/memberships/my/cancel');
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error("Failed to cancel auto renew", error);
      throw error;
    }
  }
};
