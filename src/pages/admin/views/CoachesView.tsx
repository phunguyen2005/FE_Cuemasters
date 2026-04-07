import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { Plus, MoreVertical, Edit, AlertCircle, Clock, CheckCircle2, Star, Users, Calendar, Trash2 } from 'lucide-react';
import { AdminModal } from '../components/AdminModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const CoachesView = () => {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const initialForm = {
    fullName: '',
    email: '',
    password: '',
    specialty: 'Pool',
    bio: '',
    hourlyRate: 0,
    photoUrl: '',
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = () => {
    setLoadError(null);
    adminService.getCoaches()
      .then(data => setCoaches(Array.isArray(data) ? data : []))
      .catch(e => {
        console.error(e);
        setLoadError(e?.response?.data?.message || e?.message || 'Không thể tải danh sách HLV.');
        setCoaches([]);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCoaches = coaches.length;
  const activeCoaches = coaches.filter(c => c.isActive).length;
  const avgRating = totalCoaches
    ? (coaches.reduce((sum, c) => sum + (Number(c.rating) || 0), 0) / totalCoaches).toFixed(1)
    : '0';
  const totalSessions = coaches.reduce((sum, c) => sum + (c.totalSessions ?? 0), 0);
  const featuredCoach = coaches.length > 0
    ? coaches.reduce((max, c) => (Number(c.rating) || 0) > (Number(max.rating) || 0) ? c : max, coaches[0])
    : null;

  const openCreate = () => {
    setFormData(initialForm);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (coach: any) => {
    setFormData({
      fullName: coach.fullName,
      email: coach.email,
      password: '',
      specialty: coach.specialty || 'Pool',
      bio: coach.bio || '',
      hourlyRate: coach.hourlyRate,
      photoUrl: coach.photoUrl || '',
      isActive: coach.isActive
    });
    setEditingId(coach.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        specialty: formData.specialty,
        bio: formData.bio,
        hourlyRate: Number(formData.hourlyRate),
        photoUrl: formData.photoUrl,
        isActive: formData.isActive,
        // password omitted since DTO doesn't accept it
      };
      
      if (editingId) {
        await adminService.updateCoach(editingId, payload);
      } else {
        await adminService.createCoach(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu HLV');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteCoach(deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa HLV');
    }
  };

  const toggleStatus = async (coach: any) => {
    try {
      await adminService.updateCoach(coach.id, {
        fullName: coach.fullName,
        email: coach.email,
        specialty: coach.specialty,
        bio: coach.bio,
        hourlyRate: coach.hourlyRate,
        photoUrl: coach.photoUrl,
        isActive: !coach.isActive
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
          <span>Lỗi tải dữ liệu HLV: {loadError}</span>
          <button onClick={loadData} className="text-red-700 hover:text-red-900 font-medium underline">Thử lại</button>
        </div>
      )}
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Tổng số HLV', value: totalCoaches, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Đang hoạt động', value: activeCoaches, icon: CheckCircle2, color: 'text-tertiary', bg: 'bg-teal-50' },
          { label: 'Đánh giá TB', value: `${avgRating}/5`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Số buổi dạy (Tháng)', value: totalSessions, icon: Calendar, color: 'text-primary', bg: 'bg-red-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium">{kpi.label}</p>
              <h3 className="text-2xl font-headline font-bold text-neutral-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Table */}
        <div className="col-span-2 bg-surface-lowest rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg">Danh sách Huấn luyện viên</h3>
            <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
              <Plus size={16} /> Thêm HLV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/50 text-neutral-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-medium">HLV</th>
                  <th className="p-4 font-medium">Chuyên môn</th>
                  <th className="p-4 font-medium">Đánh giá</th>
                  <th className="p-4 font-medium">Phí/Giờ</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {coaches.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={c.photoUrl || "https://images.unsplash.com/photo-1542382103-68d1f7dcf7da"} alt={c.fullName} className="w-10 h-10 rounded-full object-cover border border-neutral-200" />
                        <div>
                          <p className="font-medium text-neutral-900">{c.fullName}</p>
                          <p className="text-xs text-neutral-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-neutral-100 text-xs font-medium text-neutral-600">
                        {c.specialty}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-medium text-neutral-900">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        {c.rating} <span className="text-neutral-400 font-normal">({c.totalSessions})</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{c.hourlyRate?.toLocaleString()}đ</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${c.isActive ? 'bg-tertiary' : 'bg-neutral-400'}`}></div>
                        <span className={`text-xs font-medium ${c.isActive ? 'text-tertiary' : 'text-neutral-500'}`}>
                          {c.isActive ? 'Hoạt động' : 'Tạm nghỉ'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3 text-neutral-400">
                        <button onClick={() => openEdit(c)} className="hover:text-primary transition-colors" title="Sửa"><Edit size={16} /></button>
                        <button onClick={() => { setDeletingId(c.id); setIsDeleteOpen(true); }} className="hover:text-primary transition-colors" title="Xóa"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coaches.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-400">Không có HLV nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Featured Coach Card */}
        <div className="bg-surface-lowest rounded-2xl border border-neutral-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-start mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
              <Star size={12} className="fill-amber-500" /> HLV Nội bật
            </span>
            <button className="text-neutral-400 hover:text-neutral-900"><MoreVertical size={16} /></button>
          </div>
          {featuredCoach ? (
            <>
              <div className="relative mb-4">
                <img src={featuredCoach.photoUrl || "https://images.unsplash.com/photo-1542382103-68d1f7dcf7da"} alt={featuredCoach.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
                <div className="absolute -bottom-2 -right-2 bg-tertiary text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <h4 className="font-headline font-bold text-xl">{featuredCoach.fullName}</h4>
              <p className="text-sm text-neutral-500 mb-6">{featuredCoach.specialty} Specialist</p>
              
              <div className="w-full grid grid-cols-2 gap-4 border-t border-neutral-100 pt-6 mt-auto">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Đánh giá</p>
                  <p className="font-bold text-lg">{featuredCoach.rating}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Giờ dạy</p>
                  <p className="font-bold text-lg">{featuredCoach.totalSessions}h</p>
                </div>
              </div>
            </>
          ) : (
             <p className="text-sm text-neutral-500 py-10">Chưa có dữ liệu HLV.</p>
          )}
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Sửa thông tin HLV" : "Thêm HLV mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Họ tên</label>
              <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-surface-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Nguyen Van A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-surface-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="hlv@cuemasters.vn" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Mật khẩu (Tùy chọn)</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-surface-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="********" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Chuyên môn</label>
              <select value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-surface-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="Pool">Pool</option>
                <option value="Snooker">Snooker</option>
                <option value="Carom">Carom</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tiểu sử</label>
            <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-surface-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Kinh nghiệm, thành tích..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phí/Giờ (VNĐ)</label>
              <input required type="number" min="0" step="10000" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: Number(e.target.value)})} className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-surface-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Link Ảnh Avatar</label>
              <input type="text" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-surface-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="https://" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isActiveCoach" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-primary focus:ring-primary" />
            <label htmlFor="isActiveCoach" className="text-sm font-medium text-neutral-700">Đang hoạt động (Hiển thị cho khách)</label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover shadow-sm transition-colors">
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Xóa Huấn luyện viên"
        message="Bạn có chắc chắn muốn xóa huấn luyện viên này không? Dữ liệu không thể khôi phục."
      />
    </div>
  );
};
