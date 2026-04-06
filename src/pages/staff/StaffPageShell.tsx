import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface StaffPageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const navItems = [
  { to: '/staff', label: 'Dashboard' },
  { to: '/staff/schedule', label: 'Schedule' },
  { to: '/staff/sessions', label: 'Sessions' },
];

const StaffPageShell: React.FC<StaffPageShellProps> = ({ title, description, children }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleBackToLogin = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-slate-900 px-8 py-7 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-300">CueMasters Staff</p>
              <div>
                <h1 className="text-3xl font-black tracking-tight">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
              </div>
              <p className="text-sm text-slate-400">
                Signed in as {user?.fullName ?? 'Staff member'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Back to login
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/staff'}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-slate-600 shadow-sm hover:bg-slate-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StaffPageShell;
