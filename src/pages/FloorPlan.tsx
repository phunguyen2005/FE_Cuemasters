import React, { useEffect, useState } from 'react';
import { addDays, addMinutes, format } from 'date-fns';
import CustomerLayout from '../components/layout/CustomerLayout';
import { useSignalR } from '../hooks/useSignalR';
import { tableService } from '../services/tableService';
import { ScreenProps, TableAvailabilitySlot } from '../types';
import { useBookingStore } from '../stores/bookingStore';
import { useFnBStore } from '../stores/fnbStore';
import { useTableStore } from '../stores/tableStore';

const DEFAULT_MENU_IMAGE =
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=400&q=80';
const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

const getSortedSlots = (slots: string[]) =>
  [...slots].sort((left, right) => new Date(left).getTime() - new Date(right).getTime());

const isContiguousSelection = (slots: string[]) =>
  getSortedSlots(slots).every((slot, index, orderedSlots) => {
    if (index === 0) {
      return true;
    }

    return new Date(slot).getTime() - new Date(orderedSlots[index - 1]).getTime() === THIRTY_MINUTES_IN_MS;
  });

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export default function FloorPlan({ onNavigate }: ScreenProps) {
  const { tables, isLoading: isTableLoading, fetchTables } = useTableStore();
  const {
    menuItems,
    cart,
    isLoading: isMenuLoading,
    fetchMenuItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useFnBStore();
  const {
    selectedTable,
    selectedDate,
    selectedSlots,
    isLoading: isBookingLoading,
    setSelectedTable,
    setSelectedDate,
    toggleSlot,
    clearBooking,
    createBooking,
  } = useBookingStore();

  const [availabilitySlots, setAvailabilitySlots] = useState<TableAvailabilitySlot[]>([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const getTableStatusLabel = (status: string) => {
    if (status === 'Available') {
      return 'Sẵn sàng';
    }

    if (status === 'Maintenance') {
      return 'Bảo trì';
    }

    if (status === 'Booked') {
      return 'Đã đặt';
    }

    if (status === 'InUse') {
      return 'Đang sử dụng';
    }

    return status;
  };

  const getTableTypeLabel = (type: string) => {
    if (type === 'Pool') {
      return 'Bida lỗ';
    }

    return type;
  };

  useSignalR();

  useEffect(() => {
    void fetchTables();
    void fetchMenuItems();
  }, [fetchMenuItems, fetchTables]);

  useEffect(() => {
    let isActive = true;

    const loadAvailability = async () => {
      if (!selectedTable) {
        setAvailabilitySlots([]);
        return;
      }

      setIsAvailabilityLoading(true);

      const slots = await tableService.getTableAvailability(selectedTable.id, format(selectedDate, 'yyyy-MM-dd'));

      if (!isActive) {
        return;
      }

      setAvailabilitySlots(slots);
      setIsAvailabilityLoading(false);
    };

    void loadAvailability();

    return () => {
      isActive = false;
    };
  }, [selectedDate, selectedTable]);

  const availableDates = Array.from({ length: 4 }, (_, index) => addDays(new Date(), index));
  const orderedSelectedSlots = getSortedSlots(selectedSlots);
  const durationHours = orderedSelectedSlots.length * 0.5;
  const totalPrice = selectedTable ? durationHours * selectedTable.hourlyRate : 0;
  const cartTotal = cart.reduce((sum, entry) => sum + entry.quantity * entry.item.price, 0);
  const grandTotal = totalPrice + cartTotal;
  const slotRangeLabel =
    orderedSelectedSlots.length > 0
      ? `${format(new Date(orderedSelectedSlots[0]), 'HH:mm')} - ${format(addMinutes(new Date(orderedSelectedSlots[orderedSelectedSlots.length - 1]), 30), 'HH:mm')}`
      : 'Chưa chọn khung giờ';

  const poolTables = tables.filter((table) => table.type === 'Pool');
  const otherTables = tables.filter((table) => table.type !== 'Pool');
  const featuredMenuItems = menuItems.slice(0, 4);

  const handleSelectTable = (tableId: number) => {
    const table = tables.find((item) => item.id === tableId);

    if (!table || table.status === 'Maintenance') {
      return;
    }

    setBookingError('');
    setBookingSuccess('');
    setSelectedTable(table);
  };

  const handleSelectDate = (date: Date) => {
    setBookingError('');
    setBookingSuccess('');
    setSelectedDate(date);
  };

  const handleSlotToggle = (slot: TableAvailabilitySlot) => {
    if (!slot.isAvailable) {
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

    if (!selectedTable) {
      setBookingSuccess('');
      setBookingError('Hãy chọn bàn trước khi đặt lịch.');
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

    const startSlot = new Date(orderedSelectedSlots[0]);
    const endSlot = addMinutes(new Date(orderedSelectedSlots[orderedSelectedSlots.length - 1]), 30);

    setBookingError('');
    setBookingSuccess('');

    try {
      const response = await createBooking({
        tableId: selectedTable.id,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: format(startSlot, 'HH:mm'),
        endTime: format(endSlot, 'HH:mm'),
        fnBOrders: cart.map(({ menuItemId, quantity }) => ({
          menuItemId,
          quantity,
        })),
      });

      setBookingSuccess(response.message || 'Đặt bàn thành công.');
      clearBooking();
      clearCart();
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
              thiết kế cho những cú đánh hoàn hảo.
            </p>
          </section>

          <section className="flex flex-wrap gap-8 rounded-xl bg-surface-container-low px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-tertiary shadow-[0_0_8px_rgba(0,104,93,0.3)]"></span>
              <span className="text-xs font-bold uppercase tracking-widest">SẴN SÀNG</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-secondary"></span>
              <span className="text-xs font-bold uppercase tracking-widest">ĐANG SỬ DỤNG</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-primary"></span>
              <span className="text-xs font-bold uppercase tracking-widest">ĐÃ ĐẶT</span>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl bg-surface-container-high p-12">
            <div className="relative z-10 grid grid-cols-3 gap-12">
              <div className="col-span-3 grid grid-cols-2 gap-8 lg:col-span-2">
                {isTableLoading && (
                  <div className="col-span-2 py-10 text-center text-xs font-bold uppercase tracking-widest text-secondary">
                    Đang tải dữ liệu bàn...
                  </div>
                )}
                {!isTableLoading &&
                  poolTables.map((table) => {
                    const isSelected = selectedTable?.id === table.id;
                    const isDisabled = table.status === 'Maintenance';

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => handleSelectTable(table.id)}
                        disabled={isDisabled}
                        className={`group relative text-left ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`aspect-[16/9] rounded-sm shadow-sm transition-all duration-300 ${
                            table.status === 'Available'
                              ? 'bg-surface-container-lowest hover:scale-[1.02]'
                              : table.status === 'Maintenance'
                                ? 'bg-surface-container-highest opacity-60'
                                : 'border-2 border-primary/20 bg-surface-container-highest'
                          } ${isSelected ? 'ring-4 ring-primary/50 ring-offset-4 ring-offset-surface-container-high' : ''} flex flex-col items-center justify-center`}
                        >
                          <div
                            className={`flex h-12 w-24 items-center justify-center rounded border-2 text-[10px] font-bold ${
                              table.status === 'Available'
                                ? 'border-tertiary bg-tertiary/10 text-tertiary'
                                : table.status === 'Maintenance'
                                  ? 'border-secondary bg-secondary/10 text-secondary'
                                  : 'border-primary bg-primary/10 text-primary'
                            }`}
                          >
                            {table.tableNumber}
                          </div>
                          {!isDisabled && (
                            <div
                              className={`absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm transition-opacity ${
                                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary">
                                {isSelected ? 'ĐANG CHỌN' : 'CHỌN'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          className={`mt-2 text-center text-[10px] font-bold uppercase tracking-widest ${
                            table.status === 'Available'
                              ? 'text-tertiary'
                              : table.status === 'Maintenance'
                                ? 'text-secondary'
                                : 'text-primary'
                          }`}
                        >
                          {getTableStatusLabel(table.status).toUpperCase()}
                        </div>
                      </button>
                    );
                  })}
              </div>

              <div className="col-span-3 flex flex-col gap-8 lg:col-span-1">
                {!isTableLoading &&
                  otherTables.map((table) => {
                    const isSelected = selectedTable?.id === table.id;
                    const isDisabled = table.status === 'Maintenance';

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => handleSelectTable(table.id)}
                        disabled={isDisabled}
                        className={`group relative text-left ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`rounded-sm shadow-sm transition-all duration-300 ${
                            table.type === 'Snooker' ? 'aspect-[4/5]' : 'aspect-square'
                          } ${
                            table.status === 'Available'
                              ? 'bg-surface-container-lowest hover:scale-[1.02]'
                              : table.status === 'Maintenance'
                                ? 'bg-surface-container-highest opacity-60'
                                : 'border-2 border-primary/20 bg-surface-container-highest'
                          } ${isSelected ? 'ring-4 ring-primary/50 ring-offset-4 ring-offset-surface-container-high' : ''} flex flex-col items-center justify-center`}
                        >
                          <div
                            className={`flex items-center justify-center rounded border-2 border-stone-300 bg-stone-100 text-[10px] font-bold ${
                              table.type === 'Snooker' ? 'h-32 w-20 [writing-mode:vertical-lr]' : 'h-20 w-20'
                            } ${
                              table.status === 'Available'
                                ? 'border-tertiary text-tertiary'
                                : table.status === 'Maintenance'
                                  ? 'border-secondary text-secondary'
                                  : 'border-primary text-primary'
                            }`}
                          >
                            {table.tableNumber}
                          </div>
                          {!isDisabled && (
                            <div
                              className={`absolute inset-0 flex items-center justify-center rounded-sm bg-white/40 backdrop-blur-sm transition-opacity ${
                                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary">
                                {isSelected ? 'ĐANG CHỌN' : 'CHỌN'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          className={`mt-2 text-center text-[10px] font-bold uppercase tracking-widest ${
                            table.status === 'Available'
                              ? 'text-tertiary'
                              : table.status === 'Maintenance'
                                ? 'text-secondary'
                                : 'text-primary'
                          }`}
                        >
                          {getTableStatusLabel(table.status).toUpperCase()}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="absolute bottom-[-10%] right-[-5%] h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute left-[-5%] top-[-10%] h-64 w-64 rounded-full bg-tertiary/5 blur-3xl"></div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold font-headline tracking-tight">Dịch vụ Atelier</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">Thực đơn đặt trước</span>
                <div className="relative h-6 w-12 rounded-full bg-surface-container-highest p-1">
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-primary"></div>
                </div>
              </div>
            </div>

            {isMenuLoading ? (
              <div className="rounded-xl bg-surface-container-low p-6 text-sm text-secondary">Đang tải thực đơn F&B...</div>
            ) : featuredMenuItems.length === 0 ? (
              <div className="rounded-xl bg-surface-container-low p-6 text-sm text-secondary">Chưa có món nào khả dụng.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {featuredMenuItems.map((item) => {
                  const cartEntry = cart.find((entry) => entry.menuItemId === item.id);

                  return (
                    <div
                      key={item.id}
                      className="group flex items-center gap-6 rounded-xl bg-surface-container-low p-6 transition-all hover:bg-surface-container-high"
                    >
                      <img
                        className="h-20 w-20 rounded-lg object-cover grayscale transition-all group-hover:grayscale-0"
                        alt={item.name}
                        src={item.imageUrl || DEFAULT_MENU_IMAGE}
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-bold font-headline">{item.name}</h4>
                            <p className="text-xs font-body text-secondary">{item.description || item.category}</p>
                          </div>
                          <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="rounded-full border border-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-on-primary"
                          >
                            {cartEntry ? 'Thêm nữa' : 'Thêm vào đơn'}
                          </button>
                          {cartEntry && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, cartEntry.quantity - 1)}
                                className="h-8 w-8 rounded-full bg-surface-container-high text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
                                aria-label={`Giảm số lượng ${item.name}`}
                              >
                                -
                              </button>
                              <span className="min-w-6 text-center text-sm font-bold">{cartEntry.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, cartEntry.quantity + 1)}
                                className="h-8 w-8 rounded-full bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary-container"
                                aria-label={`Tăng số lượng ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Bàn đã chọn</label>
                <div className="rounded-lg bg-surface-container-lowest p-4">
                  {selectedTable ? (
                    <div className="space-y-2">
                      <p className="text-sm font-bold font-headline">
                        {selectedTable.tableNumber} • {getTableTypeLabel(selectedTable.type)}
                      </p>
                      <p className="text-xs uppercase tracking-widest text-secondary">
                        {getTableStatusLabel(selectedTable.status)} • ${selectedTable.hourlyRate}/giờ
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-secondary">Chọn một bàn trên sơ đồ để bắt đầu.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
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
                {!selectedTable ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Chọn bàn để xem lịch trống.
                  </div>
                ) : isAvailabilityLoading ? (
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-sm text-secondary">
                    Đang tải khung giờ khả dụng...
                  </div>
                ) : (
                  <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1">
                    {availabilitySlots.map((slot) => {
                      const isSelectedSlot = selectedSlots.includes(slot.startTime);
                      const slotLabel = format(new Date(slot.startTime), 'HH:mm');

                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => handleSlotToggle(slot)}
                          className={`rounded py-2 text-xs font-medium transition-colors ${
                            isSelectedSlot
                              ? 'border border-primary bg-primary text-on-primary'
                              : slot.isAvailable
                                ? 'border border-transparent bg-surface-container-lowest text-on-surface hover:border-primary/20'
                                : 'cursor-not-allowed bg-secondary/10 text-secondary line-through'
                          }`}
                        >
                          {slotLabel}
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

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">F&B đã chọn</label>
                <div className="rounded-lg bg-surface-container-lowest p-4">
                  {cart.length === 0 ? (
                    <p className="text-sm text-secondary">Thêm đồ ăn hoặc nước uống từ Atelier để gửi cùng lượt đặt.</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((entry) => (
                        <div key={entry.menuItemId} className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{entry.item.name}</p>
                            <p className="text-xs text-secondary">
                              {entry.quantity} x ${entry.item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              ${(entry.quantity * entry.item.price).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(entry.menuItemId)}
                              className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/10 hover:text-on-surface"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                        <span className="text-sm text-secondary">Tạm tính F&B</span>
                        <span className="font-bold">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-end justify-between border-b border-outline-variant/10 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Tổng tạm tính</p>
                    <p className="text-3xl font-black font-headline text-on-background">${grandTotal.toFixed(2)}</p>
                  </div>
                  <div className="text-right text-[10px] text-secondary">
                    <p>{selectedTable ? `${selectedTable.hourlyRate}/giờ` : 'Chọn bàn để tính giá'}</p>
                    <p>Bàn: ${totalPrice.toFixed(2)} • F&B: ${cartTotal.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  className="w-full rounded-full billiard-gradient py-5 text-sm font-bold uppercase tracking-widest text-on-primary transition-transform hover:translate-y-[-2px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={!selectedTable || orderedSelectedSlots.length === 0 || isAvailabilityLoading || isBookingLoading}
                >
                  {isBookingLoading ? 'Đang tạo lượt đặt...' : 'Xác nhận đặt bàn'}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </CustomerLayout>
  );
}
