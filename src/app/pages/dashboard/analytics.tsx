import { motion, useInView } from 'motion/react';
import { useLanguage } from '../../contexts/language-context';
import { useTheme } from '../../contexts/theme-context';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useId, useState, useRef, useEffect } from 'react';
import CountUp from 'react-countup';
import { ChevronDown, Check, TrendingUp } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import ENDPOINTS from '../../../api/endpoints';

type PeriodValue = 'Last7Days' | 'Last30Days' | 'Last3Months' | 'LastYear';

const BLOOD_TYPE_COLORS: Record<string, string> = {
  'A+': '#ef4444', 'O+': '#f97316', 'B+': '#f59e0b', 'AB+': '#84cc16',
  'A-': '#22c55e', 'O-': '#06b6d4', 'B-': '#3b82f6', 'AB-': '#6366f1',
};

function periodShortLabel(periodLabel: string | undefined, lang: string): string {
  if (!periodLabel) return '';
  switch (periodLabel) {
    case 'Last 7 Days': return lang === 'ar' ? '7 أيام' : '7 Days';
    case 'Last 30 Days': return lang === 'ar' ? '30 يوم' : '30 Days';
    case 'Last 3 Months': return lang === 'ar' ? '3 أشهر' : '3 Months';
    case 'Last Year': return lang === 'ar' ? 'سنة' : 'Year';
    default: return periodLabel;
  }
}

