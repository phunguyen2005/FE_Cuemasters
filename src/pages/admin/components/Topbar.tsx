import React from 'react';
import { Search, HelpCircle, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

export const Topbar = ({ title }: { title: string }) => {
  const logout = useAuthStore(s => s.logout);
  return (
    <header className="h-20 bg-surface-lowest border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <h1 className="text-2xl font-headline font-bold text-neutral-900">{title}</h1>
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 py-2 bg-surface-low border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
          />
        </div>
        <div className="flex items-center gap-4 text-neutral-500">
          <button
            aria-label="Tro giup"
            title="Tro giup"
            type="button"
            className="hover:text-primary transition-colors"
          >
            <HelpCircle size={20} />
          </button>
          <button
            aria-label="Thong bao"
            title="Thong bao"
            type="button"
            className="relative hover:text-primary transition-colors"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <button title="Đăng xuất" aria-label="Đăng xuất" onClick={() => logout()} className="hover:text-red-500 transition-colors ml-2">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

// --- Views ---