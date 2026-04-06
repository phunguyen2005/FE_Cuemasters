import React from 'react';
import { Screen, ScreenProps } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps extends ScreenProps {
  activeScreen: Screen;
}

const navItems: { screen: Screen; label: string }[] = [
  { screen: 'floorPlan', label: 'Trang chủ' },
  { screen: 'coaches', label: 'Huấn luyện viên' },
  { screen: 'membershipTiers', label: 'Thành viên' },
  { screen: 'bookingHistory', label: 'Lịch sử đặt chỗ' },
  { screen: 'settings', label: 'Bảng điều khiển' },
];

export default function Header({ onNavigate, activeScreen }: HeaderProps) {
  const logout = useAuthStore(s => s.logout);
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <nav className="flex justify-between items-center max-w-[1440px] mx-auto px-8 py-5">
        {/* Logo */}
        <button
          onClick={() => onNavigate('floorPlan')}
          className="text-2xl font-black uppercase tracking-tighter text-primary font-headline"
        >
          CueMasters
        </button>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(({ screen, label }) => {
            const isActive = activeScreen === screen;
            return (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className={`text-sm font-semibold transition-all duration-300 font-headline ${
                  isActive
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Account */}
        <div className="flex items-center gap-4">
          <button title="Đăng xuất" onClick={() => logout()} className="transition-all duration-300 hover:text-red-500 mr-2"><span className="material-symbols-outlined text-[28px]">logout</span></button>
          <button
            onClick={() => onNavigate('settings')}
            className="transition-all duration-300 hover:opacity-80 active:scale-95"
          >
            <span className="material-symbols-outlined text-secondary hover:text-on-surface text-[28px]">
              account_circle
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