export function DashboardAnalytics() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const chartId = useId();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>('Last7Days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bottomChartsRef = useRef(null);
  const isBottomChartsInView = useInView(bottomChartsRef, { amount: 0.3 });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const periodOptions: { value: PeriodValue; label: string }[] = [
    { value: 'Last7Days', label: language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days' },
    { value: 'Last30Days', label: language === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days' },
    { value: 'Last3Months', label: language === 'ar' ? 'آخر 3 أشهر' : 'Last 3 Months' },
    { value: 'LastYear', label: language === 'ar' ? 'السنة الماضية' : 'Last Year' },
  ];

  const handlePeriodChange = (value: PeriodValue) => {
    setSelectedPeriod(value);
    setIsDropdownOpen(false);
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? '#a3a3a3' : '#6b7280';
  const gridColor = isDark ? '#262626' : '#f3f4f6';

  // ── API state ───────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<{ name: string; donations: number; requests: number }[]>([]);
  const [distributionData, setDistributionData] = useState<{ name: string; value: number; percentage: number; color: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [summaryRes, trendsRes, distRes] = await Promise.all([
          apiClient.get(ENDPOINTS.HOSPITAL.ANALYTICS_SUMMARY(selectedPeriod)),
          apiClient.get(ENDPOINTS.HOSPITAL.ANALYTICS_TRENDS(selectedPeriod)),
          apiClient.get(ENDPOINTS.HOSPITAL.ANALYTICS_DISTRIBUTION(selectedPeriod)),
        ]);
        if (cancelled) return;

        // Summary
        setSummaryData(summaryRes.data?.value ?? null);

        // Trends
        const tv = trendsRes.data?.value;
        if (tv?.labels && tv?.donations && tv?.requests) {
          setTrendsData(tv.labels.map((l: string, i: number) => ({
            name: l,
            donations: tv.donations[i] ?? 0,
            requests: tv.requests[i] ?? 0,
          })));
        } else {
          setTrendsData([]);
        }

        // Distribution
        const dv: any[] = distRes.data?.value ?? [];
        setDistributionData(dv.map((item: any) => ({
          name: item.bloodtypename,
          value: item.count,
          percentage: item.percentage,
          color: BLOOD_TYPE_COLORS[item.bloodtypename] || '#9ca3af',
        })));
      } catch {
        if (!cancelled) {
          setSummaryData(null);
          setTrendsData([]);
          setDistributionData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedPeriod]);

  // Build summary stat cards from API data
  const donationsPct = summaryData?.totaldonations?.changepercent ?? 0;
  const responseRatePct = summaryData?.responserate?.changepercent ?? 0;
  const fulfillmentPct = summaryData?.avgfulfillmenthrs?.changepercent ?? 0;
  const pLabel = periodShortLabel(summaryData?.periodlabel, language);

  const summaryStats = [
    {
      title: language === 'ar' ? `إجمالي التبرعات (${pLabel})` : `Total Donations (${pLabel})`,
      value: summaryData?.totaldonations?.value ?? 0,
      suffix: '',
      change: donationsPct,
    },
    {
      title: language === 'ar' ? 'معدل الاستجابة' : 'Response Rate',
      value: summaryData?.responserate?.value ?? 0,
      suffix: '%',
      change: responseRatePct,
    },
    {
      title: language === 'ar' ? 'متوسط وقت التلبية' : 'Avg. Fulfillment Time',
      value: summaryData?.avgfulfillmenthrs?.value ?? 0,
      suffix: ' hrs',
      change: fulfillmentPct,
    },
  ];

  const formatChange = (pct: number) => {
    if (pct === 0) return { text: '0%', cls: 'text-gray-400 dark:text-neutral-500' };
    if (pct > 0) return { text: `+${pct}%`, cls: 'text-emerald-500' };
    return { text: `${pct}%`, cls: 'text-red-500' };
  };

  // Skeleton for cards
  const CardSkeleton = () => (
    <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-2/3 mb-4" />
      <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-1/2" />
    </div>
  );

  // Skeleton for charts
  const ChartSkeleton = () => (
    <div className="h-80 w-full flex items-center justify-center">
      <div className="animate-pulse space-y-4 w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-neutral-800 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'التحليلات والتقارير' : 'Analytics & Reports'}
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">
            {language === 'ar' ? 'نظرة معمقة على إحصائيات التبرع والاستجابة.' : 'Deep dive into donation and response statistics.'}
          </p>
        </div>
        {/* Custom Dropdown */}
        <div ref={dropdownRef} className="relative">
          <motion.button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="min-w-[200px] bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-950 border-2 border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-100 text-sm rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 focus:border-red-400 dark:focus:border-red-600 transition-all duration-300 flex items-center justify-between gap-4 shadow-lg hover:shadow-xl backdrop-blur-sm relative overflow-hidden group"
            style={{
              boxShadow: theme === 'dark'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <span className="font-semibold relative z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {periodOptions.find(opt => opt.value === selectedPeriod)?.label}
            </span>

            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10"
            >
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.div>
          </motion.button>

          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div
                className="absolute top-full mt-3 w-full bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden z-50 backdrop-blur-xl"
                style={{
                  boxShadow: theme === 'dark'
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 15px rgba(239, 68, 68, 0.1)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.05)',
                  background: theme === 'dark'
                    ? 'linear-gradient(to bottom, rgba(38, 38, 38, 0.98), rgba(23, 23, 23, 0.98))'
                    : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.98))'
                }}
              >
                <div className="py-2">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handlePeriodChange(option.value)}
                      className={`w-full px-5 py-3.5 text-left text-sm transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${
                        selectedPeriod === option.value
                          ? 'text-red-600 dark:text-red-400 font-bold'
                          : 'text-gray-700 dark:text-gray-300 font-medium'
                      }`}
                    >
                      {/* Background highlight */}
                      <div
                        className={`absolute inset-0 transition-all duration-200 ${
                          selectedPeriod === option.value
                            ? 'bg-gradient-to-r from-red-50 via-red-100/50 to-red-50 dark:from-red-950/40 dark:via-red-900/30 dark:to-red-950/40'
                            : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-gray-50 group-hover:via-gray-100/30 group-hover:to-gray-50 dark:group-hover:from-neutral-700/30 dark:group-hover:via-neutral-600/20 dark:group-hover:to-neutral-700/30'
                        }`}
                      />

                      {/* Left accent bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
                          selectedPeriod === option.value
                            ? 'bg-gradient-to-b from-red-500 to-red-600'
                            : 'bg-transparent group-hover:bg-gradient-to-b group-hover:from-gray-300 group-hover:to-gray-400 dark:group-hover:from-neutral-600 dark:group-hover:to-neutral-500'
                        }`}
                      />

                      <span className="relative z-10 flex items-center gap-3">
                        {selectedPeriod === option.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                        )}
                        {option.label}
                      </span>

                      {selectedPeriod === option.value && (
                        <div className="relative z-10">
                          <div className="bg-red-100 dark:bg-red-900/50 p-1 rounded-lg">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Bottom gradient decoration */}
                <div className="h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          summaryStats.map((stat, idx) => {
            const ch = formatChange(stat.change);
            return (
              <motion.div
                key={`${selectedPeriod}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm"
              >
                <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-400">{stat.title}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    <CountUp
                      start={0}
                      end={stat.value}
                      duration={2}
                      decimals={stat.suffix === '%' || stat.suffix === ' hrs' ? 1 : 0}
                      suffix={stat.suffix}
                      separator=","
                    />
                  </span>
                  <span className={`flex items-center text-sm font-medium ${ch.cls}`}>
                    {stat.change !== 0 && (
                      <TrendingUp className={`w-4 h-4 mr-1 ${stat.change < 0 ? 'rotate-180' : ''}`} />
                    )}
                    {ch.text}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Trends */}
        <motion.div
          key={`chart-${selectedPeriod}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {language === 'ar' ? 'اتجاهات التبرع والطلبات' : 'Donation vs Requests Trends'}
          </h3>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`colorDonations-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id={`colorRequests-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis key="x-axis" dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis key="y-axis" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    key="tooltip"
                    contentStyle={{ backgroundColor: isDark ? '#171717' : '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: isDark ? '#ffffff' : '#111827' }}
                  />
                  <Legend key="legend" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    key="area-donations"
                    type="monotone"
                    name={language === 'ar' ? 'التبرعات' : 'Donations'}
                    dataKey="donations"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#colorDonations-${chartId})`}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                  />
                  <Area
                    key="area-requests"
                    type="monotone"
                    name={language === 'ar' ? 'الطلبات' : 'Requests'}
                    dataKey="requests"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#colorRequests-${chartId})`}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Pie Chart - Blood Types */}
        <motion.div
          ref={bottomChartsRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isBottomChartsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {language === 'ar' ? 'توزيع فصائل الدم' : 'Blood Type Distribution'}
          </h3>
          {loading ? (
            <ChartSkeleton />
          ) : distributionData.length === 0 ? (
            <div className="h-80 w-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-neutral-400 text-center">
                {language === 'ar' ? 'لا توجد بيانات تبرع لهذه الفترة' : 'No donation data for this period'}
              </p>
            </div>
          ) : (
            <div className="h-80 w-full flex items-center justify-center" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                  <Pie
                    key={`pie-${selectedPeriod}`}
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={isBottomChartsInView}
                    animationDuration={800}
                    animationBegin={0}
                    animationEasing="ease-in-out"
                    labelLine={({ points, payload }: any) => {
                      const [p0, p1] = points;
                      return (
                        <polyline
                          points={`${p0.x},${p0.y} ${p1.x},${p1.y}`}
                          stroke={payload.color}
                          strokeWidth={1.5}
                          fill="none"
                        />
                      );
                    }}
                    label={({ cx, cy, midAngle, outerRadius, payload }: any) => {
                      const RAD = Math.PI / 180;
                      const r = outerRadius + 22;
                      const x = cx + r * Math.cos(-midAngle * RAD);
                      const y = cy + r * Math.sin(-midAngle * RAD);
                      const anchor = x > cx ? 'start' : 'end';
                      return (
                        <text
                          x={x}
                          y={y}
                          fill={payload.color}
                          textAnchor={anchor}
                          dominantBaseline="central"
                          style={{ fontSize: 13, fontWeight: 600 }}
                        >
                          {`${payload.name} ${payload.percentage}%`}
                        </text>
                      );
                    }}
                  >
                    {distributionData.map((entry) => (
                      <Cell key={`${chartId}-pie-${selectedPeriod}-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    key="pie-tooltip"
                    contentStyle={{ backgroundColor: isDark ? '#171717' : '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: isDark ? '#ffffff' : '#111827' }}
                    formatter={(value: any, name: string) => [
                      `${value} ${language === 'ar' ? 'وحدة' : 'units'}`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}