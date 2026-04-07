import React, { useState } from 'react';
import { AdminModal } from './AdminModal';
import { AdminTable } from '../../../types';
import { adminService } from '../../../services/adminService';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
  table: AdminTable | null;
}

export const WalkInModal = ({ isOpen, onClose, table }: WalkInModalProps) => {
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!table) return;

    setIsSubmitting(true);
    setError('');

    try {
      await adminService.startWalkIn(table.id, { guestName: guestName.trim() || 'Khách vãng lai' });
      setGuestName('');
      onClose(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi bắt đầu phiên vãng lai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!table) return null;

  return (
    <AdminModal isOpen={isOpen} onClose={() => onClose(false)} title={`Bắt đầu vãng lai - Bàn ${table.tableNumber}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Tên khách (Tuỳ chọn)</label>
          <input
            type="text"
            placeholder="Nhập tên khách..."
            className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
          <p className="text-xs text-neutral-500 mt-1">Mặc định là "Khách vãng lai" nếu để trống.</p>
        </div>

        <div className="flex gap-4 mt-6">
          <button type="button" onClick={() => onClose(false)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium transition-colors hover:bg-neutral-200">Hủy</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-primary text-white rounded-xl font-medium disabled:opacity-50 transition-colors hover:bg-primary-container hover:text-white">
            {isSubmitting ? 'Đang xử lý...' : 'Bắt đầu tính giờ'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};
