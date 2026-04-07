import React, { useEffect, useState } from 'react';
import CustomerLayout from '../components/layout/CustomerLayout';
import { Booking, ScreenProps } from '../types';
import { useBookingStore } from '../stores/bookingStore';
import { bookingService } from '../services/bookingService';

export default function BookingHistory({ onNavigate }: ScreenProps) {
  const { bookings, fetchBookings, isLoading, cancelBooking, totalItems, totalPages } = useBookingStore();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [targetBooking, setTargetBooking] = useState<Booking | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

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

  const formatDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeInput = (date: Date) => {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const openRescheduleModal = (booking: Booking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    setTargetBooking(booking);
    setRescheduleDate(formatDateInput(start));
    setRescheduleStartTime(formatTimeInput(start));
    setRescheduleEndTime(formatTimeInput(end));
    setIsRescheduleOpen(true);
  };

  const closeRescheduleModal = () => {
    setIsRescheduleOpen(false);
    setTargetBooking(null);
  };

  const isHalfHourStep = (time: string) => {
    const minute = Number(time.split(':')[1]);
    return minute === 0 || minute === 30;
  };

  const handleRescheduleSubmit = async () => {
    if (!targetBooking) {
      return;
    }

    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) {
      alert('Vui lòng nhập đầy đủ ngày và khung giờ mới.');
      return;
    }

    if (rescheduleStartTime >= rescheduleEndTime) {
      alert('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    if (!isHalfHourStep(rescheduleStartTime) || !isHalfHourStep(rescheduleEndTime)) {
      alert('Khung giờ đổi lịch phải theo bước 30 phút (VD: 09:00, 09:30).');
      return;
    }

    const payload = {
      newStartTime: `${rescheduleDate}T${rescheduleStartTime}:00`,
      newEndTime: `${rescheduleDate}T${rescheduleEndTime}:00`,
    };

    setIsRescheduling(true);
    try {
      await bookingService.rescheduleBooking(targetBooking.id, payload);
      alert('Đổi lịch thành công.');
      closeRescheduleModal();
      await fetchBookings(currentPage, 10, filter || undefined);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.Message || 'Đổi lịch thất bại.';
      alert(message);
    } finally {
      setIsRescheduling(false);
    }
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
                const canReschedule = startTime.getTime() - Date.now() >= 2 * 60 * 60 * 1000;

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
                          onClick={() => openRescheduleModal(booking)}
                          disabled={!canReschedule}
                          className="w-full whitespace-nowrap rounded-full bg-secondary/10 px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Đổi lịch
                        </button>
                      )}
                      {isActive && (
                        <button
                          onClick={() => void handleCancelBooking(booking.id)}
                          className="w-full whitespace-nowrap rounded-full bg-error/10 px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-error transition-colors hover:bg-error/20"
                        >
                          Hủy đặt
                        </button>
                      )}
                      {isActive && !canReschedule && (
                        <p className="text-center text-xs text-secondary">Chỉ đổi lịch trước tối thiểu 2 giờ.</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {isRescheduleOpen && targetBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-2xl">
                <h2 className="text-xl font-bold font-headline">Đổi lịch đặt bàn</h2>
                <p className="mt-1 text-sm text-secondary">Bàn {targetBooking.tableName}</p>

                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-semibold text-on-surface">
                    Ngày mới
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-sm font-semibold text-on-surface">
                      Giờ bắt đầu
                      <input
                        type="time"
                        step={1800}
                        value={rescheduleStartTime}
                        onChange={(e) => setRescheduleStartTime(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-on-surface">
                      Giờ kết thúc
                      <input
                        type="time"
                        step={1800}
                        value={rescheduleEndTime}
                        onChange={(e) => setRescheduleEndTime(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeRescheduleModal}
                    className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-bold text-secondary transition-colors hover:bg-surface-container-high"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRescheduleSubmit()}
                    disabled={isRescheduling}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRescheduling ? 'Đang xử lý...' : 'Xác nhận đổi lịch'}
                  </button>
                </div>
              </div>
            </div>
          )}

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
