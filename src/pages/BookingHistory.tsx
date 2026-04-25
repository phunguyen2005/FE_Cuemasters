import React, { useEffect, useMemo, useState } from 'react';
import CustomerLayout from '../components/layout/CustomerLayout';
import { Booking, ScreenProps, BookingStatus } from '../types';
import { useBookingStore } from '../stores/bookingStore';
import {
  getBookingChannelLabel,
  getBookingStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getTableTypeLabel,
} from '../utils/labels';
import {
  formatScheduledDate,
  formatScheduledDateParts,
  formatScheduledTime,
  formatVietnamDateTime,
} from '../utils/datetime';

const statusFilters: Array<{ value: '' | BookingStatus; label: string }> = [
  { value: '', label: 'Tất cả' },
  { value: 'Confirmed', label: 'Sắp tới' },
  { value: 'InProgress', label: 'Đang chơi' },
  { value: 'Completed', label: 'Đã hoàn tất' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'NoShow', label: 'Không đến' },
];

const formatMoney = (value?: number | null) =>
  (value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const getScheduledDurationHours = (startValue?: string | null, endValue?: string | null) => {
  const startParts = formatScheduledDateParts(startValue);
  const endParts = formatScheduledDateParts(endValue);

  if (!startParts || !endParts) return 0;

  const startTime = new Date(
    startParts.year,
    startParts.month - 1,
    startParts.day,
    startParts.hour,
    startParts.minute,
    startParts.second,
  );
  const endTime = new Date(
    endParts.year,
    endParts.month - 1,
    endParts.day,
    endParts.hour,
    endParts.minute,
    endParts.second,
  );
  return Math.max(0, (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
};

export default function BookingHistory({ onNavigate }: ScreenProps) {
  const { bookings, fetchBookings, isLoading, cancelBooking, totalItems, totalPages } = useBookingStore();
  const [filter, setFilter] = useState<'' | BookingStatus>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [pendingCancelBooking, setPendingCancelBooking] = useState<Booking | null>(null);
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    void fetchBookings(currentPage, 10, filter || undefined);
  }, [currentPage, fetchBookings, filter]);

  const visibleBookings = useMemo(() => bookings, [bookings]);

  const handleFilterChange = (nextFilter: '' | BookingStatus) => {
    setFilter(nextFilter);
    setCurrentPage(1);
    setFeedback(null);
  };

  const handleCancelBooking = async (bookingId: string) => {
    setIsCancelSubmitting(true);
    const result = await cancelBooking(bookingId);
    setIsCancelSubmitting(false);
    setPendingCancelBooking(null);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: result.message || 'Reservation cancelled. Deposit is non-refundable.',
      });
      void fetchBookings(currentPage, 10, filter || undefined);
      return;
    }

    setFeedback({
      type: 'error',
      message: result.message || 'Cannot cancel this booking right now.',
    });
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="bookingHistory">
      <div className="px-8 pb-20">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-3">
            <h1 className="font-headline text-4xl font-extrabold tracking-[-0.05em]">
              Lịch sử đặt chỗ
            </h1>
            <p className="max-w-2xl text-secondary">
              Theo dõi tất cả lượt đặt của bạn, từ lịch sắp tới đến những buổi đã hoàn tất.
            </p>
          </div>

          {feedback && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleFilterChange(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    filter === option.value
                      ? 'bg-on-surface text-surface'
                      : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center text-secondary">
                Đang tải lịch sử đặt chỗ...
              </div>
            ) : visibleBookings.length === 0 ? (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center text-secondary">
                Chưa có lượt đặt chỗ nào.
              </div>
            ) : (
              visibleBookings.map((booking) => {
                const scheduledParts = formatScheduledDateParts(booking.startTime);
                const durationHours = getScheduledDurationHours(booking.startTime, booking.endTime);
                const isActive = booking.status === 'Confirmed' || booking.status === 'InProgress';
                const isExpanded = expandedBookingId === booking.id;
                const canCancel = booking.status === 'Confirmed';

                return (
                  <div
                    key={booking.id}
                    className={`relative overflow-hidden rounded-xl border p-6 ${
                      isActive
                        ? 'border-primary/30 bg-surface-container-lowest'
                        : 'border-outline-variant/30 bg-surface-container-lowest'
                    }`}
                  >
                    {isActive && <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary"></div>}
                    {booking.status === 'Cancelled' && <div className="absolute bottom-0 left-0 top-0 w-1 bg-error"></div>}
                    {booking.status === 'NoShow' && <div className="absolute bottom-0 left-0 top-0 w-1 bg-secondary"></div>}

                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      <div className="w-24 flex-shrink-0 text-center md:text-left">
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">
                          Tháng {scheduledParts?.month ?? '--'}
                        </p>
                        <p className="font-headline text-3xl font-black text-primary">{scheduledParts?.day ?? '--'}</p>
                        <p className="mt-1 text-sm font-bold">
                          {formatScheduledTime(booking.startTime)}
                        </p>
                      </div>

                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="material-symbols-outlined text-sm text-secondary">event_seat</span>
                          <p className="font-headline text-lg font-bold">
                            {booking.tableName
                              ? `Bàn ${booking.tableName}`
                              : `${getTableTypeLabel(booking.requestedTableType)} (xếp bàn khi tới)`}
                          </p>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-secondary">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            <span>{durationHours.toFixed(1)} giờ</span>
                          </div>
                          <span>•</span>
                          <span className="font-medium">{formatMoney(booking.actualCost || booking.totalPrice)}</span>
                          <span>•</span>
                          <span
                            className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                              booking.status === 'NoShow'
                                ? 'bg-secondary/10 text-secondary'
                                : booking.status === 'Cancelled'
                                  ? 'bg-error/10 text-error'
                                  : 'bg-surface-container-high text-secondary'
                            }`}
                          >
                            {getBookingStatusLabel(booking.status)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary">
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          <span>Cọc: {formatMoney(booking.depositAmount)}</span>
                          {(booking.status === 'NoShow' || booking.depositForfeited) && (
                            <span className="font-medium text-error">(Mất cọc)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 md:w-auto">
                        <button
                          onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                          className="rounded-full bg-primary px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-container"
                        >
                          {isExpanded ? 'Ẩn chi tiết' : 'Chi tiết'}
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => setPendingCancelBooking(booking)}
                            className="whitespace-nowrap rounded-full bg-error/10 px-6 py-3 text-center text-xs font-bold uppercase tracking-widest text-error transition-colors hover:bg-error/20"
                          >
                            Hủy đặt chỗ
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 grid gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-secondary md:grid-cols-2">
                        <div>
                          <span className="font-semibold text-on-surface">Kênh đặt chỗ:</span>{' '}
                          {getBookingChannelLabel(booking.bookingType)}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Tạo lúc:</span> {formatVietnamDateTime(booking.createdAt)}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Gán bàn lúc:</span> {formatVietnamDateTime(booking.assignedAt)}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Nhận bàn:</span> {formatVietnamDateTime(booking.checkedInAt)}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Trả bàn:</span> {formatVietnamDateTime(booking.checkedOutAt)}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Huấn luyện viên:</span> {booking.coach?.fullName || 'Không có'}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Trạng thái thanh toán:</span>{' '}
                          {getPaymentStatusLabel(booking.payment?.status)}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Phương thức thanh toán:</span>{' '}
                          {getPaymentMethodLabel(booking.payment?.method)}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Số món F&amp;B:</span> {booking.fnBOrders?.length || 0}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface">Ghi chú:</span> {booking.notes || 'Không có'}
                        </div>
                      </div>
                    )}
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

          {pendingCancelBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-2xl">
                <h2 className="font-headline text-xl font-bold text-on-surface">
                  Xác nhận hủy đặt chỗ
                </h2>
                <p className="mt-3 text-sm leading-6 text-secondary">
                  Hủy đặt chỗ sẽ không được hoàn tiền. Tiếp tục?
                </p>
                <div className="mt-4 rounded-lg border border-outline-variant/30 bg-surface-container-low p-3 text-sm text-secondary">
                  <div className="font-semibold text-on-surface">
                    {pendingCancelBooking.tableName
                      ? `Bàn ${pendingCancelBooking.tableName}`
                      : `${getTableTypeLabel(pendingCancelBooking.requestedTableType)} (xếp bàn khi tới)`}
                  </div>
                  <div>{formatScheduledDate(pendingCancelBooking.startTime)} {formatScheduledTime(pendingCancelBooking.startTime)}</div>
                  <div>Cọc: {formatMoney(pendingCancelBooking.depositAmount)}</div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingCancelBooking(null)}
                    disabled={isCancelSubmitting}
                    className="rounded-full bg-surface-container-high px-5 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-60"
                  >
                    Giữ đặt chỗ
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCancelBooking(pendingCancelBooking.id)}
                    disabled={isCancelSubmitting}
                    className="rounded-full bg-error px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-error/90 disabled:opacity-60"
                  >
                    {isCancelSubmitting ? 'Đang hủy...' : 'Hủy và mất cọc'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
