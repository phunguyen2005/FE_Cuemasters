import React from 'react';
import { LayoutDashboard, MonitorPlay, Users, Coffee, CreditCard, PieChart } from 'lucide-react';
import { ViewType } from '../types';

export const Sidebar = ({ activeView, setActiveView }: { activeView: ViewType, setActiveView: (v: ViewType) => void }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { id: 'tables', icon: MonitorPlay, label: 'Quản lý bàn' },
    { id: 'coaches', icon: Users, label: 'Quản lý HLV' },
    { id: 'menu', icon: Coffee, label: 'Thực đơn F&B' },
    { id: 'membership', icon: CreditCard, label: 'Gói thành viên' },
    { id: 'revenue', icon: PieChart, label: 'Báo cáo doanh thu' },
  ];

  return (
    <div className="w-64 bg-neutral-900 text-white h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center font-bold text-lg">P</div>
        <span className="font-headline font-bold text-xl tracking-tight">Precision</span>
      </div>
      <nav className="flex-1 mt-6 pr-4">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-6 py-3 mb-1 transition-colors ${isActive
                ? 'bg-neutral-800 text-primary rounded-r-full border-l-4 border-primary'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-r-full border-l-4 border-transparent'
                }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-6 border-t border-neutral-800">
        <div className="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80" alt="Admin" className="w-10 h-10 rounded-full object-cover" />
          <div className="text-left">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-neutral-400">Quản lý hệ thống</p>
          </div>
        </div>
      </div>
    </div>
  );
};