import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { Clock, Users, Coffee } from 'lucide-react';
import { TableCard } from '../components/TableCard';
import { useSignalR } from '../../../hooks/useSignalR';
import { useTableStore } from '../../../stores/tableStore';
import { InSessionOrderPanel } from '../components/InSessionOrderPanel';
import { AdminTable } from '../../../types';
import { CheckoutPanel } from '../components/CheckoutPanel';

export const DashboardView = () => {
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [adminTables, setAdminTables] = useState<AdminTable[]>([]);
  
  // Use global table store for tables to leverage SignalR
  const { tables: storeTables, fetchTables } = useTableStore();
  useSignalR();
  const [orderPanelTable, setOrderPanelTable] = useState<any>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<{booking: any, table: AdminTable} | null>(null);

  const fetchData = async () => {
    try {
      const [statsData, bookingsData, tablesData] = await Promise.all([
        adminService.getStats(),
        adminService.getBookings(), // took out arguments to match service
        adminService.getTables()
      ]);
      setStats(statsData);
      setBookings(bookingsData.items || bookingsData);
      setAdminTables(Array.isArray(tablesData) ? tablesData : []);
      await fetchTables();
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Merge admin info with real-time status from SignalR via store
  const displayTables: AdminTable[] = adminTables.map(at => {
    const storeTable = storeTables.find(t => t.id === at.id);
    if (storeTable && storeTable.status && storeTable.status !== at.displayStatus) {
      return { ...at, displayStatus: storeTable.status };
    }
    return at;
  });

  const inUseTables = displayTables.filter(t => t.displayStatus === 'InUse').length;
  const occupancyRate = displayTables.length > 0 ? Math.round((inUseTables / displayTables.length) * 100) : 0;

  const handleCheckin = async (bookingId: string) => {
    try {
      await adminService.checkinBooking(bookingId);
      alert("Check-in thành công!");
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Lỗi check-in");
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'InProgress');

  const upcomingBookings = bookings
    .filter(b => b.status === 'Confirmed' && new Date(b.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const activeFnBBookings = bookings
    .filter(b => b.status === 'InProgress' && b.fnBTotal > 0);

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Tỷ lệ lấp đầy hiện tại', value: `${occupancyRate}%`, sub: `${inUseTables}/${displayTables.length} bàn đang hoạt động` },
          { label: 'Doanh thu hôm nay', value: `${(stats?.revenue || 0).toLocaleString()}đ`, sub: '+0% so với hôm qua' },
          { label: 'Doanh thu tuần này', value: `${(stats?.weeklyRevenue || (stats?.revenue || 0)).toLocaleString()}đ`, sub: 'Đạt yêu cầu' },
          { label: 'Bàn đang trống', value: `${stats?.availableTables ?? (displayTables.length - inUseTables)}`, sub: 'Trực tiếp từ sơ đồ' },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <p className="text-sm text-neutral-500 font-medium mb-2">{kpi.label}</p>
            <h3 className="text-2xl font-headline font-bold text-neutral-900 mb-1">{kpi.value}</h3>
            <p className="text-xs text-neutral-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Grid */}
        <div className="col-span-2 bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold text-lg">Sơ đồ vận hành thời gian thực</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-tertiary"></span> Trống</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary"></span> Đang chơi</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Đã đặt</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-neutral-300"></span> Bảo trì</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {displayTables.map((table) => {
              const booking = activeBookings.find(b => b.tableId === table.id && b.status === (table.displayStatus === 'Reserved' ? 'Confirmed' : 'InProgress'));
              return (
                <TableCard 
                  key={table.id} 
                  table={table} 
                  booking={booking}
                  onClick={(t) => { if (t.displayStatus === 'InUse') setOrderPanelTable(t); }} 
                  onCheckin={handleCheckin}
                  onCheckout={(b, t) => setCheckoutBooking({ booking: b, table: t })}
                />
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-lg">Lượt đặt sắp tới</h3>
              <button className="text-primary text-sm font-medium hover:underline">Xem tất cả</button>
            </div>
            <div className="relative border-l-2 border-neutral-100 ml-3 space-y-6 pb-2">
              {upcomingBookings.length > 0 ? upcomingBookings.map((booking: any, i: number) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-lowest border-2 border-amber-500"></div>
                  <p className="text-sm font-bold text-neutral-900">{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {booking.userFullName || 'Khách Vãng Lai'}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Bàn {booking.tableNumber || booking.tableId}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{booking.userEmail}</p>
                </div>
              )) : (
                <div className="text-sm text-neutral-500 pl-6">Không có lượt đặt nào sắp tới</div>
              )}
            </div>
          </div>

          <div className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <h3 className="font-headline font-bold text-lg mb-4">Yêu cầu F&B</h3>
            <div className="space-y-3">
              {activeFnBBookings.length > 0 ? activeFnBBookings.map((b: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-surface-low border border-neutral-100">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Coffee size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Bàn {b.tableNumber || b.tableId}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">Giá trị đơn: {b.fnBTotal.toLocaleString()}đ</p>
                    <p className="text-[10px] text-neutral-400 mt-1">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-neutral-500 p-2">Không có yêu cầu F&B</div>
              )}
            </div>
          </div>
              </div>
    </div>
    <InSessionOrderPanel 
      isOpen={!!orderPanelTable}
      onClose={() => { setOrderPanelTable(null); fetchData(); }}
      table={orderPanelTable}
      bookingId={bookings.find((b: any) => b.tableId === orderPanelTable?.id && b.status === 'InProgress')?.id}
    />
    <CheckoutPanel 
      isOpen={!!checkoutBooking}
      onClose={(success: boolean) => { setCheckoutBooking(null); if (success) fetchData(); }}
      table={checkoutBooking?.table}
      booking={checkoutBooking?.booking}
    />
  </div>
);
};
