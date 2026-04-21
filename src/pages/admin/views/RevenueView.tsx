import React, { useEffect, useMemo, useState } from 'react';
import { Eye, TrendingDown, TrendingUp, X } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import {
  AdminAnalytics,
  AdminDashboardStats,
  AdminInvoiceListResponse,
  InvoiceDetail,
} from '../../../types';

type RevenueStructureItem = {
  label: string;
  amount: number;
  val: number;
  color: string;
};

const PERCENT_STEP = 10;

const WIDTH_CLASS_BY_STEP: Record<number, string> = {
  0: 'w-0',
  10: 'w-[10%]',
  20: 'w-[20%]',
  30: 'w-[30%]',
  40: 'w-[40%]',
  50: 'w-1/2',
  60: 'w-[60%]',
  70: 'w-[70%]',
  80: 'w-[80%]',
  90: 'w-[90%]',
  100: 'w-full',
};

const HEIGHT_CLASS_BY_STEP: Record<number, string> = {
  0: 'h-0',
  10: 'h-[10%]',
  20: 'h-[20%]',
  30: 'h-[30%]',
  40: 'h-[40%]',
  50: 'h-1/2',
  60: 'h-[60%]',
  70: 'h-[70%]',
  80: 'h-[80%]',
  90: 'h-[90%]',
  100: 'h-full',
};

const OPACITY_CLASS_BY_STEP: Record<number, string> = {
  10: 'opacity-10',
  20: 'opacity-20',
  30: 'opacity-30',
  40: 'opacity-40',
  50: 'opacity-50',
  60: 'opacity-60',
  70: 'opacity-70',
  80: 'opacity-80',
  90: 'opacity-90',
  100: 'opacity-100',
};

const clampPercent = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const toStep = (value: number, step = PERCENT_STEP) =>
  Math.round(clampPercent(value) / step) * step;

const getWidthClass = (value: number) => WIDTH_CLASS_BY_STEP[toStep(value)] || 'w-0';

const getHeightClass = (value: number) => HEIGHT_CLASS_BY_STEP[toStep(value)] || 'h-0';

const getOpacityClass = (value: number) => {
  const stepped = Math.round(clampPercent(value, 10, 100) / PERCENT_STEP) * PERCENT_STEP;
  return OPACITY_CLASS_BY_STEP[stepped] || 'opacity-100';
};

const startOfDayIso = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const endOfDayIso = (value: Date) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

