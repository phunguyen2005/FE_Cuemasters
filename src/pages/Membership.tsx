import React, { useEffect, useMemo, useState } from 'react';
import CustomerLayout from '../components/layout/CustomerLayout';
import { ScreenProps, MembershipPlan } from '../types';
import { useMembershipStore } from '../stores/membershipStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Check, Crown, CalendarDays, Clock, Info } from 'lucide-react';

const getAdvanceWindowLabel = (days: number) => {
  if (days <= 0) return 'Chỉ đặt trong ngày';
  return `Trước ${days} ngày`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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

export default function Membership({ onNavigate }: ScreenProps) {
  const {
    plans,
    myMembership,
    isLoading,
    error,
    fetchPlans,
    fetchMyMembership,
    subscribe,
    cancelAutoRenew,
    clearError,
  } = useMembershipStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const activeMembership = isAuthenticated ? myMembership : null;
  const [autoRenewOnSubscribe, setAutoRenewOnSubscribe] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchMyMembership();
    }
  }, [fetchMyMembership, isAuthenticated]);

  useEffect(() => {
    if (error) {
      setFeedback({ type: 'error', message: error });
      clearError();
    }
  }, [clearError, error]);

  const currentPlan = useMemo<MembershipPlan | null>(() => {
    if (!activeMembership) return null;

    return (
      plans.find((plan) => plan.id === activeMembership.planId) || {
        id: activeMembership.planId,
        tier: activeMembership.tier,
        name: activeMembership.planName,
        monthlyPrice: activeMembership.monthlyPrice,
        tableDiscountPercent: activeMembership.tableDiscountPercent,
        priorityBooking: activeMembership.priorityBooking,
        freeCoachingSessionsPerMonth: activeMembership.freeCoachingSessionsPerMonth,
        maxAdvanceBookingDays: activeMembership.maxAdvanceBookingDays,
        isActive: true,
      }
    );
  }, [activeMembership, plans]);

  const handleSubscribe = async (planId: number) => {
    if (!isAuthenticated) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng đăng nhập trước khi đăng ký gói thành viên.',
      });
      onNavigate('login');
      return;
    }

    setFeedback(null);

    try {
      const membership = await subscribe(planId, autoRenewOnSubscribe);
      setFeedback({
        type: 'success',
        message: `Đăng ký gói ${membership.planName} thành công.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Không thể đăng ký gói thành viên lúc này.'),
      });
    }
  };

  const handleCancelAutoRenew = async () => {
    setFeedback(null);

    try {
      await cancelAutoRenew();
      setFeedback({
        type: 'success',
        message: 'Đã hủy gia hạn tự động.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Không thể hủy gia hạn tự động.'),
      });
    }
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="membershipTiers">
      <div className="px-6 py-12 md:py-20 min-h-screen bg-[#0A0A0A] text-white">
        <div className="mx-auto max-w-6xl space-y-12">
          
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Gói Thành Viên CueMasters
            </h1>
            <p className="mx-auto max-w-2xl text-stone-400 text-sm md:text-base leading-relaxed">
              Nâng tầm trải nghiệm billiard của bạn với các đặc quyền độc quyền. Nhận ưu đãi giờ chơi, ưu tiên đặt bàn và các quyền lợi đặc biệt khác.
            </p>
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              <Info className="w-5 h-5 shrink-0" />
              {feedback.message}
            </div>
          )}

          {/* Current Membership */}
          {activeMembership && currentPlan && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 p-8 md:p-10 shadow-2xl">
              <div className="absolute -right-8 -top-8 p-8 opacity-5 pointer-events-none">
                <Crown className="w-64 h-64" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                      {currentPlan.tier}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      activeMembership.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {activeMembership.status}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-stone-400 text-sm font-medium tracking-wide uppercase mb-2">Gói đang sử dụng</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{activeMembership.planName}</h2>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm font-medium text-stone-300">
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      Hiệu lực: {formatDate(activeMembership.startDate)} — {formatDate(activeMembership.endDate)}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-primary" />
                      Gia hạn: {activeMembership.autoRenew ? 'Tự động' : 'Thủ công'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 min-w-[200px]">
                  {activeMembership.autoRenew && (
                    <button
                      onClick={handleCancelAutoRenew}
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 rounded-2xl border border-stone-700/50 bg-stone-800/50 hover:bg-stone-800 hover:border-stone-600 transition-all text-white font-semibold text-sm disabled:opacity-50"
                    >
                      Hủy gia hạn tự động
                    </button>
                  )}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t border-stone-800/50">
                <div className="flex flex-col gap-2">
                  <span className="text-stone-400 text-[11px] uppercase tracking-widest font-bold">Giảm giá bàn</span>
                  <span className="text-2xl md:text-3xl font-black text-white">{currentPlan.tableDiscountPercent}%</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-stone-400 text-[11px] uppercase tracking-widest font-bold">Đặt bàn online</span>
                  <span className="text-2xl md:text-3xl font-black text-white">{getAdvanceWindowLabel(currentPlan.maxAdvanceBookingDays)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-stone-400 text-[11px] uppercase tracking-widest font-bold">Buổi HLV / tháng</span>
                  <span className="text-2xl md:text-3xl font-black text-white">{currentPlan.freeCoachingSessionsPerMonth}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-stone-400 text-[11px] uppercase tracking-widest font-bold">Ưu tiên xếp bàn</span>
                  <span className="text-2xl md:text-3xl font-black text-white">{currentPlan.priorityBooking ? 'Có' : 'Không'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions toggle */}
          {!activeMembership && (
            <div className="flex justify-center">
              <label className="group flex items-center gap-4 bg-stone-900/40 border border-stone-800/60 px-6 py-4 rounded-2xl cursor-pointer hover:bg-stone-900/80 transition-colors">
                <input
                  type="checkbox"
                  checked={autoRenewOnSubscribe}
                  onChange={(e) => setAutoRenewOnSubscribe(e.target.checked)}
                  className="w-5 h-5 rounded border-stone-700 bg-stone-950 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-stone-950 transition-colors"
                />
                <span className="text-stone-300 font-medium select-none group-hover:text-white transition-colors">Đăng ký chu kỳ tự động gia hạn hàng tháng</span>
              </label>
            </div>
          )}

          {/* Plans Grid */}
          {plans.length === 0 && !isLoading ? (
            <div className="text-center text-stone-500 py-12 font-medium">
              Hiện chưa có gói thành viên nào được mở bán.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan) => {
                const isCurrentPlan = activeMembership?.planId === plan.id;
                const isMostPopular = plan.tier.toLowerCase() === 'gold' || plan.tier.toLowerCase() === 'vip';
                
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-[2rem] p-8 transition-all duration-300 ${
                      isCurrentPlan
                        ? 'bg-primary/5 border-2 border-primary/40 shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] scale-[1.02]'
                        : 'bg-stone-900/30 border border-stone-800 hover:bg-stone-900/60 hover:border-stone-700'
                    }`}
                  >
                    {!plan.isActive && (
                      <div className="absolute -top-3 -right-3">
                        <span className="bg-red-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg tracking-wider">
                          Tạm ngừng
                        </span>
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isCurrentPlan ? 'bg-primary/20 text-primary' : 'bg-stone-800 text-stone-300'
                        }`}>
                          {plan.tier}
                        </span>
                        {isMostPopular && !isCurrentPlan && (
                          <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5" /> Phổ biến
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-white">{formatCurrency(plan.monthlyPrice)}</span>
                        <span className="text-stone-500 text-sm font-bold uppercase tracking-wider">/tháng</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-stone-300 text-sm leading-relaxed">Giảm ngay <strong className="text-white font-black">{plan.tableDiscountPercent}%</strong> phí giờ chơi bàn</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-stone-300 text-sm leading-relaxed">Quyền đặt bàn <strong className="text-white font-black">{getAdvanceWindowLabel(plan.maxAdvanceBookingDays).toLowerCase()}</strong></span>
                      </div>
                      {plan.freeCoachingSessionsPerMonth > 0 && (
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-stone-300 text-sm leading-relaxed"><strong className="text-white font-black">{plan.freeCoachingSessionsPerMonth} buổi</strong> huấn luyện miễn phí / tháng</span>
                        </div>
                      )}
                      {plan.priorityBooking && (
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-stone-300 text-sm leading-relaxed">Quyền <strong className="text-white font-black">ưu tiên xếp bàn</strong> khi khách đông</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-6">
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoading || !!activeMembership || !plan.isActive}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
                          isCurrentPlan
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 cursor-default'
                            : activeMembership
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed hidden'
                            : !plan.isActive
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-stone-200'
                        }`}
                      >
                        {isCurrentPlan ? 'Đang Sử Dụng' : 'Đăng Ký Gói Này'}
                      </button>
                      
                      {activeMembership && !isCurrentPlan && (
                        <div className="w-full text-center text-xs text-stone-500 font-medium py-3">
                          Không thể thay đổi khi đang có gói hiệu lực
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

