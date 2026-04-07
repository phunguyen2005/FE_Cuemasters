import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { Plus, Search, Edit, Trash2, Map, List, Clock, Users } from 'lucide-react';
import { TableCard } from '../components/TableCard';
import { AdminModal } from '../components/AdminModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { InSessionOrderPanel } from '../components/InSessionOrderPanel';
import { CheckoutPanel } from '../components/CheckoutPanel';
import { AdminTable, TableType, TableStatus } from '../../../types';

const LiveElapsedTime = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => {
      if (!startTime) return;
      const diff = Math.max(0, Date.now() - new Date(startTime).getTime());
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      setElapsed(hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600">{elapsed}</span>;
};


export const TablesView = () => {
  const [adminTables, setAdminTables] = useState<AdminTable[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal logic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<AdminTable | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [orderPanelTable, setOrderPanelTable] = useState<AdminTable | null>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<{booking: any, table: AdminTable} | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tableNumber: '',
    type: 'Pool' as TableType,
    hourlyRate: 50000,
    status: 'Available' as TableStatus
  });

  const loadData = async () => {
    try {
      const data = await adminService.getTables();
      const bookingsData = await adminService.getBookings();
      setBookings(bookingsData.items || bookingsData);
      setAdminTables(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Error fetching tables:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Stats — use displayStatus from admin API directly
  const total = adminTables.length;
  const inUse = adminTables.filter(t => t.displayStatus === 'InUse').length;
  const maints = adminTables.filter(t => t.displayStatus === 'Maintenance').length;
  const available = adminTables.filter(t => t.displayStatus === 'Available').length;

  // Filters
  const filteredData = adminTables.filter(t => {
    const matchSearch = t.tableNumber?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || t.type === filterType;
    const matchStatus = filterStatus === 'All' || t.displayStatus === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const openCreate = () => {
    setEditingTable(null);
    setFormData({ tableNumber: '', type: 'Pool', hourlyRate: 50000, status: 'Available' });
    setIsModalOpen(true);
  };

  const openEdit = (table: AdminTable) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      type: table.type as TableType,
      hourlyRate: table.hourlyRate,
      status: (table.manualStatus || 'Available') as TableStatus
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await adminService.updateTable(editingTable.id, formData);
      } else {
        await adminService.createTable(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      console.error(e); console.error(e.response?.data); alert(e.response?.data?.message || "Error saving table!");
      alert(e.response?.data?.message || e.message || 'Error saving table!');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteTable(deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
      loadData();
    } catch (e: any) {
      console.error(e); console.error(e.response?.data); alert(e.response?.data?.message || "Error saving table!");
      alert(e.response?.data?.message || e.message || 'Error deleting table!');
    }
  };

  const handleCheckin = async (bookingId: string) => {
    try {
      await adminService.checkinBooking(bookingId);
      alert("Check-in thành công!");
      loadData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Lỗi check-in");
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'InProgress');

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <p className="text-sm text-neutral-500 font-medium mb-2">Tổng số bàn</p>
          <h3 className="text-2xl font-headline font-bold text-neutral-900 mb-1">{total}</h3>
          <p className="text-xs text-neutral-400">Tất cả khu vực</p>
        </div>
        <div className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <p className="text-sm text-neutral-500 font-medium mb-2">Bàn đang trống</p>
          <h3 className="text-2xl font-headline font-bold text-tertiary mb-1">{available}</h3>
          <p className="text-xs text-neutral-400">Sẵn sàng phục vụ</p>
        </div>
        <div className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <p className="text-sm text-neutral-500 font-medium mb-2">Đang sử dụng</p>
          <h3 className="text-2xl font-headline font-bold text-primary mb-1">{inUse}</h3>
          <p className="text-xs text-neutral-400">Khách đang chơi</p>
        </div>
        <div className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <p className="text-sm text-neutral-500 font-medium mb-2">Đang bảo trì</p>
          <h3 className="text-2xl font-headline font-bold text-amber-500 mb-1">{maints}</h3>
          <p className="text-xs text-neutral-400">Cần sửa chữa</p>
        </div>
      </div>

      <div className="bg-surface-lowest rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-xl font-headline font-bold">Danh sách Bàn</h2>
          <div className="flex items-center gap-4">
            <div className="bg-neutral-100 p-1 rounded-lg flex items-center">
              <button 
                aria-label="Chuyển sang danh sách"
                title="Danh sách"
                onClick={() => setViewMode('list')} 
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                <List size={18} />
              </button>
              <button 
                aria-label="Chuyển sang sơ đồ"
                title="Sơ đồ"
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                <Map size={18} />
              </button>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors">
              <Plus size={18} />
              Thêm bàn mới
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bàn..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select aria-label="Lọc theo loại bàn" title="Lọc theo loại bàn" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="py-2 px-4 rounded-xl border border-neutral-200 focus:outline-none">
            <option value="All">Tất cả loại bàn</option>
            <option value="Pool">Pool</option>
            <option value="Snooker">Snooker</option>
            <option value="Carom">Carom</option>
          </select>
          <select aria-label="Lọc theo trạng thái bàn" title="Lọc theo trạng thái bàn" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="py-2 px-4 rounded-xl border border-neutral-200 focus:outline-none">
            <option value="All">Tất cả trạng thái</option>
            <option value="Available">Trống</option>
            <option value="Reserved">Đã đặt</option>
            <option value="InUse">Đang sử dụng</option>
            <option value="Maintenance">Bảo trì</option>
          </select>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-low border-b border-neutral-200">
                  <th className="py-3 px-4 font-semibold text-sm text-neutral-600">Số bàn</th>
                  <th className="py-3 px-4 font-semibold text-sm text-neutral-600">Loại bàn</th>
                  <th className="py-3 px-4 font-semibold text-sm text-neutral-600">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-sm text-neutral-600">Khách / Lịch</th>
                  <th className="py-3 px-4 font-semibold text-sm text-neutral-600">Đơn giá / Giờ</th>
                  <th className="py-3 px-4 font-semibold text-sm text-neutral-600 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(table => {
                  const status = table.displayStatus;
                  const booking = activeBookings.find(b => b.tableId === table.id && b.status === (table.displayStatus === 'Reserved' ? 'Confirmed' : 'InProgress'));
                  let badge = "bg-neutral-100 text-neutral-600";
                  if (status === 'InUse') badge = 'bg-red-50 text-red-600';
                  else if (status === 'Available') badge = 'bg-teal-50 text-teal-600';
                  else if (status === 'Reserved') badge = 'bg-amber-50 text-amber-600';
                  else if (status === 'Maintenance') badge = 'bg-neutral-200 text-neutral-700';

                  const statusLabel = status === 'InUse' ? 'Đang chơi' : status === 'Available' ? 'Trống' : status === 'Reserved' ? 'Đã đặt' : status === 'Maintenance' ? 'Bảo trì' : status;

                  return (
                    <tr key={table.id} onClick={() => { if (status === 'InUse') setOrderPanelTable(table); }} className="border-b border-neutral-100 hover:bg-neutral-50/50 cursor-pointer">
                      <td className="py-3 px-4 font-medium">{table.tableNumber}</td>
                      <td className="py-3 px-4 text-sm text-neutral-600">{table.type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${badge}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 min-w-[200px]">
                        {status === 'InUse' ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-neutral-900">{table.currentCustomerName || 'Khách vãng lai'}</span>
                            <div className="flex items-center text-xs text-neutral-500 mt-1">
                              <span className="flex items-center gap-1"><Clock size={12} /> Bắt đầu {table.currentSessionStartedAt ? new Date(table.currentSessionStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                              {table.currentSessionStartedAt && <LiveElapsedTime startTime={table.currentSessionStartedAt} />}
                            </div>
                          </div>
                        ) : status === 'Reserved' ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-neutral-900">{booking?.account?.fullName || booking?.customerName || table.currentCustomerName || 'Khách'}</span>
                            <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                              <Clock size={12} />
                              <span>Đặt lúc {table.nextBookingStartTime ? new Date(table.nextBookingStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                            </div>
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 font-medium text-primary">{table.hourlyRate?.toLocaleString() || 0}đ</td>
                      <td className="py-3 px-4 text-right">
                        <button aria-label={`Sửa bàn ${table.tableNumber}`} title={`Sửa bàn ${table.tableNumber}`} onClick={(e) => { e.stopPropagation(); openEdit(table); }} className="p-2 text-neutral-400 hover:text-primary transition-colors">
                          <Edit size={16} />
                        </button>
                        <button aria-label={`Xóa bàn ${table.tableNumber}`} title={`Xóa bàn ${table.tableNumber}`} onClick={(e) => { e.stopPropagation(); setDeletingId(table.id); setIsDeleteOpen(true); }} className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500">Khong tim thay du lieu.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-100">
                <span className="text-sm text-neutral-500">Trang {currentPage} / {totalPages}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-3 py-1 rounded-lg border border-neutral-200 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1 rounded-lg border border-neutral-200 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100 mt-6">
            {adminTables.map((table) => {
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
        )}
      </div>

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTable ? "Chỉnh sửa bàn" : "Thêm bàn mới"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Số bàn</label>
            <input 
              required
              type="text" 
              title="Số bàn"
              placeholder="Nhập số bàn"
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.tableNumber}
              onChange={e => setFormData(f => ({ ...f, tableNumber: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Loại bàn</label>
            <select 
              aria-label="Loại bàn"
              title="Loại bàn"
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.type}
              onChange={e => setFormData(f => ({ ...f, type: e.target.value as TableType }))}
            >
              <option value="Pool">Pool</option>
              <option value="Snooker">Snooker</option>
              <option value="Carom">Carom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Đơn giá / Giờ</label>
            <input 
              required
              type="number" 
              title="Đơn giá mỗi giờ"
              placeholder="Nhập đơn giá"
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.hourlyRate}
              onChange={e => setFormData(f => ({ ...f, hourlyRate: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Trạng thái</label>
            <select 
              aria-label="Trạng thái bàn"
              title="Trạng thái bàn"
              className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.status}
              onChange={e => setFormData(f => ({ ...f, status: e.target.value as TableStatus }))}
            >
              <option value="Available">Trống (Available)</option>
              
              
              <option value="Maintenance">Bảo trì (Maintenance)</option>
            </select>
          </div>
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium">Hủy</button>
            <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl font-medium">Lưu thay đổi</button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Xóa bàn này?"
        message="Bạn có chắc chắn muốn xóa bàn này? Thao tác này không thể hoàn tác."
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
      <InSessionOrderPanel 
        isOpen={!!orderPanelTable}
        onClose={() => { setOrderPanelTable(null); loadData(); }}
        table={orderPanelTable}
        bookingId={bookings.find((b: any) => b.tableId === orderPanelTable?.id && b.status === 'InProgress')?.id}
      />
      <CheckoutPanel 
        isOpen={!!checkoutBooking}
        onClose={(success: boolean) => { setCheckoutBooking(null); if (success) loadData(); }}
        table={checkoutBooking?.table}
        booking={checkoutBooking?.booking}
      />
    </div>
  );
};
