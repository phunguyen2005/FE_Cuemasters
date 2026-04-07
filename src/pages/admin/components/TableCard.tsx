import React, { useState, useEffect } from 'react';
import { Clock, Users } from 'lucide-react';
import { AdminTable } from '../../../types';

const formatElapsed = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const TableCard = ({ 
  table, 
  booking,
  onClick,
  onCheckin,
  onCheckout
}: { 
  table: AdminTable, 
  booking?: any,
  onClick?: (table: AdminTable) => void,
  onCheckin?: (bookingId: string) => void,
  onCheckout?: (booking: any, table: AdminTable) => void
}) => {
  const status = table.displayStatus;
  let statusColor = 'border-neutral-200';
  let badgeColor = 'bg-neutral-100 text-neutral-500';

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== 'InUse' || !table.currentSessionStartedAt) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [status, table.currentSessionStartedAt]);

  if (status === 'InUse') {
    statusColor = 'border-primary';
    badgeColor = 'bg-red-50 text-primary';
  } else if (status === 'Available') {
    statusColor = 'border-tertiary';
    badgeColor = 'bg-teal-50 text-tertiary';
  } else if (status === 'Reserved') {
    statusColor = 'border-amber-500';
    badgeColor = 'bg-amber-50 text-amber-600';
  } else if (status === 'Maintenance') {
    statusColor = 'border-neutral-300';
    badgeColor = 'bg-neutral-100 text-neutral-600';
  }

  const statusLabel = status === 'InUse' ? 'Đang chơi' : status === 'Available' ? 'Trống' : status === 'Reserved' ? 'Đã đặt' : status === 'Maintenance' ? 'Bảo trì' : status;

  return (
    <div onClick={() => onClick?.(table)} className={`p-4 rounded-xl border-2 flex flex-col ${statusColor} bg-surface-lowest relative group cursor-pointer hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-neutral-900">{table.tableNumber}</h4>
          <p className="text-xs text-neutral-500">{table.type}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-2 mt-auto mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500 flex items-center gap-1"><Clock size={14} /> {status === 'Reserved' ? 'Giờ đặt' : 'Thời gian'}</span>
          <span className="font-medium text-neutral-900">
             {status === 'Reserved' 
               ? (table.nextBookingStartTime ? new Date(table.nextBookingStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--")
               : (table.currentSessionStartedAt ? new Date(table.currentSessionStartedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--")}
          </span>
        </div>
        {status === 'InUse' && table.currentSessionStartedAt && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 flex items-center gap-1">Đã chơi</span>
            <span className="font-bold text-primary">
              {formatElapsed(Math.max(0, Math.floor((now - new Date(table.currentSessionStartedAt).getTime()) / 60000)))}
            </span>
          </div>
        )}
        {table.currentCustomerName && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 flex items-center gap-1"><Users size={14} /> Khách</span>
            <span className="font-medium text-neutral-900 truncate max-w-[100px]">{table.currentCustomerName}</span>
          </div>
        )}
        {((table.currentSessionAmount ?? 0) > 0) && (
          <div className="flex justify-between text-sm pt-2 border-t border-neutral-100 mt-2">
            <span className="text-neutral-500">Tạm tính</span>
            <span className="font-bold text-primary">{`${table.currentSessionAmount?.toLocaleString()}đ`}</span>
          </div>
        )}
      </div>

      {status === 'Reserved' && booking && (
        <button 
          onClick={(e) => { e.stopPropagation(); onCheckin?.(booking.id); }}
          className="mt-2 w-full py-2 bg-tertiary text-white rounded-lg font-bold text-sm hover:bg-tertiary/90 transition-colors"
        >
          Check-in Khách
        </button>
      )}

      {status === 'InUse' && booking && (
        <button 
          onClick={(e) => { e.stopPropagation(); onCheckout?.(booking, table); }}
          className="mt-2 w-full py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-600 transition-colors"
        >
          Thanh toán
        </button>
      )}
    </div>
  );
};
