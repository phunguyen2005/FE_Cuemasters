import React, { useState, useEffect } from 'react';
import { X, Coffee, Minus, Plus } from 'lucide-react';
import { fnbService } from '../../../services/fnbService';

export const InSessionOrderPanel = ({ isOpen, onClose, table, bookingId }: any) => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [order, setOrder] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fnbService.getMenuItems().then(setMenuItems).catch(console.error);
      setOrder([]); // reset order when opened
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = (item: any) => {
    setOrder(prev => {
      const ex = prev.find(o => o.menuItemId === item.id);
      if (ex) return prev.map(o => o.menuItemId === item.id ? { ...o, quantity: o.quantity + 1 } : o);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleRemove = (id: number) => {
    setOrder(prev => {
      const ex = prev.find(o => o.menuItemId === id);
      if (ex && ex.quantity > 1) return prev.map(o => o.menuItemId === id ? { ...o, quantity: o.quantity - 1 } : o);
      return prev.filter(o => o.menuItemId !== id);
    });
  };

  const total = order.reduce((sum, o) => sum + (o.price * o.quantity), 0);

  const handleSubmit = async () => {
    if (!bookingId || order.length === 0) return;
    setSubmitting(true);
    try {
      await fnbService.createOrderForBooking(bookingId, order.map(o => ({ menuItemId: o.menuItemId, quantity: o.quantity })));
      alert("Đã thêm món thành công!");
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Error creating F&B order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[70] w-96 bg-white shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b flex justify-between items-center bg-neutral-50 text-neutral-900">
        <div>
          <h2 className="font-bold text-lg">{table?.tableNumber || table?.name || "Bàn đang sử dụng"}</h2>
          <p className="text-sm text-neutral-500">Khách: {table?.currentCustomerName || 'Vãng lai'}</p>
        </div>
        <button aria-label="Đóng bảng gọi món" title="Đóng" onClick={onClose} className="p-2 bg-white rounded-full text-neutral-500 hover:text-black border border-neutral-200 shadow-sm"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h3 className="font-semibold text-neutral-700 flex items-center gap-2"><Coffee size={16} /> Chọn thực đơn</h3>
        <div className="space-y-3">
          {menuItems.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-primary font-bold">{item.price?.toLocaleString()}đ</p>
              </div>
              <button 
                aria-label={`Thêm ${item.name}`}
                title={`Thêm ${item.name}`}
                onClick={() => handleAdd(item)}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t bg-neutral-50 p-6 space-y-4">
        {order.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase">Hóa đơn F&B</h4>
            {order.map(o => (
              <div key={o.menuItemId} className="flex justify-between items-center text-sm">
                <span className="flex-1">{o.name}</span>
                <div className="flex items-center justify-center gap-2 w-24">
                  <button aria-label={`Giảm số lượng ${o.name}`} title={`Giảm số lượng ${o.name}`} onClick={() => handleRemove(o.menuItemId)} className="p-1 bg-white rounded shadow-sm hover:bg-neutral-200"><Minus size={12} /></button>
                  <span className="w-4 text-center font-medium">{o.quantity}</span>
                  <button aria-label={`Tăng số lượng ${o.name}`} title={`Tăng số lượng ${o.name}`} onClick={() => handleAdd({ id: o.menuItemId })} className="p-1 bg-white rounded shadow-sm hover:bg-neutral-200"><Plus size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
          <span className="font-semibold">Tổng tạm tính:</span>
          <span className="font-bold text-primary text-xl">{total.toLocaleString()}đ</span>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={order.length === 0 || submitting}
          className="w-full py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {submitting ? 'Đang gọi món...' : 'Gửi yêu cầu'}
        </button>
      </div>
    </div>
  );
};
