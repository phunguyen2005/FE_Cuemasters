import React, { useState, useEffect } from 'react';
import { X, Receipt, Wallet, Banknote, CreditCard } from 'lucide-react';
import { adminService } from '../../../services/adminService';

export const CheckoutPanel = ({ isOpen, onClose, table, booking }: any) => {
  const [submitting, setSubmitting] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkableSessions, setLinkableSessions] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'VnPay'>('Cash');

  useEffect(() => {
    if (isOpen && booking?.id) {
      adminService.getAvailableCoachSessions(booking.id)
        .then((res: any) => setLinkableSessions(res))
        .catch((err: any) => console.error("Could not fetch linkable coach sessions:", err));
    }
  }, [isOpen, booking]);

  const handleLinkCoach = async (sessionId: string) => {
    setLinking(true);
    try {
      await adminService.linkCoachSession(booking.id, { coachingSessionId: sessionId });
      alert('Đã gộp phí HLV thành công! Vui lòng mở lại bảng thanh toán để xem hóa đơn mới.');
      onClose(true); // Triggers reload and close
    } catch (e: any) {
      alert(e.response?.data?.message || 'Có lỗi khi gộp HLV');
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      await adminService.checkoutBooking(booking.id, { paymentMethod });
      alert("Thanh toán thành công!");
      onClose(true); // pass true to indicate success
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Lỗi khi thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  const tableCost = booking ? ((booking.actualCost || booking.totalPrice) - (booking.fnBTotal || 0) - (booking.coachingTotal || 0) + (booking.discountAmount || 0)) : 0;
  const discount = booking?.discountAmount || 0;
  const deposit = booking?.depositAmount || 0;
  const totalCost = booking?.actualCost || booking?.totalPrice || 0;
  const amountDue = Math.max(0, totalCost - deposit);
  
  return (
    <div className="fixed inset-y-0 right-0 z-[70] w-[400px] bg-white shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b flex justify-between items-center bg-neutral-50 text-neutral-900">
        <div>
          <h2 className="font-bold text-lg">{table?.tableNumber || table?.name || "Thanh toán bàn"}</h2>
          <p className="text-sm text-neutral-500">Khách: {booking?.userFullName || table?.currentCustomerName || 'Vãng lai'}</p>
        </div>
        <button aria-label="Đóng bảng thanh toán" title="Đóng" onClick={() => onClose(false)} className="p-2 bg-white rounded-full text-neutral-500 hover:text-black border border-neutral-200 shadow-sm">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2"><Receipt size={20} className="text-primary"/> Chi tiết hóa đơn</h3>
        
        <div className="bg-surface-low rounded-xl border border-neutral-100 p-4 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-neutral-600">Tiền bàn</span>
            <span className="font-medium text-neutral-900">{tableCost.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-600">Dịch vụ F&B</span>
            <span className="font-medium text-neutral-900">{booking?.fnBTotal?.toLocaleString() || 0}đ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-600">Phí huấn luyện viên</span>
            <span className="font-medium text-neutral-900">{booking?.coachingTotal?.toLocaleString() || 0}đ</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-tertiary">
              <span className="font-medium">Giảm giá thành viên</span>
              <span className="font-bold">-{discount.toLocaleString()}đ</span>
            </div>
          )}
          {deposit > 0 && (
            <div className="flex justify-between items-center text-emerald-600">
              <span className="font-medium">Tiền cọc trước</span>
              <span className="font-bold">-{deposit.toLocaleString()}đ</span>
            </div>
          )}
          
          <div className="pt-3 border-t border-dashed border-neutral-300 flex flex-col gap-1">
            <div className="flex justify-between items-center">
               <span className="font-bold text-neutral-900 text-base">Tổng chi phí</span>
               <span className="font-bold text-neutral-500 text-lg">{totalCost.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center mt-1">
               <span className="font-black text-primary text-xl">KHÁCH CẦN TRẢ</span>
               <span className="font-black text-primary text-2xl">{amountDue.toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        {linkableSessions?.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-headline font-bold text-lg flex items-center gap-2 text-primary">Phiên Dạy Kèm (Chưa tính)</h3>
            <div className="flex flex-col gap-3">
              {linkableSessions.map((session, i) => (
                <div key={i} className="p-3 border border-tertiary/30 bg-teal-50 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">HLV: {session.coachName}</p>
                    <p className="text-xs text-neutral-500">{session.sessionDate.slice(0, 10)} | {session.startTime} - {session.endTime}</p>
                    <p className="text-sm font-bold text-tertiary">{session.cost?.toLocaleString()}đ</p>
                  </div>
                  <button 
                    disabled={linking}
                    onClick={() => handleLinkCoach(session.id)}
                    className="px-3 py-1 bg-tertiary text-white rounded font-bold text-[10px] uppercase tracking-wider hover:bg-teal-700 transition"
                  >
                    {linking ? 'Đang gộp...' : '+ Gộp Bill'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-headline font-bold text-lg flex items-center gap-2"><Wallet size={20} className="text-primary"/> Phương thức TT</h3>
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => setPaymentMethod('Cash')}
              className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'Cash' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 hover:border-primary/50 text-neutral-500'
              }`}
            >
              <Banknote size={24} />
              <span className="font-medium text-sm">Tiền mặt</span>
            </div>
            <div 
              onClick={() => setPaymentMethod('VnPay')}
              className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'VnPay' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 hover:border-primary/50 text-neutral-500'
              }`}
            >
              <CreditCard size={24} />
              <span className="font-medium text-sm">Chuyển khoản (VnPay)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-neutral-50 border-t border-neutral-200">
        <button 
          onClick={handleSubmit}
          disabled={!booking || submitting}
          className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none hover:bg-primary-600 transition-all"
        >
          {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
        </button>
      </div>
    </div>
  );
};
