import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../../services/adminService';
import { Plus, TrendingUp, TrendingDown, MoreVertical, Edit, AlertCircle, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { PERCENT_WIDTH_CLASS, PERCENT_HEIGHT_CLASS } from '../utils';

export const RevenueView = () => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Add date range filter
  const [dateFilter, setDateFilter] = useState<'today'|'week'|'month'|'custom'>('month');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  const loadData = () => {
    let from, to;
    const now = new Date();
    if (dateFilter === 'today') {
      from = new Date(now.setHours(0,0,0,0)).toISOString();
      to = new Date(now.setHours(23,59,59,999)).toISOString();
    } else if (dateFilter === 'week') {
      const first = now.getDate() - now.getDay() + 1;
      const last = first + 6;
      from = new Date(now.setDate(first)).toISOString();
      to = new Date(now.setDate(last)).toISOString();
    } else if (dateFilter === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    } else if (dateFilter === 'custom' && customRange.from && customRange.to) {
      from = new Date(customRange.from).toISOString();
      to = new Date(customRange.to).toISOString();
    }

    const params = (from && to) ? { from, to } : undefined;
    adminService.getStats(params).then(data => setStats(data)).catch(console.error);
    adminService.getAnalytics(params).then(data => setAnalytics(data)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, [dateFilter, customRange]);

  const heatmapMatrix = useMemo(() => {
    if (!analytics?.occupancyHeatmap) return [];
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
    analytics.occupancyHeatmap.forEach((cell: any) => {
      matrix[cell.dayOfWeek][cell.hour] = cell.occupancyRate;
    });
    return matrix;
  }, [analytics]);

  const occupancyTrend = useMemo(() => {
    if (!analytics?.occupancyHeatmap) return [0, 0, 0, 0];
    let morning = 0, afternoon = 0, evening = 0, night = 0;
    let mr = 0, ar = 0, er = 0, nr = 0;
    analytics.occupancyHeatmap.forEach((cell: any) => {
      if (cell.hour >= 8 && cell.hour < 12) { morning += cell.occupancyRate; mr++; }
      else if (cell.hour >= 12 && cell.hour < 18) { afternoon += cell.occupancyRate; ar++; }
      else if (cell.hour >= 18 && cell.hour < 23) { evening += cell.occupancyRate; er++; }
      else { night += cell.occupancyRate; nr++; }
    });
    return [
      mr ? Math.round(morning / mr) : 0,
      ar ? Math.round(afternoon / ar) : 0,
      er ? Math.round(evening / er) : 0,
      nr ? Math.round(night / nr) : 0
    ];
  }, [analytics]);

  if (!stats || !analytics) return <div className="p-8 text-white">Đang tải...</div>;

  const maxRevenue = Math.max(...(analytics.revenueByPeriod?.map((p: any) => p.revenue) || [1]));
  const totalRevenuePeriod = analytics.revenueByPeriod?.reduce((sum: number, p: any) => sum + p.revenue, 0) || 0;
  const targetPercent = Math.min(100, Math.round((totalRevenuePeriod / 1000000000) * 100));

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Date Filter Bar */}
      <div className="flex justify-between items-center bg-surface-lowest p-4 rounded-xl border border-neutral-100 shadow-sm">
        <h2 className="text-xl font-headline font-bold">Báo cáo doanh thu</h2>
        <div className="flex gap-2 items-center">
          <div className="flex bg-surface-low rounded-lg p-1 border border-neutral-200">
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: 'week', label: 'Tuần này' },
              { id: 'month', label: 'Tháng này' },
              { id: 'custom', label: 'Tùy chỉnh' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors \${dateFilter === f.id ? 'bg-primary text-white shadow' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {dateFilter === 'custom' && (
            <div className="flex gap-2 items-center ml-2 border-l border-neutral-200 pl-4">
              <input type="date" value={customRange.from} onChange={e => setCustomRange({...customRange, from: e.target.value})} className="border border-neutral-200 rounded px-2 py-1 text-sm bg-surface-lowest" />
              <span>-</span>
              <input type="date" value={customRange.to} onChange={e => setCustomRange({...customRange, to: e.target.value})} className="border border-neutral-200 rounded px-2 py-1 text-sm bg-surface-lowest" />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Tổng doanh thu', value: `${stats.revenue.toLocaleString()}đ`, trend: '+12.5%', isUp: true },
          { label: 'Bàn trống', value: `${stats.availableTables}`, trend: '+5.2%', isUp: true },
          { label: 'Phiên đang hoạt động', value: `${stats.activeSessions}`, trend: '-2.1%', isUp: false },
          { label: 'Tổng lượt đặt', value: `${stats.totalBookings}`, trend: '+8.4%', isUp: true },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <p className="text-sm text-neutral-500 font-medium mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-headline font-bold text-neutral-900">{kpi.value}</h3>
              <div className={`flex items-center text-sm font-medium ${kpi.isUp ? 'text-tertiary' : 'text-primary'}`}>
                {kpi.isUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Structure */}
        <div className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="font-headline font-bold text-lg mb-6">Cơ cấu Doanh thu</h3>
          <div className="space-y-5">
            {[
              { label: 'Tiền giờ chơi', val: 65, color: 'bg-primary' },      
              { label: 'Dịch vụ F&B', val: 25, color: 'bg-tertiary' },       
              { label: 'Huấn luyện viên', val: 10, color: 'bg-neutral-800' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-neutral-700">{item.label}</span>
                  <span className="font-bold">{item.val}%</span>
                </div>
                <div className="h-2 bg-surface-low rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="col-span-2 bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold text-lg">Biểu đồ doanh thu</h3>
          </div>
          <div className="h-48 flex items-end gap-2 justify-between mt-4">      
            {analytics.revenueByPeriod?.map((p: any, i: number) => {
              const heightPercent = maxRevenue > 0 ? (p.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-1 group h-full">
                  <div className="w-full bg-surface-low rounded-t-md relative h-full flex items-end">
                    <div
                      className={`w-full bg-primary rounded-t-md transition-all duration-300 group-hover:opacity-80`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                      {p.revenue.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-3 px-1">
            {analytics.revenueByPeriod?.map((p: any, i: number) => (
              <span key={i} className="flex-1 text-center truncate px-1">{p.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Heatmap */}
        <div className="col-span-2 bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="font-headline font-bold text-lg mb-4">Bản đồ nhiệt giờ cao điểm</h3>
          <div className="grid grid-cols-8 gap-1">
            <div className="col-span-1 grid grid-rows-7 gap-1 text-xs text-neutral-400 font-medium text-right pr-2 pt-6">
              <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
            </div>
            <div className="col-span-7">
              <div className="grid grid-cols-6 gap-1 text-xs text-neutral-400 font-medium mb-2">
                <div>00:00</div><div>04:00</div><div>08:00</div><div>12:00</div><div>16:00</div><div>20:00</div>
              </div>
              <div className="grid grid-rows-7 gap-1">
                {heatmapMatrix.map((rowArr, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-24 gap-1 h-4">       
                    {rowArr.map((rate, colIdx) => {
                      let opacity = Number(rate) / 100;
                      if (opacity < 0.1) opacity = 0.1;
                      return (
                        <div key={colIdx} className={`bg-primary rounded-sm`} style={{ opacity: opacity }} title={`${rate}%`}></div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="bg-surface-lowest p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="font-headline font-bold text-lg mb-6">Xu hướng lấp đầy</h3>
          <div className="space-y-4">
            {['Sáng (08:00 - 12:00)', 'Chiều (12:00 - 18:00)', 'Tối (18:00 - 23:00)', 'Đêm (23:00 - 08:00)'].map((time, i) => {
              const val = occupancyTrend[i];
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-500">{time}</span>
                    <span className="font-bold">{val}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-low rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-800" style={{ width: `${val}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Target Card */}
        <div className="bg-primary text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div>
            <h3 className="font-headline font-bold text-lg mb-2 relative z-10">Mục tiêu doanh thu</h3>
            <p className="text-primary-container-foreground/80 text-sm mb-6 relative z-10">Đạt {targetPercent}% mục tiêu kỷ kỳ này</p>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2 relative z-10">
              {(totalRevenuePeriod / 1000000).toFixed(0)}M 
              <span className="text-lg font-normal opacity-80 pl-2">/ 1B</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-white" style={{ width: `${targetPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
