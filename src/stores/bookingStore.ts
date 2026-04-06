import { create } from 'zustand';
import { BilliardTable, Booking, CreateBookingRequest, CreateBookingResponse } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingState {
  selectedTable: BilliardTable | null;
  selectedDate: Date;
  selectedSlots: string[];
  bookings: Booking[];
  isLoading: boolean;
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  setSelectedTable: (table: BilliardTable | null) => void;
  setSelectedDate: (date: Date) => void;
  toggleSlot: (slot: string) => void;
  clearBooking: () => void;
  fetchBookings: (page?: number, size?: number, status?: string) => Promise<void>;
  createBooking: (data: CreateBookingRequest) => Promise<CreateBookingResponse>;
  cancelBooking: (id: string) => Promise<boolean>;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedTable: null,
  selectedDate: new Date(),
  selectedSlots: [],
  bookings: [],
  isLoading: false,
  totalItems: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  setSelectedTable: (table) => set({ selectedTable: table, selectedSlots: [] }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedSlots: [] }),
  toggleSlot: (slot) => set((state) => ({
    selectedSlots: state.selectedSlots.includes(slot) 
      ? state.selectedSlots.filter(s => s !== slot)
      : [...state.selectedSlots, slot].sort()
  })),
  clearBooking: () => set({ selectedTable: null, selectedSlots: [] }),
  
  fetchBookings: async (page = 1, size = 10, status) => {
    set({ isLoading: true });
    try {
      const response = await bookingService.getBookings(page, size, status);
      set({ 
        bookings: response.items, 
        totalItems: response.totalItems,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createBooking: async (data) => {
    set({ isLoading: true });
    try {
      return await bookingService.createBooking(data);
    } finally {
      set({ isLoading: false });
    }
  },
  
  cancelBooking: async (id: string) => {
    set({ isLoading: true });
    try {
      const success = await bookingService.cancelBooking(id);
      if (success) {
        set((state) => ({
          bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b)
        }));
      }
      return success;
    } finally {
      set({ isLoading: false });
    }
  }
}));