const getRangeForFilter = (
  dateFilter: 'today' | 'week' | 'month' | 'custom',
  customRange: { from: string; to: string },
) => {
  const now = new Date();

  if (dateFilter === 'today') {
    return {
      from: startOfDayIso(now),
      to: endOfDayIso(now),
      period: 'day',
    };
  }

  if (dateFilter === 'week') {
    const monday = new Date(now);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      from: startOfDayIso(monday),
      to: endOfDayIso(sunday),
      period: 'week',
    };
  }

  if (dateFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      from: startOfDayIso(start),
      to: endOfDayIso(end),
      period: 'month',
    };
  }

  if (!customRange.from || !customRange.to) {
    return null;
  }

  const fromDate = new Date(customRange.from);
  const toDate = new Date(customRange.to);
  const diffInDays = Math.max(
    0,
    Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000),
  );
  const period = diffInDays <= 1 ? 'day' : diffInDays <= 7 ? 'week' : 'month';

  return {
    from: startOfDayIso(fromDate),
    to: endOfDayIso(toDate),
    period,
  };
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (typeof (error as any).response?.data?.message === 'string' ||
      typeof (error as any).response?.data?.Message === 'string')
  ) {
    return (
      (error as any).response?.data?.message ||
      (error as any).response?.data?.Message ||
      fallbackMessage
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

const formatCurrency = (value: number | null | undefined) =>
  `${Number(value || 0).toLocaleString()}đ`;

const formatDateTime = (value?: string | null) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateRange = (start?: string | null, end?: string | null) =>
  `${formatDateTime(start)} - ${formatDateTime(end)}`;

export const RevenueView = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>(
    'month',
  );
  const [basis, setBasis] = useState<'service' | 'payment'>('service');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [invoiceData, setInvoiceData] = useState<AdminInvoiceListResponse | null>(null);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [isInvoiceDetailLoading, setIsInvoiceDetailLoading] = useState(false);
  const [invoiceDetailError, setInvoiceDetailError] = useState('');

  const activeRange = useMemo(
    () => getRangeForFilter(dateFilter, customRange),
    [customRange, dateFilter],
  );

  useEffect(() => {
    if (!activeRange) {
      return;
    }

    setIsLoading(true);

    Promise.all([
      adminService.getStats({ from: activeRange.from, to: activeRange.to }),
      adminService.getAnalytics({
        from: activeRange.from,
        to: activeRange.to,
        period: activeRange.period,
        basis,
      }),
    ])
      .then(([statsData, analyticsData]) => {
        setStats(statsData);
        setAnalytics(analyticsData);
        setError('');
      })
      .catch((loadError) => {
        setError(getErrorMessage(loadError, 'Không thể tải báo cáo doanh thu lúc này.'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeRange, basis]);

  useEffect(() => {
    setInvoicePage(1);
  }, [activeRange, basis, invoicePageSize, invoiceSearch]);

  useEffect(() => {
    if (!activeRange) {
      return;
    }

    setIsInvoiceLoading(true);
    adminService
      .getInvoices({
        from: activeRange.from,
        to: activeRange.to,
        basis,
        page: invoicePage,
        pageSize: invoicePageSize,
        search: invoiceSearch.trim() || undefined,
      })
      .then((data) => {
        setInvoiceData(data);
        setInvoiceError('');
      })
      .catch((loadError) => {
        setInvoiceError(getErrorMessage(loadError, 'Không thể tải lịch sử hóa đơn lúc này.'));
      })
      .finally(() => {
        setIsInvoiceLoading(false);
      });
  }, [activeRange, basis, invoicePage, invoicePageSize, invoiceSearch]);

  const openInvoiceDetail = async (invoiceId: string) => {
    setSelectedInvoice(null);
    setInvoiceDetailError('');
    setIsInvoiceDetailLoading(true);

    try {
      const invoice = await adminService.getInvoice(invoiceId);
      setSelectedInvoice(invoice);
    } catch (detailError) {
      setInvoiceDetailError(getErrorMessage(detailError, 'Không thể tải chi tiết hóa đơn.'));
    } finally {
      setIsInvoiceDetailLoading(false);
    }
  };

  const heatmapMatrix = useMemo(() => {
    if (!analytics?.occupancyHeatmap) return [];
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
    analytics.occupancyHeatmap.forEach((cell) => {
      matrix[cell.dayOfWeek][cell.hour] = cell.occupancyRate;
    });
    return matrix;
  }, [analytics]);

  const occupancyTrend = useMemo(() => {
    if (!analytics?.occupancyHeatmap) return [0, 0, 0, 0];

    let morning = 0;
    let afternoon = 0;
    let evening = 0;
    let night = 0;
    let morningCount = 0;
    let afternoonCount = 0;
    let eveningCount = 0;
    let nightCount = 0;

    analytics.occupancyHeatmap.forEach((cell) => {
      if (cell.hour >= 8 && cell.hour < 12) {
        morning += cell.occupancyRate;
        morningCount += 1;
      } else if (cell.hour >= 12 && cell.hour < 18) {
        afternoon += cell.occupancyRate;
        afternoonCount += 1;
      } else if (cell.hour >= 18 && cell.hour < 23) {
        evening += cell.occupancyRate;
        eveningCount += 1;
      } else {
        night += cell.occupancyRate;
        nightCount += 1;
      }
    });

    return [
      morningCount ? Math.round(morning / morningCount) : 0,
      afternoonCount ? Math.round(afternoon / afternoonCount) : 0,
      eveningCount ? Math.round(evening / eveningCount) : 0,
      nightCount ? Math.round(night / nightCount) : 0,
    ];
  }, [analytics]);

  const revenueStructure = useMemo<RevenueStructureItem[]>(() => {
    const fallback: RevenueStructureItem[] = [
      { label: 'Tiền giờ chơi', amount: 0, val: 0, color: 'bg-primary' },
      { label: 'Dịch vụ F&B', amount: 0, val: 0, color: 'bg-tertiary' },
      { label: 'Huấn luyện viên', amount: 0, val: 0, color: 'bg-neutral-800' },
    ];

    if (!analytics?.revenueBySource?.length) {
      return fallback;
    }

    const colorByLabel: Record<string, string> = {
      'Tiền giờ chơi': 'bg-primary',
      'Dịch vụ F&B': 'bg-tertiary',
      'Huấn luyện viên': 'bg-neutral-800',
    };

    return analytics.revenueBySource.map((item, index) => ({
      label: item.label,
      amount: Number(item.amount || 0),
      val: Number(item.percentage || 0),
      color: colorByLabel[item.label] || fallback[index % fallback.length].color,
    }));
  }, [analytics]);

  if (isLoading && !stats && !analytics) {
    return <div className="p-8 text-white">Đang tải...</div>;
  }

  if (!stats || !analytics) {
    return (
      <div className="space-y-4 p-8">
        {error && (
          <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
      </div>
    );
  }

  const maxRevenue = Math.max(
    ...(analytics.revenueByPeriod?.map((point) => point.revenue) || [1]),
  );
  const totalRevenuePeriod =
    analytics.revenueByPeriod?.reduce((sum, point) => sum + point.revenue, 0) || 0;
  const targetPercent = Math.min(
    100,
    Math.round((totalRevenuePeriod / 1000000000) * 100),
  );

  return (
    <div className="animate-in fade-in space-y-6 p-8 duration-500">
      {error && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-surface-lowest p-4 shadow-sm">
        <h2 className="font-headline text-xl font-bold">Báo cáo doanh thu</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-neutral-200 bg-surface-low p-1">
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: 'week', label: 'Tuần này' },
              { id: 'month', label: 'Tháng này' },
              { id: 'custom', label: 'Tùy chỉnh' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDateFilter(filter.id as typeof dateFilter)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  dateFilter === filter.id
                    ? 'bg-primary text-white shadow'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <select
            id="revenueBasis"
            value={basis}
            onChange={(event) => setBasis(event.target.value as 'service' | 'payment')}
            className="rounded-lg border border-neutral-200 bg-surface-lowest px-3 py-2 text-sm"
            aria-label="Cơ sở thống kê doanh thu"
          >
            <option value="service">Theo ngày sử dụng</option>
            <option value="payment">Theo ngày thanh toán</option>
          </select>
          {dateFilter === 'custom' && (
            <div className="ml-2 flex items-center gap-2 border-l border-neutral-200 pl-4">
              <label htmlFor="revenueFromDate" className="sr-only">
                Từ ngày
              </label>
              <input
                id="revenueFromDate"
                type="date"
                value={customRange.from}
                onChange={(event) =>
                  setCustomRange({ ...customRange, from: event.target.value })
                }
                className="rounded border border-neutral-200 bg-surface-lowest px-2 py-1 text-sm"
              />
              <span>-</span>
              <label htmlFor="revenueToDate" className="sr-only">
                Đến ngày
              </label>
              <input
                id="revenueToDate"
                type="date"
                value={customRange.to}
                onChange={(event) =>
                  setCustomRange({ ...customRange, to: event.target.value })
                }
                className="rounded border border-neutral-200 bg-surface-lowest px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          {
            label: 'Tổng doanh thu',
            value: `${stats.revenue.toLocaleString()}đ`,
            trend: '+12.5%',
            isUp: true,
          },
          {
            label: 'Bàn trống',
            value: `${stats.availableTables}`,
            trend: '+5.2%',
            isUp: true,
          },
          {
            label: 'Phiên đang hoạt động',
            value: `${stats.activeSessions}`,
            trend: '-2.1%',
            isUp: false,
          },
          {
            label: 'Tổng lượt đặt',
            value: `${stats.totalBookings}`,
            trend: '+8.4%',
            isUp: true,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-neutral-100 bg-surface-lowest p-6 shadow-sm"
          >
            <p className="mb-2 text-sm font-medium text-neutral-500">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline text-3xl font-bold text-neutral-900">
                {kpi.value}
              </h3>
              <div
                className={`flex items-center text-sm font-medium ${
                  kpi.isUp ? 'text-tertiary' : 'text-primary'
                }`}
              >
                {kpi.isUp ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-2xl border border-neutral-100 bg-surface-lowest p-6 shadow-sm">
          <h3 className="mb-6 font-headline text-lg font-bold">Cơ cấu doanh thu</h3>
          <div className="space-y-5">
            {revenueStructure.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-neutral-700">{item.label}</span>
                  <span className="font-bold">{item.val.toFixed(2)}%</span>
                </div>
                <p className="mb-2 text-xs text-neutral-500">
                  {item.amount.toLocaleString()}đ
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-surface-low">
                  <div
                    className={`h-full ${item.color} ${getWidthClass(item.val)}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 rounded-2xl border border-neutral-100 bg-surface-lowest p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold">Biểu đồ doanh thu</h3>
            <span className="text-xs uppercase tracking-widest text-neutral-400">
              {analytics.period} / {analytics.basis}
            </span>
          </div>
          <div className="mt-4 flex h-48 items-end justify-between gap-2">
            {analytics.revenueByPeriod?.map((point) => {
              const heightPercent = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={point.label} className="group flex h-full flex-1 flex-col items-center">
                  <div className="relative flex h-full w-full items-end rounded-t-md bg-surface-low">
                    <div
                      className={`w-full rounded-t-md bg-primary transition-all duration-300 group-hover:opacity-80 ${getHeightClass(heightPercent)}`}
                    ></div>
                    <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {point.revenue.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between px-1 text-xs text-neutral-400">
            {analytics.revenueByPeriod?.map((point) => (
              <span key={point.label} className="flex-1 truncate px-1 text-center">
                {point.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-2 rounded-2xl border border-neutral-100 bg-surface-lowest p-6 shadow-sm">
          <h3 className="mb-4 font-headline text-lg font-bold">Bản đồ nhiệt giờ cao điểm</h3>
          <div className="grid grid-cols-8 gap-1">
            <div className="col-span-1 grid grid-rows-7 gap-1 pt-6 pr-2 text-right text-xs font-medium text-neutral-400">
              <div>CN</div>
              <div>T2</div>
              <div>T3</div>
              <div>T4</div>
              <div>T5</div>
              <div>T6</div>
              <div>T7</div>
            </div>
            <div className="col-span-7">
              <div className="mb-2 grid grid-cols-6 gap-1 text-xs font-medium text-neutral-400">
                <div>00:00</div>
                <div>04:00</div>
                <div>08:00</div>
                <div>12:00</div>
                <div>16:00</div>
                <div>20:00</div>
              </div>
              <div className="grid grid-rows-7 gap-1">
                {heatmapMatrix.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid h-4 grid-cols-24 gap-1">
                    {row.map((rate, columnIndex) => {
                      return (
                        <div
                          key={columnIndex}
                          className={`rounded-sm bg-primary ${getOpacityClass(Number(rate))}`}
                          title={`${rate}%`}
                        ></div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-surface-lowest p-6 shadow-sm">
          <h3 className="mb-6 font-headline text-lg font-bold">Xu hướng lấp đầy</h3>
          <div className="space-y-4">
            {[
              'Sáng (08:00 - 12:00)',
              'Chiều (12:00 - 18:00)',
              'Tối (18:00 - 23:00)',
              'Đêm (23:00 - 08:00)',
            ].map((label, index) => {
              const value = occupancyTrend[index];
              return (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-neutral-500">{label}</span>
                    <span className="font-bold">{value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-low">
                    <div className={`h-full bg-neutral-800 ${getWidthClass(value)}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-md">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
          <div>
            <h3 className="relative z-10 mb-2 font-headline text-lg font-bold">
              Mục tiêu doanh thu
            </h3>
            <p className="relative z-10 mb-6 text-sm text-primary-container-foreground/80">
              Đạt {targetPercent}% mục tiêu kỳ này
            </p>
          </div>
          <div>
            <div className="relative z-10 mb-2 text-3xl font-bold">
              {(totalRevenuePeriod / 1000000).toFixed(0)}M
              <span className="pl-2 text-lg font-normal opacity-80">/ 1B</span>
            </div>
            <div className="relative z-10 h-2 overflow-hidden rounded-full bg-black/20">
              <div className={`h-full bg-white ${getWidthClass(targetPercent)}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-surface-lowest shadow-sm">
        <div className="flex flex-col gap-4 border-b border-neutral-100 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold">Lịch sử hóa đơn</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Kiểm tra lại toàn bộ hóa đơn theo bộ lọc doanh thu hiện tại.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="invoiceSearch" className="sr-only">
              Tìm hóa đơn
            </label>
            <input
              id="invoiceSearch"
              type="search"
              value={invoiceSearch}
              onChange={(event) => setInvoiceSearch(event.target.value)}
              placeholder="Tìm khách, bàn, mã hóa đơn..."
              className="w-72 rounded-lg border border-neutral-200 bg-surface-lowest px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label htmlFor="invoicePageSize" className="sr-only">
              Số hóa đơn mỗi trang
            </label>
            <select
              id="invoicePageSize"
              value={invoicePageSize}
              onChange={(event) => setInvoicePageSize(Number(event.target.value))}
              className="rounded-lg border border-neutral-200 bg-surface-lowest px-3 py-2 text-sm"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50/50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="p-4 font-medium">Mã hóa đơn</th>
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Bàn</th>
                <th className="p-4 font-medium">Thời gian sử dụng</th>
                <th className="p-4 font-medium">Thanh toán</th>
                <th className="p-4 text-right font-medium">Tổng tiền</th>
                <th className="p-4 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isInvoiceLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    Đang tải lịch sử hóa đơn...
                  </td>
                </tr>
              ) : invoiceError ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-error">
                    {invoiceError}
                  </td>
                </tr>
              ) : invoiceData?.items.length ? (
                invoiceData.items.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-neutral-100 transition-colors hover:bg-neutral-50/50"
                  >
                    <td className="p-4 font-mono text-xs text-neutral-600">
                      {invoice.id.slice(0, 8)}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-neutral-900">{invoice.customerName}</p>
                      <p className="text-xs text-neutral-500">
                        {invoice.customerEmail || 'Khách vãng lai'}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                        {invoice.tableNumber} / {invoice.tableType}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600">
                      {formatDateRange(invoice.serviceStartedAt, invoice.serviceEndedAt)}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-neutral-900">
                        {invoice.paymentMethod || '--'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {invoice.paymentStatus || '--'} · {formatDateTime(invoice.paymentCompletedAt)}
                      </p>
                    </td>
                    <td className="p-4 text-right font-bold text-neutral-900">
                      {formatCurrency(invoice.grandTotal)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => void openInvoiceDetail(invoice.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-primary hover:text-primary"
                        >
                          <Eye size={14} />
                          Xem
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    Không có hóa đơn trong khoảng thời gian này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4 text-sm text-neutral-500">
          <span>
            {invoiceData
              ? `${invoiceData.totalItems.toLocaleString()} hóa đơn`
              : '0 hóa đơn'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={invoicePage <= 1 || isInvoiceLoading}
              onClick={() => setInvoicePage((page) => Math.max(1, page - 1))}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-2">
              Trang {invoiceData?.page || invoicePage} / {invoiceData?.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={
                isInvoiceLoading ||
                !invoiceData ||
                invoicePage >= Math.max(1, invoiceData.totalPages)
              }
              onClick={() => setInvoicePage((page) => page + 1)}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {(isInvoiceDetailLoading || selectedInvoice || invoiceDetailError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div>
                <h3 className="font-headline text-lg font-bold text-neutral-900">
                  Chi tiết hóa đơn
                </h3>
                {selectedInvoice && (
                  <p className="mt-1 font-mono text-xs text-neutral-500">
                    {selectedInvoice.id}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoice(null);
                  setInvoiceDetailError('');
                }}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Đóng chi tiết hóa đơn"
                title="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-76px)] overflow-y-auto p-6">
              {isInvoiceDetailLoading ? (
                <div className="py-10 text-center text-sm text-neutral-500">
                  Đang tải chi tiết hóa đơn...
                </div>
              ) : invoiceDetailError ? (
                <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  {invoiceDetailError}
                </div>
              ) : selectedInvoice ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4 rounded-xl border border-neutral-100 bg-neutral-50/60 p-4">
                    <div>
                      <p className="text-xs text-neutral-500">Khách hàng</p>
                      <p className="mt-1 font-bold text-neutral-900">
                        {selectedInvoice.customerName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {selectedInvoice.customerEmail || selectedInvoice.guestName || 'Khách vãng lai'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Bàn</p>
                      <p className="mt-1 font-bold text-neutral-900">
                        {selectedInvoice.tableNumber} / {selectedInvoice.tableType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Thời gian</p>
                      <p className="mt-1 font-bold text-neutral-900">
                        {selectedInvoice.sessionDurationHours.toFixed(2)} giờ
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDateRange(selectedInvoice.serviceStartedAt, selectedInvoice.serviceEndedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Tổng tiền</p>
                      <p className="mt-1 font-headline text-xl font-bold text-primary">
                        {formatCurrency(selectedInvoice.grandTotal)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[
                      ['Tiền giờ chơi', selectedInvoice.tableTimeCost],
                      ['F&B', selectedInvoice.fnBTotal],
                      ['Huấn luyện viên', selectedInvoice.coachingTotal],
                      ['Giảm giá', -selectedInvoice.discountAmount],
                      ['Cọc đã trừ', -selectedInvoice.depositApplied],
                      ['Còn phải thu', selectedInvoice.balanceDue],
                    ].map(([label, amount]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-neutral-100 bg-surface-lowest p-4"
                      >
                        <p className="text-xs text-neutral-500">{label}</p>
                        <p className="mt-1 font-bold text-neutral-900">
                          {formatCurrency(Number(amount))}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="mb-3 font-headline text-base font-bold">Dòng hóa đơn</h4>
                    <div className="overflow-hidden rounded-xl border border-neutral-100">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                          <tr>
                            <th className="p-3 font-medium">Loại</th>
                            <th className="p-3 font-medium">Mô tả</th>
                            <th className="p-3 text-right font-medium">Đơn giá</th>
                            <th className="p-3 text-right font-medium">SL</th>
                            <th className="p-3 text-right font-medium">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.lines.map((line) => (
                            <tr key={line.id} className="border-t border-neutral-100">
                              <td className="p-3 text-neutral-500">{line.type}</td>
                              <td className="p-3 font-medium text-neutral-900">
                                {line.description}
                              </td>
                              <td className="p-3 text-right">{formatCurrency(line.unitPrice)}</td>
                              <td className="p-3 text-right">{line.quantity.toFixed(2)}</td>
                              <td className="p-3 text-right font-bold">
                                {formatCurrency(line.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-headline text-base font-bold">Thanh toán</h4>
                    <div className="space-y-2">
                      {selectedInvoice.payments.length > 0 ? (
                        selectedInvoice.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3 text-sm"
                          >
                            <div>
                              <p className="font-bold text-neutral-900">
                                {payment.method || '--'} / {payment.status}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {payment.type || '--'} · {formatDateTime(payment.completedAt)}
                              </p>
                              {payment.notes && (
                                <p className="mt-1 text-xs text-neutral-500">{payment.notes}</p>
                              )}
                            </div>
                            <p className="font-bold text-neutral-900">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-xl border border-neutral-100 px-4 py-3 text-sm text-neutral-500">
                          Chưa có bản ghi thanh toán.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
