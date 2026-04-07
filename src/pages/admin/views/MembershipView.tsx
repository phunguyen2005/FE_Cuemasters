import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { Plus, X } from 'lucide-react';

export const MembershipView = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    tier: 'Basic',
    monthlyPrice: 0,
    tableDiscountPercent: 0,
    freeCoachingSessionsPerMonth: 0,
    priorityBooking: false,
    isActive: true
  });

  const fetchPlans = () => {
    adminService.getMemberships().then(data => setPlans(data.items || data)).catch(e => console.error(e));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setFormData({ ...plan });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        tier: 'Basic',
        monthlyPrice: 0,
        tableDiscountPercent: 0,
        freeCoachingSessionsPerMonth: 0,
        priorityBooking: false,
        isActive: true
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminService.updateMembership(formData.id, formData);
      } else {
        await adminService.createMembership(formData);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi lưu thẻ thành viên');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói thành viên này không?')) {
      try {
        await adminService.deleteMembership(id);
        fetchPlans();
      } catch (e) {
        console.error(e);
        alert('Có lỗi xảy ra khi xóa thẻ thành viên');
      }
    }
  };

  return (
    <div className="p-8 text-neutral-900 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold font-headline">Gói thành viên</h2>     
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-black px-4 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
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
                <span className="text-neutral-500">Tier:</span>        
                <span className="font-medium">{plan.tier}</span>   
              </div>
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
              <button 
                onClick={() => handleOpenModal(plan)}
                className="flex-1 bg-surface-low hover:bg-neutral-200 py-2 rounded-xl text-sm font-medium transition-colors">Sửa</button>
              <button 
                onClick={() => handleDelete(plan.id)}
                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl text-sm font-medium transition-colors">Xóa</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{isEditing ? 'Sửa gói thành viên' : 'Thêm gói thành viên'}</h3>
              <button onClick={handleCloseModal} className="text-neutral-500 hover:text-black">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên gói</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full border rounded-lg p-2" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tier</label>
                <select
                  value={formData.tier}
                  onChange={e => setFormData({...formData, tier: e.target.value})} 
                  className="w-full border rounded-lg p-2"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Giá mỗi tháng</label>
                <input 
                  type="number" 
                  value={formData.monthlyPrice} 
                  onChange={e => setFormData({...formData, monthlyPrice: Number(e.target.value)})} 
                  className="w-full border rounded-lg p-2" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Giảm giá bàn (%)</label>
                <input 
                  type="number" 
                  value={formData.tableDiscountPercent} 
                  onChange={e => setFormData({...formData, tableDiscountPercent: Number(e.target.value)})} 
                  className="w-full border rounded-lg p-2" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Số buổi HLV miễn phí</label>
                <input 
                  type="number" 
                  value={formData.freeCoachingSessionsPerMonth} 
                  onChange={e => setFormData({...formData, freeCoachingSessionsPerMonth: Number(e.target.value)})} 
                  className="w-full border rounded-lg p-2" 
                  required 
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="priorityBooking"
                  checked={formData.priorityBooking} 
                  onChange={e => setFormData({...formData, priorityBooking: e.target.checked})} 
                />
                <label htmlFor="priorityBooking" className="text-sm font-medium">Ưu tiên đặt bàn</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                />
                <label htmlFor="isActive" className="text-sm font-medium">Đang hoạt động</label>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg hover:bg-neutral-50">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-primary text-black font-medium rounded-lg hover:bg-primary/90">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
