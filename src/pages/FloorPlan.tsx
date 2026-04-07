import React, { useEffect, useState } from 'react';
import { addDays, addMinutes, format } from 'date-fns';
import CustomerLayout from '../components/layout/CustomerLayout';
import { useSignalR } from '../hooks/useSignalR';
import { ScreenProps, TableType, CategoryAvailabilitySlot } from '../types';
import { useBookingStore } from '../stores/bookingStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatCurrency';

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

const getSortedSlots = (slots: string[]) =>
  [...slots].sort((left, right) => new Date(`1970-01-01T${left}`).getTime() - new Date(`1970-01-01T${right}`).getTime());

const isContiguousSelection = (slots: string[]) =>
  getSortedSlots(slots).every((slot, index, orderedSlots) => {
    if (index === 0) return true;
    return new Date(`1970-01-01T${slot}`).getTime() - new Date(`1970-01-01T${orderedSlots[index - 1]}`).getTime() === THIRTY_MINUTES_IN_MS;
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

const CATEGORIES: { type: TableType; title: string; desc: string; rate: number; img: string }[] = [
  { type: 'Pool', title: 'Bida lỗ', desc: 'Bàn bida lỗ chuẩn thi đấu 9FT.', rate: 80000, img: 'https://images.unsplash.com/photo-1542382103-ba9c0490b4d9?auto=format&fit=crop&q=80&w=400' },
  { type: 'Snooker', title: 'Snooker', desc: 'Sân chơi đẳng cấp cho người chuyên nghiệp.', rate: 120000, img: 'https://images.unsplash.com/photo-1542382103-ba9c0490b4d9?auto=format&fit=crop&q=80&w=400' },
  { type: 'Carom', title: 'Carom', desc: 'Bàn Carom 3 băng chuẩn quốc tế.', rate: 100000, img: 'https://images.unsplash.com/photo-1542382103-ba9c0490b4d9?auto=format&fit=crop&q=80&w=400' },
];

export default function FloorPlan({ onNavigate }: ScreenProps) {
  const {
    selectedCategory,
    categoryAvailability,
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
  const maxAdvanceDays = user?.membershipTier === 'Gold' ? 3 : user?.membershipTier === 'Silver' ? 1 : 0;
  const availableDates = Array.from({ length: maxAdvanceDays + 1 }, (_, index) => addDays(new Date(), index));
  
  const orderedSelectedSlots = getSortedSlots(selectedSlots);
  const durationHours = orderedSelectedSlots.length * 0.5;
  const selectedCategoryData = CATEGORIES.find(c => c.type === selectedCategory);
  const totalPrice = selectedCategoryData ? durationHours * selectedCategoryData.rate : 0;
  const DEPOSIT_AMOUNT = 50000;
  const grandTotal = totalPrice + DEPOSIT_AMOUNT;
  const slotRangeLabel =
    orderedSelectedSlots.length > 0
      ? `${orderedSelectedSlots[0].slice(0,5)} - ${format(addMinutes(new Date(`1970-01-01T${orderedSelectedSlots[orderedSelectedSlots.length - 1]}`), 30), 'HH:mm')}`
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
    if (slot.available <= 0) {
      return;
    }

    const nextSelectedSlots = selectedSlots.includes(slot.startTime)
      ? selectedSlots.filter((currentSlot) => currentSlot !== slot.startTime)
      : getSortedSlots([...selectedSlots, slot.startTime]);

    if (!isContiguousSelection(nextSelectedSlots)) {
      setBookingError('Vui lòng chọn các khung giờ liền tiếp.');
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
      setBookingError('Khung giờ đặt bàn phải liền tiếp nhau.');
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
        startTime: startSlotStr.slice(0,5),
        endTime: format(endTimeObj, 'HH:mm'),
        fnBOrders: [],
      });

      setBookingSuccess(response.message || 'Đặt bàn thành công.');
      clearBooking();
      onNavigate('bookingHistory');
    } catch (error) {
      setBookingError(getErrorMessage(error, 'Không thể tạo lượt đặt ngay lúc này. Vui lòng thử lại.'));
    }
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="floorPlan">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-8 pb-20 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <section>
            <h1 className="mb-4 text-5xl font-extrabold font-headline tracking-tight text-on-background">Sơ đồ sàn Precision</h1>
            <p className="max-w-xl font-body leading-relaxed text-secondary">
              Chọn không gian bàn yêu thích của bạn. Từ Snooker Olympic đến Carom chuyên nghiệp, mỗi góc độ đều được
              thiết kế cho những cú đánh hoàn hảo. Bàn cụ thể sẽ được ấn định khi bạn đến check-in.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map(category => (
              <button
                key={category.type}
                onClick={() => handleSelectCategory(category.type)}
                className={`group relative text-left rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                  selectedCategory === category.type
                    ? 'border-primary ring-4 ring-primary/20 bg-surface-container-high' 
                    : 'border-transparent bg-surface-container-lowest hover:bg-surface-container-low hover:scale-[1.02]'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img src={category.img} alt={category.title} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold font-headline mb-2">{category.title}</h3>
                  <p className="text-xs text-secondary mb-4 leading-relaxed line-clamp-2">{category.desc}</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(category.rate)}/h</p>
                </div>
                {selectedCategory === category.type && (
                  <div className="absolute top-4 right-4 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">check</span>
                  </div>
                )}
              </button>
            ))}
          </section>
        </div>

        <aside className="space-y-8 lg:col-span-4">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-8 rounded-xl border-t border-white/40 bg-surface-container-low p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
            <h2 className="text-3xl font-extrabold font-headline tracking-tighter">Đặt bàn nhanh</h2>

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
            
            <div className="rounded-2xl border border-tertiary/20 bg-tertiary/5 px-4 py-3 text-sm text-tertiary-dark mt-4">
              <strong>Hệ thống đặt lịch tự động:</strong> Bàn cụ thể sẽ được hệ thống xếp ngẫu nhiên dựa theo khu vực khi bạn đến check-in để đảm bảo trải nghiệm tốt nhất. Phí cọc cố định <strong>{formatCurrency(DEPOSIT_AMOUNT)}</strong>.
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2 mt-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Ngày chơi</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableDates.map((date, index) => {
                    const isSelectedDate = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
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
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Khung giờ</label>
                {!selectedCategory ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Chọn loại bàn để xem lịch trống.
                  </div>
                ) : isBookingLoading && !categoryAvailability ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Đang tải khung giờ khả dụng...
                  </div>
                ) : (
                  <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1">
                    {categoryAvailability?.slots.map((slot) => {
                      const isSelectedSlot = selectedSlots.includes(slot.startTime);
                      const isAvailable = slot.available > 0;
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
                            <span className="absolute -top-1 -right-1 bg-tertiary text-white text-[8px] px-1 rounded-full">{slot.available}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Thời lượng (giờ)</label>
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Tổng thanh toán dự kiến</p>
                    <p className="text-3xl font-black font-headline text-on-background">{formatCurrency(grandTotal)}</p>
                  </div>
                  <div className="text-right text-[10px] text-secondary space-y-1">
                    <p>Giờ chơi: {formatCurrency(totalPrice)}</p>
                    <p className="font-bold text-tertiary">Cọc trước: {formatCurrency(DEPOSIT_AMOUNT)}</p>
                  </div>
                </div>

                <button
                  className="w-full rounded-full billiard-gradient py-5 text-sm font-bold uppercase tracking-widest text-on-primary transition-transform hover:translate-y-[-2px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={!selectedCategory || orderedSelectedSlots.length === 0 || isBookingLoading}
                >
                  {isBookingLoading ? 'Đang tạo lượt đặt...' : `Xác nhận đặt bàn (Cọc ${DEPOSIT_AMOUNT / 1000}K)`}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </CustomerLayout>
  );
}
