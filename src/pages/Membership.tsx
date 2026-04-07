import React, { useEffect, useState } from 'react';
import { ScreenProps } from '../types';
import CustomerLayout from '../components/layout/CustomerLayout';
import { useMembershipStore } from '../stores/membershipStore';

export default function Membership({ onNavigate }: ScreenProps) {
  const { plans, myMembership, isLoading, fetchPlans, fetchMyMembership, subscribe, cancelAutoRenew } = useMembershipStore();

  useEffect(() => {
    fetchPlans();
    fetchMyMembership();
  }, [fetchPlans, fetchMyMembership]);

  if (isLoading) {
    return <CustomerLayout onNavigate={onNavigate} activeScreen="membershipTiers"><div className="p-8 text-center">Đang tải...</div></CustomerLayout>;
  }

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="membershipTiers">
      <div className="px-8 pb-20">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Current Tier Card */}
          {myMembership ? (
          <section className="relative overflow-hidden rounded-2xl bg-stone-900 text-white p-8 md:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">diamond</span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Gói hiện tại</span>
                </div>
                <h2 className="text-5xl font-black font-headline tracking-tighter mb-2">{myMembership.planName}</h2>
                <p className="text-stone-400 font-body">Thành viên từ {new Date(myMembership.startDate).toLocaleDateString()} • {myMembership.autoRenew ? 'Tự động gia hạn vào ' + new Date(myMembership.endDate).toLocaleDateString() : 'Hết hạn vào ' + new Date(myMembership.endDate).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col gap-4 w-full md:w-auto">
                <button className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all active:scale-95 shadow-lg shadow-primary/20 text-center">Nâng cấp gói</button>
                {myMembership.autoRenew && <button onClick={cancelAutoRenew} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all text-center">Hủy gia hạn</button>}
              </div>
            </div>
          </section>
          ) : (
            <div />
          )}

          {/* Memberships Plans List */}
          {!myMembership && (
            <section className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 text-center">
                    <h4 className="font-bold text-xl mb-2">{plan.name}</h4>
                    <div className="text-3xl font-black text-primary mb-4">${plan.monthlyPrice}<span className="text-sm font-normal text-secondary">/tháng</span></div>
                    <ul className="text-left text-sm text-secondary space-y-2 mb-6">
                      <li>• {plan.tableDiscountPercent}% giảm giá bàn</li>
                      <li>• {plan.fnbDiscountPercent}% giảm giá F&B</li>
                      <li>• {plan.freeCoachingHours}h huấn luyện miễn phí</li>
                      <li>• Đặt trước {plan.name === 'Gold' ? 3 : plan.name === 'Silver' ? 1 : 0} ngày</li>
                    </ul>
                    <button onClick={async () => {
                      await subscribe(plan.id);
                      fetchMyMembership();
                    }} className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-primary-container transition-colors">Đăng ký</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Benefits Grid */}{/* Benefits Grid */}{/* Benefits Grid */}
          <section>
            <h3 className="text-2xl font-bold font-headline mb-6">Đặc quyền của bạn</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Đặt trước {myMembership?.planName === 'Gold' ? '3 ngày' : myMembership?.planName === 'Silver' ? '1 ngày' : 'trong ngày'}</h4>
                <p className="text-sm text-secondary leading-relaxed">Ưu tiên giữ chỗ các khung giờ vàng theo hạng thẻ của bạn.</p>
              </div>

              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center mb-4 text-tertiary">
                  <span className="material-symbols-outlined">local_bar</span>
                </div>
                <h4 className="font-bold text-lg mb-2">Giảm 15% F&B</h4>
                <p className="text-sm text-secondary leading-relaxed">Áp dụng cho toàn bộ thực đơn đồ uống và thức ăn nhẹ tại Atelier.</p>
              </div>

              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
                  <span className="material-symbols-outlined">sports_score</span>
                </div>
                <h4 className="font-bold text-lg mb-2">1 giờ huấn luyện/tháng</h4>
                <p className="text-sm text-secondary leading-relaxed">Miễn phí một giờ tập luyện 1-kèm-1 với huấn luyện viên chuyên nghiệp.</p>
              </div>
            </div>
          </section>

          {/* Usage Stats */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20">
              <h3 className="text-lg font-bold font-headline mb-6 flex items-center justify-between">
                <span>Giờ chơi tháng này</span>
                <span className="text-primary text-2xl font-black">24<span className="text-sm text-secondary font-medium">/30h</span></span>
              </h3>
              <div className="w-full bg-surface-container-highest rounded-full h-3 mb-2 overflow-hidden">
                <div className="bg-primary h-3 rounded-full w-4/5"></div>
              </div>
              <p className="text-xs text-secondary text-right">Còn lại 6 giờ miễn phí</p>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20">
              <h3 className="text-lg font-bold font-headline mb-6 flex items-center justify-between">
                <span>Điểm thưởng CuePoints</span>
                <span className="text-tertiary text-2xl font-black">1,250<span className="text-sm text-secondary font-medium"> điểm</span></span>
              </h3>
              <div className="flex items-center gap-4">
                <button className="flex-1 bg-surface-container-high hover:bg-surface-container-highest py-3 rounded-lg text-sm font-bold transition-colors">Đổi thưởng</button>
                <button className="flex-1 bg-surface-container-high hover:bg-surface-container-highest py-3 rounded-lg text-sm font-bold transition-colors">Lịch sử điểm</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </CustomerLayout>
  );
}
