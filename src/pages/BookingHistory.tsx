import React, { useEffect, useState } from 'react';
import CustomerLayout from '../components/layout/CustomerLayout';
import { ScreenProps } from '../types';
import { useBookingStore } from '../stores/bookingStore';

export default function BookingHistory({ onNavigate }: ScreenProps) {
  const { bookings, fetchBookings, isLoading, cancelBooking, totalItems, totalPages } = useBookingStore();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void fetchBookings(currentPage, 10, filter || undefined);
  }, [currentPage, fetchBookings, filter]);

  const handleFilterChange = (nextFilter: string) => {
    setFilter(nextFilter);
    setCurrentPage(1);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lượt đặt bàn này không?')) {
      return;
    }

    await cancelBooking(bookingId);
    void fetchBookings(currentPage, 10, filter || undefined);
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="bookingHistory">
      <div className="px-8 pb-20">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-4xl font-extrabold font-headline tracking-tight">Lịch sử đặt chỗ</h1>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('')}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  filter === ''
                    ? 'rounded-full bg-on-surface text-surface'
                    : 'rounded-full bg-surface-container-low text-secondary hover:bg-surface-container-high'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleFilterChange('Confirmed')}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  filter === 'Confirmed'
                    ? 'rounded-full bg-on-surface text-surface'
                    : 'rounded-full bg-surface-container-low text-secondary hover:bg-surface-container-high'
                }`}
              >
                Sắp tới
              </button>
              <button
                onClick={() => handleFilterChange('Completed')}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  filter === 'Completed'
                    ? 'rounded-full bg-on-surface text-surface'
                    : 'rounded-full bg-surface-container-low text-secondary hover:bg-surface-container-high'
                }`}
              >
                Đã hoàn thành
              </button>
              <button
                onClick={() => handleFilterChange('Cancelled')}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  filter === 'Cancelled'
                    ? 'rounded-full bg-on-surface text-surface'
                    : 'rounded-full bg-surface-container-low text-secondary hover:bg-surface-container-high'
                }`}
              >
                Đã hủy
              </button>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm mã đặt chỗ..."
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none sm:w-64"
              />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center text-secondary">
                Đang tải lịch sử...
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center text-secondary">
                Chưa có dữ liệu đặt chỗ.
              </div>
            ) : (
              bookings.map((booking) => {
                const startTime = new Date(booking.startTime);
                const endTime = new Date(booking.endTime);
                const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                const isActive = booking.status === 'Confirmed' || booking.status === 'Pending';

                return (
                  <div
                    key={booking.id}
                    className={`relative flex flex-col gap-6 overflow-hidden rounded-xl border p-6 md:flex-row md:items-center ${
                      isActive ? 'border-primary/30 bg-surface-container-lowest' : 'border-outline-variant/30 bg-surface-container-lowest'
                    }`}
                  >
                    {isActive && <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary"></div>}
                    {booking.status === 'Cancelled' && <div className="absolute bottom-0 left-0 top-0 w-1 bg-error"></div>}

                    <div className="w-24 flex-shrink-0 text-center md:text-left">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">
                        Tháng {startTime.getMonth() + 1}
                      </p>
                      <p className="text-3xl font-black font-headline text-primary">{startTime.getDate()}</p>
                      <p className="mt-1 text-sm font-bold">
                        {startTime.getHours()}:{startTime.getMinutes().toString().padStart(2, '0')}
                      </p>
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-sm">event_seat</span>
                        <p className="font-headline text-lg font-bold">Bàn {booking.tableName}</p>
                      </div>
                      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-secondary">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          <span>{durationHours} giờ</span>
                        </div>
                        <span>&bull;</span>
                        <span className="font-medium">${booking.totalPrice}</span>
                        <span>&bull;</span>
                        <span className="rounded-sm bg-surface-container-high px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
                          {booking.status === 'Confirmed'
                            ? 'Đã xác nhận'
                            : booking.status === 'Completed'
                              ? 'Hoàn thành'
                              : booking.status === 'Cancelled'
                                ? 'Đã hủy'
                                : booking.status === 'Pending'
                                  ? 'Đang chờ'
                                  : booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 md:w-auto">
                      <button className="rounded-full bg-primary px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-container">
                        Chi tiết
                      </button>
                      {isActive && (
                        <button
                          onClick={() => void handleCancelBooking(booking.id)}
                          className="w-full whitespace-nowrap rounded-full bg-error/10 px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-error transition-colors hover:bg-error/20"
                        >
                          Hủy đặt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-8">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-secondary transition-colors hover:bg-surface-container-high disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-bold text-on-primary">
              {currentPage}
            </button>
            <span className="text-sm text-secondary">
              / {Math.max(totalPages, 1)} • {totalItems} lượt đặt
            </span>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-secondary transition-colors hover:bg-surface-container-high disabled:opacity-50"
              disabled={totalPages <= 0 || currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(Math.max(totalPages, 1), page + 1))}
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
