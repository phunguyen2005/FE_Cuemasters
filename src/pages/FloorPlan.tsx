import React, { useEffect, useState } from 'react';
import { addDays, addMinutes, format } from 'date-fns';
import CustomerLayout from '../components/layout/CustomerLayout';
import { useSignalR } from '../hooks/useSignalR';
import { CategoryAvailabilitySlot, ScreenProps, TableType } from '../types';
import { useBookingStore } from '../stores/bookingStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatCurrency';

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;
const DEPOSIT_AMOUNT = 50000;

const CATEGORIES: { type: TableType; title: string; desc: string; rate: number }[] = [
  { type: 'Pool', title: 'Pool', desc: 'Bàn tiêu chuẩn 9ft cho các ca chơi phổ biến.', rate: 80000 },
  { type: 'Snooker', title: 'Snooker', desc: 'Bàn full-size dành cho người chơi muốn trải nghiệm chuẩn giải đấu.', rate: 120000 },
  { type: 'Carom', title: 'Carom', desc: 'Bàn carom 3 băng dành cho những kèo đánh kỹ thuật.', rate: 100000 },
];

const getSortedSlots = (slots: string[]) =>
  [...slots].sort(
    (left, right) =>
      new Date(`1970-01-01T${left}`).getTime() - new Date(`1970-01-01T${right}`).getTime(),
  );

const isContiguousSelection = (slots: string[]) =>
  getSortedSlots(slots).every((slot, index, orderedSlots) => {
    if (index === 0) return true;

    return (
      new Date(`1970-01-01T${slot}`).getTime() -
        new Date(`1970-01-01T${orderedSlots[index - 1]}`).getTime() ===
      THIRTY_MINUTES_IN_MS
    );
  });

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

