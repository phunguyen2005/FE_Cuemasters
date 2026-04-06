import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { Plus, MoreVertical, Edit, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';


export const MembershipView = () => {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    adminService.getMemberships().then(data => setPlans(data.items || data)).catch(e => console.error(e));
  }, []);

  return (
    <div className="p-8 text-neutral-900 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold font-headline">Gói thành viên</h2>
        <button className="bg-primary text-black px-4 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Thêm gói mới
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <div key={plan.id} className="bg-surface-lowest border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {plan.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                </span>
              </div>
              <p className="text-primary font-bold text-xl">{plan.monthlyPrice.toLocaleString()}đ<span className="text-sm text-neutral-500 font-normal">/tháng</span></p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Người đăng ký:</span>
                <span className="font-medium">{plan.activeSubscribers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Giảm giá bàn:</span>
                <span className="font-medium">{plan.tableDiscountPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Hỗ trợ HLV miễn phí:</span>
                <span className="font-medium">{plan.freeCoachingSessionsPerMonth} buổi/tháng</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Ưu tiên đặt bàn:</span>
                <span className="font-medium">{plan.priorityBooking ? 'Có' : 'Không'}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-neutral-100">
              <button className="flex-1 bg-surface-low hover:bg-neutral-200 py-2 rounded-xl text-sm font-medium transition-colors">Sửa</button>
              <button className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl text-sm font-medium transition-colors">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};