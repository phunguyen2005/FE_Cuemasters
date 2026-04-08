import React, { useEffect, useMemo, useState } from 'react';
import CustomerLayout from '../components/layout/CustomerLayout';
import { ScreenProps, MembershipPlan } from '../types';
import { useMembershipStore } from '../stores/membershipStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatCurrency';

const getAdvanceWindowLabel = (days: number) => {
  if (days <= 0) return 'Trong ngay';
  if (days === 1) return '1 ngay';
  return `${days} ngay`;
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
        message: 'Ban can dang nhap truoc khi dang ky goi thanh vien.',
      });
      onNavigate('login');
      return;
    }

    setFeedback(null);

    try {
      const membership = await subscribe(planId, autoRenewOnSubscribe);
      setFeedback({
        type: 'success',
        message: `Da dang ky goi ${membership.planName} thanh cong.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Khong the dang ky goi thanh vien luc nay.'),
      });
    }
  };

  const handleCancelAutoRenew = async () => {
    setFeedback(null);

    try {
      await cancelAutoRenew();
      setFeedback({
        type: 'success',
        message: 'Da tat tuy chon gia han tu dong cho goi hien tai.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Khong the cap nhat tuy chon gia han tu dong.'),
      });
    }
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="membershipTiers">
      <div className="px-8 pb-20">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-3xl border border-outline-variant/20 bg-stone-950 px-8 py-10 text-white shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                  Membership Flow
                </p>
                <h1 className="text-5xl font-black font-headline tracking-tight">
                  Goi thanh vien anh huong truc tiep den booking.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-stone-300">
                  Hien tai he thong dang ap dung 2 loi ich membership vao luong dat ban:
                  giam gia ban va so ngay duoc dat truoc. Priority booking, quota HLV mien
                  phi, va auto-renew van duoc luu trong du lieu nhung chua co worker hoac
                  usage tracking tu dong.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                  Dang ap dung that
                </p>
                <div className="mt-4 space-y-3 text-sm text-stone-200">
                  <div className="rounded-xl bg-white/5 px-4 py-3">
                    Giam gia ban theo <strong>TableDiscountPercent</strong> cua goi.
                  </div>
                  <div className="rounded-xl bg-white/5 px-4 py-3">
                    Chan dat truoc vuot qua <strong>MaxAdvanceBookingDays</strong>.
                  </div>
                  <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-amber-100">
                    Priority booking va mien phi HLV hien moi o muc metadata, chua tu dong
                    enforce trong booking flow.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {feedback && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-error/20 bg-error/5 text-error'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {activeMembership && currentPlan && (
            <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                      {currentPlan.tier}
                    </span>
                    <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-secondary">
                      {activeMembership.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                      Goi hien tai
                    </p>
                    <h2 className="mt-2 text-4xl font-black font-headline tracking-tight text-on-background">
                      {activeMembership.planName}
                    </h2>
                  </div>

                  <p className="max-w-3xl text-sm leading-7 text-secondary">
                    Bat dau {formatDate(activeMembership.startDate)} va ket thuc {formatDate(activeMembership.endDate)}.
                    {activeMembership.autoRenew
                      ? ' Tuy chon auto-renew dang bat, nhung hien chua co worker tu dong thu phi/gia han.'
                      : ' Auto-renew dang tat.'}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-auto">
                  <div className="rounded-2xl bg-surface-container-high px-5 py-4 text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                      Phi hang thang
                    </p>
                    <p className="mt-1 text-3xl font-black text-primary">
                      {formatCurrency(currentPlan.monthlyPrice)}
                    </p>
                  </div>

                  {activeMembership.autoRenew && (
                    <button
                      onClick={handleCancelAutoRenew}
                      disabled={isLoading}
                      className="rounded-full border border-outline-variant/30 bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-on-background transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Tat auto-renew
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Giam gia ban
                  </p>
                  <p className="mt-2 text-2xl font-black text-on-background">
                    {currentPlan.tableDiscountPercent}%
                  </p>
                </div>
                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Dat truoc
                  </p>
                  <p className="mt-2 text-2xl font-black text-on-background">
                    {getAdvanceWindowLabel(currentPlan.maxAdvanceBookingDays)}
                  </p>
                </div>
                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Buoi HLV/thang
                  </p>
                  <p className="mt-2 text-2xl font-black text-on-background">
                    {currentPlan.freeCoachingSessionsPerMonth}
                  </p>
                </div>
                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Priority booking
                  </p>
                  <p className="mt-2 text-2xl font-black text-on-background">
                    {currentPlan.priorityBooking ? 'On' : 'Off'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {!activeMembership && (
            <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-headline text-on-background">
                    Chon cach luu tuy chon gia han
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-secondary">
                    Backend luu duoc co auto-renew hay khong khi dang ky. Hien chua co job
                    tu dong thu phi, nen day la thong tin luu trang thai, khong phai quy
                    trinh renew thuc su.
                  </p>
                </div>

                <label className="flex items-center gap-3 rounded-full border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-background">
                  <input
                    type="checkbox"
                    checked={autoRenewOnSubscribe}
                    onChange={(event) => setAutoRenewOnSubscribe(event.target.checked)}
                    className="h-4 w-4 rounded border-outline-variant"
                  />
                  Tu dong gia han khi dang ky
                </label>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-black font-headline tracking-tight text-on-background">
                  Danh sach goi thanh vien
                </h2>
                <p className="mt-2 text-sm leading-7 text-secondary">
                  Moi goi luu day du du lieu trong MembershipPlan. Customer flow hien nen
                  duoc hieu la: dang ky 1 thang, nhan giam gia ban, va bi rang buoc so ngay
                  dat truoc theo goi.
                </p>
              </div>

              {activeMembership && (
                <p className="text-sm font-medium text-secondary">
                  Hien backend chua ho tro doi goi giua ky khi membership van con active.
                </p>
              )}
            </div>

            {plans.length === 0 && !isLoading ? (
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6 text-sm text-secondary">
                Chua co goi thanh vien dang ban.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {plans.map((plan) => {
                  const isCurrentPlan = activeMembership?.planId === plan.id;
                  const subscribeDisabled = isLoading || !!activeMembership;

                  return (
                    <article
                      key={plan.id}
                      className={`rounded-3xl border p-6 shadow-sm transition-colors ${
                        isCurrentPlan
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant/20 bg-surface-container-lowest'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
                              {plan.tier}
                            </span>
                            {!plan.isActive && (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
                                Tam an
                              </span>
                            )}
                          </div>
                          <h3 className="mt-4 text-2xl font-black font-headline text-on-background">
                            {plan.name}
                          </h3>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                            Gia/thang
                          </p>
                          <p className="mt-2 text-2xl font-black text-primary">
                            {formatCurrency(plan.monthlyPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3 text-sm text-on-background">
                        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                          Giam gia ban: <strong>{plan.tableDiscountPercent}%</strong>
                        </div>
                        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                          Dat truoc: <strong>{getAdvanceWindowLabel(plan.maxAdvanceBookingDays)}</strong>
                        </div>
                        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                          Free coaching: <strong>{plan.freeCoachingSessionsPerMonth} buoi/thang</strong>
                          <span className="mt-1 block text-xs text-secondary">
                            Quota nay da luu trong goi, nhung MembershipBenefitUsage chua duoc
                            service cap nhat tu dong.
                          </span>
                        </div>
                        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                          Priority booking: <strong>{plan.priorityBooking ? 'Bat' : 'Tat'}</strong>
                          <span className="mt-1 block text-xs text-secondary">
                            Co flag trong plan, nhung BookingService hien chua doc flag nay.
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        {isCurrentPlan ? (
                          <button
                            disabled
                            className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-[0.16em] text-white opacity-80"
                          >
                            Dang su dung
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={subscribeDisabled || !plan.isActive}
                            className="w-full rounded-full bg-on-background py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {activeMembership ? 'Chua ho tro doi goi giua ky' : 'Dang ky goi nay'}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </CustomerLayout>
  );
}