export default function FloorPlan({ onNavigate }: ScreenProps) {
  const {
    selectedCategory,
    categoryAvailability,
    availabilityError,
    selectedDate,
    selectedSlots,
    isLoading: isBookingLoading,
    setSelectedCategory,
    setSelectedDate,
    toggleSlot,
    clearBooking,
    createBooking,
    fetchCategoryAvailability,
  } = useBookingStore();

  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  useSignalR();

  useEffect(() => {
    if (selectedCategory && selectedDate) {
      void fetchCategoryAvailability(selectedCategory, selectedDate);
    }
  }, [selectedCategory, selectedDate, fetchCategoryAvailability]);

  const { user } = useAuthStore();
  const maxAdvanceDays =
    user?.membershipTier === 'Gold' ? 3 : user?.membershipTier === 'Silver' ? 1 : 0;
  const availableDates = Array.from({ length: maxAdvanceDays + 1 }, (_, index) =>
    addDays(new Date(), index),
  );

  const orderedSelectedSlots = getSortedSlots(selectedSlots);
  const durationHours = orderedSelectedSlots.length * 0.5;
  const selectedCategoryData = CATEGORIES.find((category) => category.type === selectedCategory);
  const totalPrice = selectedCategoryData ? durationHours * selectedCategoryData.rate : 0;
  const grandTotal = totalPrice + DEPOSIT_AMOUNT;
  const slotRangeLabel =
    orderedSelectedSlots.length > 0
      ? `${orderedSelectedSlots[0].slice(0, 5)} - ${format(
          addMinutes(
            new Date(`1970-01-01T${orderedSelectedSlots[orderedSelectedSlots.length - 1]}`),
            30,
          ),
          'HH:mm',
        )}`
      : 'Chưa chọn khung giờ';

  const handleSelectCategory = (type: TableType) => {
    setBookingError('');
    setBookingSuccess('');
    setSelectedCategory(type);
  };

  const handleSelectDate = (date: Date) => {
    setBookingError('');
    setBookingSuccess('');
    setSelectedDate(date);
  };

  const handleSlotToggle = (slot: CategoryAvailabilitySlot) => {
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    let isPast = false;
    
    if (isToday) {
      const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
      const now = new Date();
      if (
        slotHour < now.getHours() ||
        (slotHour === now.getHours() && slotMinute <= now.getMinutes())
      ) {
        isPast = true;
      }
    }

    if (slot.available <= 0 || isPast) {
      return;
    }

    const nextSelectedSlots = selectedSlots.includes(slot.startTime)
      ? selectedSlots.filter((currentSlot) => currentSlot !== slot.startTime)
      : getSortedSlots([...selectedSlots, slot.startTime]);

    if (!isContiguousSelection(nextSelectedSlots)) {
      setBookingError('Vui lòng chọn các khung giờ liên tiếp.');
      return;
    }

    setBookingError('');
    setBookingSuccess('');
    toggleSlot(slot.startTime);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCategory) {
      setBookingSuccess('');
      setBookingError('Hãy chọn loại bàn trước khi đặt lịch.');
      return;
    }

    if (orderedSelectedSlots.length === 0) {
      setBookingSuccess('');
      setBookingError('Hãy chọn ít nhất một khung giờ trong thanh bên.');
      return;
    }

    if (!isContiguousSelection(orderedSelectedSlots)) {
      setBookingSuccess('');
      setBookingError('Khung giờ đặt bàn phải liên tiếp nhau.');
      return;
    }

    const startSlotStr = orderedSelectedSlots[0];
    const endSlotStr = orderedSelectedSlots[orderedSelectedSlots.length - 1];
    const endTimeObj = addMinutes(new Date(`1970-01-01T${endSlotStr}`), 30);

    setBookingError('');
    setBookingSuccess('');

    try {
      const response = await createBooking({
        requestedTableType: selectedCategory,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: startSlotStr.slice(0, 5),
        endTime: format(endTimeObj, 'HH:mm'),
        fnBOrders: [],
      });

      setBookingSuccess(response.message || 'Đặt bàn thành công.');
      clearBooking();
      onNavigate('bookingHistory');
    } catch (error) {
      setBookingError(
        getErrorMessage(error, 'Không thể tạo lượt đặt ngay lúc này. Vui lòng thử lại.'),
      );
    }
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="floorPlan">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-8 pb-20 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <section>
            <h1 className="mb-4 text-5xl font-extrabold font-headline tracking-tight text-on-background">
              Sơ đồ sân Precision
            </h1>
            <p className="max-w-2xl font-body leading-relaxed text-secondary">
              Chọn loại bàn trước, sau đó chọn ngày và khung giờ trống. Bàn cụ thể sẽ được nhân
              viên sắp xếp khi bạn đến check-in, đúng với lượng đặt bàn theo category của hệ
              thống.
            </p>
          </section>

          <section className="space-y-4">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.type;

              return (
                <button
                  key={category.type}
                  type="button"
                  onClick={() => handleSelectCategory(category.type)}
                  className={`w-full rounded-2xl border px-5 py-5 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-surface-container-high shadow-[0_12px_32px_-24px_rgba(0,0,0,0.45)]'
                      : 'border-outline-variant/40 bg-surface-container-lowest hover:border-primary/30 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                            isSelected
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-high text-primary'
                          }`}
                        >
                          {category.type.slice(0, 1)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold font-headline">{category.title}</h3>
                          <p className="max-w-2xl text-sm leading-relaxed text-secondary">
                            {category.desc}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-secondary">
                        Nhân viên sẽ sắp xếp bàn cụ thể khi bạn đến.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:block md:min-w-[180px] md:text-right">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                          Đơn giá
                        </p>
                        <p className="text-xl font-black text-primary">
                          {formatCurrency(category.rate)}/h
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${
                          isSelected
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high text-secondary'
                        }`}
                      >
                        {isSelected ? 'Đã chọn' : 'Chọn bàn'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        </div>

        <aside className="space-y-8 lg:col-span-4">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-8 rounded-xl border-t border-white/40 bg-surface-container-low p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
            <h2 className="text-3xl font-extrabold font-headline tracking-tighter">
              Đặt bàn nhanh
            </h2>

            {bookingError && (
              <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {bookingSuccess}
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-tertiary/20 bg-tertiary/5 px-4 py-3 text-sm text-tertiary-dark">
              <strong>Hệ thống đặt lịch tự động:</strong> Bàn cụ thể sẽ được staff gắn khi bạn đến
              check-in. Cọc giữ chỗ cố định <strong>{formatCurrency(DEPOSIT_AMOUNT)}</strong>.
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="mt-4 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  Ngày chơi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableDates.map((date, index) => {
                    const isSelectedDate =
                      format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

                    return (
                      <button
                        key={format(date, 'yyyy-MM-dd')}
                        type="button"
                        onClick={() => handleSelectDate(date)}
                        className={`rounded-lg py-3 text-xs font-bold transition-colors ${
                          isSelectedDate
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {index === 0 ? 'HÔM NAY' : format(date, 'dd MMM').toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  Khung giờ
                </label>

                {!selectedCategory ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Chọn loại bàn để xem lịch trống.
                  </div>
                ) : isBookingLoading && !categoryAvailability ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Đang tải khung giờ khả dụng...
                  </div>
                ) : availabilityError ? (
                  <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
                    {availabilityError}
                  </div>
                ) : !categoryAvailability || categoryAvailability.slots.length === 0 ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Chưa có khung giờ khả dụng cho ngày đã chọn.
                  </div>
                ) : (
                  <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1">
                    {categoryAvailability.slots.map((slot) => {
                      const isSelectedSlot = selectedSlots.includes(slot.startTime);
                      let isAvailable = slot.available > 0;
                      
                      const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      if (isToday) {
                        const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
                        const now = new Date();
                        if (
                          slotHour < now.getHours() ||
                          (slotHour === now.getHours() && slotMinute <= now.getMinutes())
                        ) {
                          isAvailable = false;
                        }
                      }

                      const slotLabel = slot.startTime.slice(0, 5);

                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => handleSlotToggle(slot)}
                          className={`group relative rounded py-2 text-xs font-medium transition-colors ${
                            isSelectedSlot
                              ? 'border border-primary bg-primary text-on-primary'
                              : isAvailable
                                ? 'border border-transparent bg-surface-container-lowest text-on-surface hover:border-primary/20'
                                : 'cursor-not-allowed bg-secondary/10 text-secondary line-through'
                          }`}
                        >
                          {slotLabel}
                          {isAvailable && !isSelectedSlot && (
                            <span className="absolute -right-1 -top-1 rounded-full bg-tertiary px-1 text-[8px] text-white">
                              {slot.available}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  Thời lượng (giờ)
                </label>
                <div className="rounded-lg bg-surface-container-lowest p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Khung giờ đã chọn</span>
                    <span className="font-bold">{slotRangeLabel}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-secondary">Tổng thời lượng</span>
                    <span className="font-bold">{durationHours.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-end justify-between border-b border-outline-variant/10 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                      Tổng thanh toán dự kiến
                    </p>
                    <p className="text-3xl font-black font-headline text-on-background">
                      {formatCurrency(grandTotal)}
                    </p>
                  </div>
                  <div className="space-y-1 text-right text-[10px] text-secondary">
                    <p>Giờ chơi: {formatCurrency(totalPrice)}</p>
                    <p className="font-bold text-tertiary">
                      Cọc trước: {formatCurrency(DEPOSIT_AMOUNT)}
                    </p>
                  </div>
                </div>

                <button
                  className="w-full rounded-full billiard-gradient py-5 text-sm font-bold uppercase tracking-widest text-on-primary transition-transform hover:translate-y-[-2px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={!selectedCategory || orderedSelectedSlots.length === 0 || isBookingLoading}
                >
                  {isBookingLoading
                    ? 'Đang tạo lượt đặt...'
                    : `Xác nhận đặt bàn (Cọc ${DEPOSIT_AMOUNT / 1000}K)`}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </CustomerLayout>
  );
}
