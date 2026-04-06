import api from './api';
import { FnBMenuItem } from '../types';

export const fnbService = {
  getMenuItems: async (): Promise<FnBMenuItem[]> => {
    try {
      const response = await api.get<FnBMenuItem[]>('/fnb/menu');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch fnb menu", error);
      return [];
    }
  },
  createOrderForBooking: async (bookingId: string, items: { menuItemId: number, quantity: number }[]) => {
    try {
      // Flattens to array of ids as the C# service expects: `List<int> itemIds`
      // Or just send items if the unknown endpoint expects { items }
      const response = await api.post(`/fnb/order`, { bookingId, items });
      return response.data;
    } catch (error) {
      console.error("Failed to create fnb order", error);
      throw error;
    }
  }
};
