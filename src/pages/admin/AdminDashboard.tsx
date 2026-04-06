/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ViewType } from './types';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AlertCircle } from 'lucide-react';

import { DashboardView } from './views/DashboardView';
import { RevenueView } from './views/RevenueView';
import { MenuView } from './views/MenuView';
import { CoachesView } from './views/CoachesView';
import { TablesView } from './views/TablesView';
import { MembershipView } from './views/MembershipView';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'revenue': return <RevenueView />;
      case 'menu': return <MenuView />;
      case 'coaches': return <CoachesView />;
      case 'tables': return <TablesView />;
      case 'membership': return <MembershipView />;
      default: return (
        <div className="p-8 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-neutral-300 mb-4" /> 
            <h2 className="text-xl font-headline font-bold text-neutral-700">Tính năng đang phát triển</h2>
            <p className="text-neutral-500 mt-2">Vui lòng chọn các mục khác trong menu bên trái.</p>
          </div>
        </div>
      );
    }
  };

  const getTitle = () => {
    switch (activeView) {
      case 'revenue': return 'Phân tích Doanh thu';
      case 'menu': return 'Menu Precision';
      case 'coaches': return 'Quản lý Huấn luyện viên';
      case 'tables': return 'Sơ đồ vận hành thời gian thực';
      case 'dashboard': return 'Bảng điều khiển';
      case 'membership': return 'Gói thành viên';
      default: return 'The Precision Atelier';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar title={getTitle()} />
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
