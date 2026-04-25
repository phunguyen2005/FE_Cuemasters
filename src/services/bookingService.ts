import api from './api';
import {
  ApiMessageResponse,
  BookingListResponse,
  CategoryAvailability,
  CreateBookingEligibilityResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  RescheduleBookingRequest,
  TableType,
} from '../types';

const createReservationInFlight = new Map<string, Promise<CreateBookingResponse>>();
const createReservationConflictUntil = new Map<string, { message: string; expiresAt: number }>();
const CREATE_RESERVATION_CONFLICT_TTL_MS = 10_000;

const getCreateReservationKey = (data: CreateBookingRequest) =>
  JSON.stringify({
    requestedTableType: data.requestedTableType,
    bookingDate: data.bookingDate,
    startTime: data.startTime,
    endTime: data.endTime,
    method: data.method ?? null,
    fnBOrders: data.fnBOrders ?? [],
  });

const getApiErrorMessage = (error: unknown, fallback: string) => {
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
      fallback
    );
  }

  return fallback;
};

export const bookingService = {
  getCreateBookingEligibility: async (): Promise<CreateBookingEligibilityResponse> => {
    const response = await api.get<{
      CanCreate?: boolean;
      canCreate?: boolean;
      Message?: string;
      message?: string;
    }>('/reservations/can-create');

    return {
      canCreate: response.data.canCreate ?? response.data.CanCreate ?? false,
      message:
        response.data.message ||
        response.data.Message ||
        'Reservation eligibility check failed.',
    };
  },

  createBooking: async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const requestKey = getCreateReservationKey(data);
    const recentConflict = createReservationConflictUntil.get(requestKey);
    const now = Date.now();

    if (recentConflict && recentConflict.expiresAt > now) {
      throw new Error(recentConflict.message);
    }

    if (recentConflict) {
      createReservationConflictUntil.delete(requestKey);
    }

    const existingRequest = createReservationInFlight.get(requestKey);
    if (existingRequest) {
      return existingRequest;
    }

    const request = api
      .post<{ Message?: string; message?: string; ReservationId?: string; reservationId?: string }>(
        '/reservations',
        data,
      )
      .then((response) => ({
        message: response.data.message || response.data.Message || 'Reservation created successfully.',
        reservationId: response.data.reservationId || response.data.ReservationId,
      }))
      .catch((error) => {
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          (error as any).response?.status === 409
        ) {
          createReservationConflictUntil.set(requestKey, {
            message: getApiErrorMessage(error, 'Reservation could not be created.'),
            expiresAt: Date.now() + CREATE_RESERVATION_CONFLICT_TTL_MS,
          });
        }

        throw error;
      })
      .finally(() => {
        createReservationInFlight.delete(requestKey);
      });

    createReservationInFlight.set(requestKey, request);
    return request;
  },

  getCategoryAvailability: async (tableType: TableType, date: string): Promise<CategoryAvailability> => {
    const response = await api.get<CategoryAvailability>('/reservations/category-availability', {
      params: { tableType, date }
    });
    return response.data;
  },
  
  // Keep the richer compatibility list for now because the dedicated reservation
  // endpoint does not yet expose the full history card payload the UI needs.
  getBookings: async (pageNumber = 1, pageSize = 10, status?: string): Promise<BookingListResponse> => {
    const params: Record<string, string | number> = { page: pageNumber, pageSize };
    if (status) params.status = status;
    const response = await api.get<BookingListResponse>('/bookings', { params });
    return response.data;
  },
  
  cancelBooking: async (id: string): Promise<ApiMessageResponse> => {
    const response = await api.put<{ message?: string; Message?: string }>(`/bookings/${id}/cancel`);
    return {
      message: response.data.message || response.data.Message || 'Reservation cancelled. Deposit is non-refundable.',
    };
  },
  
  rescheduleBooking: async (id: string, data: RescheduleBookingRequest): Promise<ApiMessageResponse> => {
    const response = await api.put<{ message?: string; Message?: string }>(`/bookings/${id}/reschedule`, data);
    return {
      message: response.data.message || response.data.Message || 'Booking rescheduled successfully.',
    };
  }
};
