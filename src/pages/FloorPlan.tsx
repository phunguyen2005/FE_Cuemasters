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
  { type: 'Pool', title: 'Pool', desc: 'Ban tieu chuan 9ft cho cac ca choi pho bien.', rate: 80000 },
  { type: 'Snooker', title: 'Snooker', desc: 'Ban full-size danh cho nguoi choi muon trai nghiem chuan giai dau.', rate: 120000 },
  { type: 'Carom', title: 'Carom', desc: 'Ban carom 3 bang danh cho nhung keo danh ky thuat.', rate: 100000 },
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
      : 'Chua chon khung gio';

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
      setBookingError('Vui long chon cac khung gio lien tiep.');
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
      setBookingError('Hay chon loai ban truoc khi dat lich.');
      return;
    }

    if (orderedSelectedSlots.length === 0) {
      setBookingSuccess('');
      setBookingError('Hay chon it nhat mot khung gio trong thanh ben.');
      return;
    }

    if (!isContiguousSelection(orderedSelectedSlots)) {
      setBookingSuccess('');
      setBookingError('Khung gio dat ban phai lien tiep nhau.');
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

      setBookingSuccess(response.message || 'Dat ban thanh cong.');
      clearBooking();
      onNavigate('bookingHistory');
    } catch (error) {
      setBookingError(
        getErrorMessage(error, 'Khong the tao luot dat ngay luc nay. Vui long thu lai.'),
      );
    }
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="floorPlan">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-8 pb-20 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <section>
            <h1 className="mb-4 text-5xl font-extrabold font-headline tracking-tight text-on-background">
              So do san Precision
            </h1>
            <p className="max-w-2xl font-body leading-relaxed text-secondary">
              Chon loai ban truoc, sau do chon ngay va khung gio trong. Ban cu the se duoc nhan
              vien sap xep khi ban den check-in, dung voi luong dat ban theo category cua he
              thong.
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
                        Staff assigns your physical table when you arrive.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:block md:min-w-[180px] md:text-right">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                          Don gia
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
                        {isSelected ? 'Da chon' : 'Chon ban'}
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
              Dat ban nhanh
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
              <strong>He thong dat lich tu dong:</strong> Ban cu the se duoc staff gan khi ban den
              check-in. Coc giu cho co dinh <strong>{formatCurrency(DEPOSIT_AMOUNT)}</strong>.
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="mt-4 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  Ngay choi
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
                        {index === 0 ? 'HOM NAY' : format(date, 'dd MMM').toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  Khung gio
                </label>

                {!selectedCategory ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Chon loai ban de xem lich trong.
                  </div>
                ) : isBookingLoading && !categoryAvailability ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Dang tai khung gio kha dung...
                  </div>
                ) : availabilityError ? (
                  <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
                    {availabilityError}
                  </div>
                ) : !categoryAvailability || categoryAvailability.slots.length === 0 ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Chua co khung gio kha dung cho ngay da chon.
                  </div>
                ) : (
                  <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1">
                    {categoryAvailability.slots.map((slot) => {
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
                  Thoi luong (gio)
                </label>
                <div className="rounded-lg bg-surface-container-lowest p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Khung gio da chon</span>
                    <span className="font-bold">{slotRangeLabel}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-secondary">Tong thoi luong</span>
                    <span className="font-bold">{durationHours.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-end justify-between border-b border-outline-variant/10 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                      Tong thanh toan du kien
                    </p>
                    <p className="text-3xl font-black font-headline text-on-background">
                      {formatCurrency(grandTotal)}
                    </p>
                  </div>
                  <div className="space-y-1 text-right text-[10px] text-secondary">
                    <p>Gio choi: {formatCurrency(totalPrice)}</p>
                    <p className="font-bold text-tertiary">
                      Coc truoc: {formatCurrency(DEPOSIT_AMOUNT)}
                    </p>
                  </div>
                </div>

                <button
                  className="w-full rounded-full billiard-gradient py-5 text-sm font-bold uppercase tracking-widest text-on-primary transition-transform hover:translate-y-[-2px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={!selectedCategory || orderedSelectedSlots.length === 0 || isBookingLoading}
                >
                  {isBookingLoading
                    ? 'Dang tao luot dat...'
                    : `Xac nhan dat ban (Coc ${DEPOSIT_AMOUNT / 1000}K)`}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </CustomerLayout>
  );
}
