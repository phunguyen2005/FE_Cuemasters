import React, { useEffect, useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useCoachStore } from '../stores/coachStore';
import { useAuthStore } from '../stores/authStore';
import { ScreenProps } from '../types';
import CustomerLayout from '../components/layout/CustomerLayout';
import { formatCurrency } from '../utils/formatCurrency';

export default function Coaches({ onNavigate }: ScreenProps) {
  const {
    coaches, fetchCoaches,
    selectedCoach, setSelectedCoach,
    availability, fetchAvailability,
    selectedSlot, setSelectedSlot,
    bookCoach, isBooking,
  } = useCoachStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingFeedback, setBookingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  useEffect(() => {
    if (selectedCoach && selectedDate) {
      fetchAvailability(selectedCoach.id, format(selectedDate, 'yyyy-MM-dd'));
      setBookingFeedback(null);
    }
  }, [selectedCoach, selectedDate, fetchAvailability]);

  const handleConfirmBooking = async () => {
    if (!selectedCoach || !selectedSlot) return;
    if (!isAuthenticated) {
      setBookingFeedback({ type: 'error', message: 'Bạn cần đăng nhập để đặt lịch.' });
      onNavigate?.('login');
      return;
    }
    const result = await bookCoach({
      sessionDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    });
    setBookingFeedback({ type: result.success ? 'success' : 'error', message: result.message });
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="coaches">
      <div className="pb-24">
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-8 mb-24">
          <div className="flex flex-col md:flex-row items-end gap-12">
            <div className="flex-1">
              <span className="text-primary font-label text-sm uppercase tracking-[0.2em] font-bold block mb-4">Làm chủ cuộc chơi</span>
              <h1 className="text-7xl font-extrabold tracking-tighter leading-none mb-8 text-on-surface font-headline">Huấn luyện <br/><span className="text-primary">chuẩn xác.</span></h1>
              <p className="text-secondary max-w-lg font-body leading-relaxed text-lg">Nâng tầm kỹ năng bida của bạn với các huấn luyện viên đẳng cấp thế giới. Từ kỹ thuật cơ bản đến chiến thuật nâng cao, các khóa học của chúng tôi cung cấp lộ trình cá nhân hóa để tiến tới sự tinh thông.</p>
            </div>
            <div className="w-full md:w-1/3 bg-surface-container-high p-8 flex items-center justify-between rounded-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(0,104,93,0.4)]"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary">Trạng thái trực tiếp</span>
                </div>
                <p className="font-headline font-bold text-xl">12 HLV đang trực tuyến</p>
              </div>
              <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95">Ghép trận nhanh</button>
            </div>
          </div>
        </section>

        {/* Coaches Grid */}
        <section className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <h2 className="text-4xl font-bold tracking-tight font-headline">Đội ngũ chuyên gia</h2>
            <div className="flex flex-wrap gap-4">
              <button className="px-5 py-2 rounded-full bg-surface-container-low text-secondary text-sm font-medium hover:bg-surface-container-high transition-colors">Tất cả bộ môn</button>
              <button className="px-5 py-2 rounded-full bg-surface-container-low text-secondary text-sm font-medium hover:bg-surface-container-high transition-colors">Snooker</button>
              <button className="px-5 py-2 rounded-full bg-surface-container-low text-secondary text-sm font-medium hover:bg-surface-container-high transition-colors">Bida lỗ 9 bóng</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {coaches.map(coach => (
              <div key={coach.id} className="group flex flex-col bg-surface-container-low overflow-hidden rounded-xl">
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-300">
                  <img alt={coach.fullName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0" src={coach.avatarUrl || "https://images.unsplash.com/photo-1542382103-ba9c0490b4d9?auto=format&fit=crop&q=80&w=400"} />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">     
                    <span className="bg-white/90 backdrop-blur text-on-surface px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm rounded-sm">{coach.specialty}</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow bg-surface-container-lowest">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-1 font-headline">{coach.fullName}</h3>
                      <div className="flex items-center gap-1 text-primary">      
                        <span className="material-symbols-outlined text-sm [font-variation-settings:'FILL'_1]">star</span>
                        <span className="text-xs font-bold ml-2 text-on-surface">5.0</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-secondary uppercase font-bold block mb-1">Giá mỗi giờ</span>
                      <span className="text-xl font-black text-primary">{formatCurrency(coach.hourlyRate)}</span>
                    </div>
                  </div>
                  <p className="text-secondary font-body text-sm leading-relaxed mb-8">{coach.bio}</p>
                  <button onClick={() => setSelectedCoach(coach)} className={`w-full py-4 rounded-sm font-label text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${selectedCoach?.id === coach.id ? 'bg-primary text-white' : 'bg-on-background text-white hover:bg-primary'}`}>
                    {selectedCoach?.id === coach.id ? 'Đang chọn lịch' : 'Xem lịch trình'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Booking Interface Overlay */}
        {selectedCoach && (
        <section className="max-w-[1440px] mx-auto px-8 mt-32">
          <div className="bg-[#1C1C1C] text-white p-12 md:p-20 relative overflow-hidden flex flex-col items-center md:flex-row gap-16 rounded-xl shadow-2xl">
            <div className="flex-1 relative z-10">
              <h2 className="text-5xl font-extrabold tracking-tighter mb-6 font-headline">Lịch <span className="text-primary">trực tuyến.</span></h2>
              <p className="text-stone-400 font-body mb-12 text-sm leading-relaxed max-w-sm">Chọn một khung giờ để đặt buổi tập huấn của bạn. Các buổi học 1 kèm 1 hoặc lớp học nhóm nhỏ có sẵn hàng ngày.</p>
              
              <div className="grid grid-cols-7 gap-y-4 gap-x-2 mb-8 max-w-sm">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-stone-600 uppercase tracking-widest">{d}</div>
                ))}
                
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square flex items-center justify-center cursor-pointer text-sm transition-all duration-300 font-medium ${isSelected ? 'bg-primary text-white font-bold shadow-[0_4px_14px_rgba(224,36,36,0.3)]' : 'text-stone-300 hover:text-primary'}`}>
                      {format(date, 'd')}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full md:w-[420px] bg-[#222222] p-8 border border-white/5 relative z-10 rounded-lg shadow-xl">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div className="w-12 h-12 rounded-[10px] bg-primary flex items-center justify-center shadow-[0_4px_14px_rgba(224,36,36,0.2)]">
                  <span className="material-symbols-outlined text-white text-xl">flag</span>
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">HLV Đang chọn</p>
                  <p className="font-headline font-bold text-white text-base tracking-wide">{selectedCoach.fullName}</p>     
                </div>
              </div>
              <div className="space-y-1 mb-6 max-h-[240px] overflow-y-auto pr-2">
                {availability.length === 0 ? (
                  <p className="text-center text-sm text-stone-500 py-4">Không có giờ trống trong ngày này.</p>
                ) : (
                  availability.map((slot, i) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;
                    return (
                      <div
                        key={i}
                        onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                        className={`flex justify-between items-center py-4 px-3 border-b border-white/5 last:border-0 transition-colors ${
                          slot.isAvailable ? 'cursor-pointer group' : 'opacity-40'
                        } ${isSelected ? 'bg-primary/20 border-primary/40' : ''}`}
                      >
                        <span className={`text-sm font-medium transition-colors ${slot.isAvailable ? 'text-stone-300 group-hover:text-white' : 'text-stone-500'} ${isSelected ? 'text-white' : ''}`}>
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${slot.isAvailable ? 'text-primary' : 'text-stone-500'}`}>
                          {isSelected ? 'Đã chọn' : slot.isAvailable ? 'Sẵn sàng' : 'Đã Kín Chỗ'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>



              {bookingFeedback && (
                <div className={`mb-4 px-3 py-2 text-xs rounded-sm ${bookingFeedback.type === 'success' ? 'bg-green-900/40 text-green-300 border border-green-700/40' : 'bg-red-900/40 text-red-300 border border-red-700/40'}`}>
                  {bookingFeedback.message}
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={!selectedSlot || isBooking}
                className="w-full bg-primary text-white py-4 font-label text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-red-700 transition-colors rounded-sm shadow-[0_4px_14px_rgba(224,36,36,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isBooking ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
              </button>
            </div>
          </div>
        </section>
        )}
      </div>
    </CustomerLayout>
  );
}
