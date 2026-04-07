import api from './api';
import { Booking, BookingListResponse, CreateBookingRequest, CreateBookingResponse, CategoryAvailability, TableType } from '../types';

export const bookingService = {
  createBooking: async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await api.post<CreateBookingResponse>('/bookings', data);
    return response.data;
  },

  getCategoryAvailability: async (tableType: TableType, date: string): Promise<CategoryAvailability> => {
    const response = await api.get<CategoryAvailability>('/bookings/category-availability', {
      params: { tableType, date }
    });
    return response.data;
  },
  
  getBookings: async (pageNumber = 1, pageSize = 10, status?: string): Promise<BookingListResponse> => {
    const params: Record<string, string | number> = { page: pageNumber, pageSize };
    if (status) params.status = status;
    const response = await api.get<BookingListResponse>('/bookings', { params });
    return response.data;
  },
  
  cancelBooking: async (id: string): Promise<boolean> => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.status === 200 || response.status === 204;
  },
  
  rescheduleBooking: async (id: string, data: any): Promise<Booking> => {
    const response = await api.put<Booking>(`/bookings/${id}/reschedule`, data);
    return response.data;
  }
};
