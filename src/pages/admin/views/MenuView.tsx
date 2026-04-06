import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AdminModal } from '../components/AdminModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const MenuView = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const tabs = [
    { label: 'Tất cả', value: 'All' },
    { label: 'Drinks', value: 'Drinks' },
    { label: 'Snacks', value: 'Snacks' },
    { label: 'Combos', value: 'Combos' },
    { label: 'Main Course', value: 'MainCourse' }
  ];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Drinks',
    imageUrl: '',
    isAvailable: true
  });

  const loadData = async () => {
    try {
      const data = await adminService.getFnBItems();
      setMenuItems(data.items || data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = menuItems.filter(item => activeTab === 'All' || item.category === activeTab);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedData = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', price: 0, category: 'Drinks', imageUrl: '', isAvailable: true });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || 'Drinks',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable
    });
    setIsModalOpen(true);
  };

  const toggleAvailability = async (item: any) => {
    try {
      await adminService.updateFnBItem(item.id, {
        name: item.name,
        category: item.category,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: !item.isAvailable
      });
      loadData();
    } catch (e) {
      console.error(e);
      alert('Error updating availability');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminService.updateFnBItem(editingItem.id, formData);
      } else {
        await adminService.createFnBItem(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || e.message || 'Error saving F&B item!');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteFnBItem(deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
      loadData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || e.message || 'Error deleting F&B item!');
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.value
                ? 'bg-neutral-900 text-white'
                : 'bg-surface-lowest text-neutral-600 border border-neutral-200 hover:bg-surface-low'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">       
          <Plus size={16} /> Thêm món mới
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {paginatedData.map((item: any) => (
          <div key={item.id} className={`bg-surface-lowest rounded-2xl border ${!item.isAvailable ? 'border-neutral-200 opacity-60' : 'border-neutral-100'} shadow-sm overflow-hidden group`}>
            <div className="h-48 relative overflow-hidden">
              <img src={(item.imageUrl || "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80")} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-neutral-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Ngừng bán</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-headline font-bold text-lg text-neutral-900 line-clamp-1 flex-1">{item.name}</h3>
                
                <button 
                  onClick={() => toggleAvailability(item)}
                  title={item.isAvailable ? "Đang bán - Nhấn để ngừng bán" : "Đã ngừng bán - Nhấn để mở bán lại"}
                  className={`relative w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${item.isAvailable ? 'bg-tertiary' : 'bg-neutral-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.isAvailable ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>

              </div>
              <p className="text-sm text-neutral-500 mb-4 line-clamp-2 h-10">{item.description || item.category}</p>
              <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                <span className="font-bold text-primary text-lg">{`${item.price?.toLocaleString() ?? 0}đ`}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="p-2 text-neutral-400 hover:text-primary transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => { setDeletingId(item.id); setIsDeleteOpen(true); }} className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${currentPage === i + 1 ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-surface-low'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Chỉnh sửa món" : "Thêm món mới"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tên món</label>
            <input required type="text" className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Danh mục</label>
            <select className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
              <option value="Drinks">Drinks</option>
              <option value="Snacks">Snacks</option>
              <option value="Combos">Combos</option>
              <option value="MainCourse">Main Course</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Giá bán</label>
            <input required type="number" min="0" className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Link Ảnh (Tùy chọn)</label>
            <input type="text" className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={formData.imageUrl} onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={e => setFormData(f => ({ ...f, isAvailable: e.target.checked }))} className="rounded text-primary focus:ring-primary h-4 w-4" />
            <label htmlFor="isAvailable" className="text-sm font-medium text-neutral-700">Đang mở bán</label>
          </div>
          <div className="flex gap-4 mt-6 pt-4 border-t border-neutral-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium">Hủy</button>
            <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-medium">Lưu thay đổi</button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Xóa món này?"
        message="Thao tác này sẽ xóa món khỏi thực đơn và không thể hoàn tác nếu món chưa có dữ liệu quá khứ."
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
