import { motion } from 'motion/react';
import { ArrowUpRight, Droplet, Users, Activity, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import { useTheme } from '../../contexts/theme-context';
import { Link } from 'react-router';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import apiClient from '../../../api/apiClient';
import ENDPOINTS from '../../../api/endpoints';

// ── Relative time helper ──────────────────────────────
function timeAgo(dateStr: string, lang: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return lang === 'ar' ? 'الآن' : 'Just now';
  if (mins < 60) return lang === 'ar' ? `منذ ${mins} دقيقة` : `${mins} min${mins > 1 ? 's' : ''} ago`;
  if (hrs < 24) return lang === 'ar' ? `منذ ${hrs} ساعة` : `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return lang === 'ar' ? `منذ ${days} يوم` : `${days} day${days > 1 ? 's' : ''} ago`;
}

// ── Activity type → dot color ─────────────────────────
function activityDotColor(type: string): string {
  switch (type) {
    case 'BloodDonation': return 'bg-emerald-500';
    case 'RequestFulfilled': return 'bg-emerald-500';
    case 'NewRequest': return 'bg-orange-500';
    case 'InventoryWithdrawn': return 'bg-orange-500';
    case 'RequestCancelled': return 'bg-red-500';
    case 'BatchExpired': return 'bg-red-500';
    case 'InventoryAdded': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
}

// Custom hook for count-up animation
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      setCount(Math.floor(easeOut * end));
      if (percentage < 1) animationFrame = requestAnimationFrame(animate);
      else setCount(end);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
}

function AnimatedNumber({ value }: { value: string }) {
  const numericValue = parseInt(value.replace(/,/g, ''));
  const animatedValue = useCountUp(numericValue);
  return <>{animatedValue.toLocaleString()}</>;
}

// Pure CSS horizontal bar chart — no recharts, no key warnings
function BloodInventoryChart({ data, language, theme }: {
  data: { type: string; units: number; isLow: boolean }[];
  language: string;
  theme: string;
}) {
  const rawMax = Math.max(...data.map(d => d.units), 1);
  const maxUnits = rawMax <= 20 ? rawMax + 5 : rawMax <= 50 ? rawMax + 10 : rawMax <= 100 ? rawMax + 20 : rawMax + 50;
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      {data.map((entry, i) => {
        const pct = Math.round((entry.units / maxUnits) * 100);
        const isHovered = hovered === i;
        const barColor = entry.isLow ? '#E53935' : '#2E7D32';
        const barColorHover = entry.isLow ? '#EF5350' : '#388E3C';
        const label = `${entry.units} ${language === 'ar' ? 'وحدة' : 'Units'}${entry.isLow ? (language === 'ar' ? ' (منخفض)' : ' (Low)') : ''}`;

        return (
          <div
            key={entry.type}
            className="flex items-center gap-3 group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Blood type label */}
            <span
              className="shrink-0 text-sm font-bold"
              style={{
                width: 36,
                textAlign: language === 'ar' ? 'right' : 'left',
                color: theme === 'dark' ? '#FFFFFF' : '#111827',
              }}
            >
              {entry.type}
            </span>

            {/* Bar track */}
            <div
              className="relative flex-1 rounded-full overflow-hidden"
              style={{
                height: 22,
                backgroundColor: theme === 'dark' ? '#262626' : '#F3F4F6',
              }}
            >
              {/* Filled bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: animated ? `${pct}%` : '0%',
                  background: isHovered ? barColorHover : barColor,
                  borderRadius: '0 6px 6px 0',
                  transition: animated
                    ? 'background 0.15s ease'
                    : `width 0.7s cubic-bezier(0.4,0,0.2,1) ${i * 60}ms`,
                }}
              />
            </div>

            {/* Value label */}
            <span
              className="shrink-0 text-xs font-medium"
              style={{
                width: language === 'ar' ? 110 : 100,
                color: isHovered
                  ? (entry.isLow ? '#EF5350' : '#4CAF50')
                  : (theme === 'dark' ? '#A3A3A3' : '#6B7280'),
                transition: 'color 0.15s ease',
                textAlign: language === 'ar' ? 'right' : 'left',
              }}
            >
              {label}
            </span>
          </div>
        );
      })}

      {/* X-axis ticks */}
      <div className="flex mt-1" style={{ paddingLeft: 48 }}>
        {Array.from({ length: 5 }, (_, i) => Math.round((maxUnits / 4) * i)).map((tick) => (
          <div
            key={`tick-${tick}`}
            className="flex-1 text-center"
            style={{ fontSize: 10, color: theme === 'dark' ? '#525252' : '#9CA3AF' }}
          >
            {tick}
          </div>
        ))}
      </div>
    </div>
  );
}

const ALL_BLOOD_TYPES_CHART = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export function DashboardOverview() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  // ── Hospital name from localStorage ─────────────────
  const hospitalName = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.hospitalName || user.name || user.hospitalname || 'Hospital';
    } catch { return 'Hospital'; }
  }, []);

  // ── Stats from API ──────────────────────────────────
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.HOSPITAL.DASHBOARD_STATS);
        setStatsData(res.data?.value ?? null);
      } catch { /* keep null */ }
      finally { setStatsLoading(false); }
    })();
  }, []);

  // ── Recent Activity from API ────────────────────────
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.HOSPITAL.DASHBOARD_RECENT_ACTIVITY, { params: { limit: 4 } });
        setRecentActivities(res.data?.value ?? []);
      } catch { /* keep empty */ }
      finally { setRecentLoading(false); }
    })();
  }, []);

  // ── Inventory data from API ──────────────────────────
  const [bloodInventoryData, setBloodInventoryData] = useState<{ type: string; units: number; isLow: boolean }[]>(
    ALL_BLOOD_TYPES_CHART.map(t => ({ type: t, units: 0, isLow: true }))
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.HOSPITAL.INVENTORY);
        const items: { bloodtypename: string; totalunits: number }[] = res.data?.value ?? [];
        setBloodInventoryData(
          ALL_BLOOD_TYPES_CHART.map(bt => {
            const found = items.find(i => i.bloodtypename === bt);
            const units = found ? found.totalunits : 0;
            return { type: bt, units, isLow: units < 10 };
          })
        );
      } catch {
        // keep default zeros
      }
    })();
  }, []);

  const statCards = [
    {
      key: 'totaldonors',
      label: language === 'ar' ? 'إجمالي المتبرعين' : 'Total Donors',
      icon: Users, color: 'bg-blue-500',
      link: '/org/dashboard/donors',
    },
    {
      key: 'availablebloodunits',
      label: language === 'ar' ? 'وحدات الدم المتاحة' : 'Available Blood Units',
      icon: Droplet, color: 'bg-red-500',
      link: '/org/dashboard/inventory-management',
    },
    {
      key: 'urgentrequests',
      label: language === 'ar' ? 'طلبات عاجلة' : 'Urgent Requests',
      icon: Activity, color: 'bg-orange-500',
      link: '/org/dashboard/requests/active',
    },
    {
      key: 'transfusionstoday',
      label: language === 'ar' ? 'عمليات نقل الدم اليوم' : 'Transfusions Today',
      icon: Clock, color: 'bg-emerald-500',
      link: '/org/dashboard/analytics',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? `مرحباً بعودتك، ${hospitalName}` : `Welcome back, ${hospitalName}`}
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">
            {language === 'ar' ? 'إليك نظرة عامة على نشاط بنك الدم اليوم.' : 'Here is an overview of your blood bank activity today.'}
          </p>
        </div>
        <Link to="/org/dashboard/urgent-request/new" className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-sm shadow-red-500/20">
          {language === 'ar' ? 'إنشاء طلب عاجل' : 'Create Urgent Request'}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const s = statsData?.[card.key];
          const val = s?.value ?? 0;
          const pct = s?.changepercent ?? 0;
          const changeLabel = s?.changelabel ?? (language === 'ar' ? 'مقارنة بالشهر الماضي' : 'vs last month');
          const trendUp = pct > 0;
          const trendZero = pct === 0;
          return (
            <Link key={card.key} to={card.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="h-full bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                {statsLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-2/3" />
                    <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-3/4" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">{card.label}</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          <AnimatedNumber value={String(val)} />
                        </h3>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${card.color}`}>
                        <card.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      {trendZero ? (
                        <span className="text-sm font-medium text-gray-400 dark:text-neutral-500">0%</span>
                      ) : (
                        <span className={`flex items-center text-sm font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                          <TrendingUp className={`w-4 h-4 mr-1 ${!trendUp && 'rotate-180'}`} />
                          {trendUp ? '+' : ''}{pct}%
                        </span>
                      )}
                      <span className="text-sm text-gray-400 dark:text-neutral-500">
                        {changeLabel}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blood Inventory Chart — pure CSS, no recharts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-2 bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'مستويات المخزون حسب الفصيلة' : 'Inventory Levels by Type'}
            </h3>
            <Link
              to="/org/dashboard/inventory-management"
              className="text-sm text-red-600 dark:text-red-500 font-medium flex items-center gap-1 hover:underline"
            >
              <span>{language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#2E7D32' }} />
              <span className="text-xs" style={{ color: theme === 'dark' ? '#A3A3A3' : '#6B7280' }}>
                {language === 'ar' ? 'مخزون طبيعي' : 'Normal'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#E53935' }} />
              <span className="text-xs" style={{ color: theme === 'dark' ? '#A3A3A3' : '#6B7280' }}>
                {language === 'ar' ? 'مخزون منخفض (<10 وحدة)' : 'Low Stock (<10 units)'}
              </span>
            </div>
          </div>

          <BloodInventoryChart data={bloodInventoryData} language={language} theme={theme} />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
          className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>
          {recentLoading ? (
            <div className="space-y-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-neutral-800 mt-1 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-neutral-400 text-center py-8">
              {language === 'ar' ? 'لا يوجد نشاط حديث' : 'No recent activity'}
            </p>
          ) : (
            <div className="space-y-6">
              {recentActivities.map((activity: any, index: number) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {index !== recentActivities.length - 1 && (
                    <div className={`absolute top-8 ${language === 'ar' ? 'right-2' : 'left-2'} bottom-[-24px] w-0.5 bg-gray-100 dark:bg-neutral-800`} />
                  )}
                  <div className={`relative z-10 w-4 h-4 rounded-full mt-1 flex-shrink-0 ring-4 ring-white dark:ring-neutral-950 ${activityDotColor(activity.activitytype)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{timeAgo(activity.occurredat, language)}</p>
                  </div>
                  {activity.bloodtypename && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 self-start mt-0.5">
                      {activity.bloodtypename}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <Link
            to="/org/dashboard/activity-log"
            className="w-full mt-6 py-2.5 text-sm font-medium text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 block text-center transition-colors"
          >
            {language === 'ar' ? 'عرض كل الأنشطة' : 'View All Activity'}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}