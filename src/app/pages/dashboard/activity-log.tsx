import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Filter, Download, Droplet, Activity, Users, CheckCircle, ExternalLink, Shield, ChevronLeft, ChevronRight, Package, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import apiClient from '../../../api/apiClient';
import ENDPOINTS from '../../../api/endpoints';

interface ActivityItem {
  id: string;
  activitytype: string;
  title: string;
  bloodtypeid: string | null;
  bloodtypename: string | null;
  relatedid: string;
  occurredat: string;
  transactionhash: string | null;
  isverified: boolean;
}

interface BloodTypeOption {
  id: string;
  typename: string;
}

function formatDate(dateStr: string, lang: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return lang === 'ar' ? 'الآن' : 'Just now';
  if (mins < 60) return lang === 'ar' ? `منذ ${mins} دقيقة` : `${mins} min${mins > 1 ? 's' : ''} ago`;
  if (hrs < 24) return lang === 'ar' ? `منذ ${hrs} ساعة` : `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  if (days < 7) return lang === 'ar' ? `منذ ${days} يوم` : `${days} day${days > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'BloodDonation': return Droplet;
    case 'NewRequest': return Activity;
    case 'RequestFulfilled': return CheckCircle;
    case 'RequestCancelled': return XCircle;
    case 'InventoryAdded': return Package;
    case 'InventoryWithdrawn': return AlertTriangle;
    case 'BatchExpired': return Clock;
    default: return Activity;
  }
}

function getActivityColor(type: string): string {
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

const truncateHash = (hash: string) => `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;

export function ActivityLogPage() {
  const { language } = useLanguage();

  // ── Filters ─────────────────────────────────────────
  const [typeFilter, setTypeFilter] = useState('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // ── Data ────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [bloodTypes, setBloodTypes] = useState<BloodTypeOption[]>([]);

  // Load blood types for filter dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.LOCATIONS.BLOOD_TYPES);
        setBloodTypes(res.data?.value ?? []);
      } catch { /* ignore */ }
    })();
  }, []);

  // Load activities
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = { page, limit };
        if (typeFilter !== 'all') params.activityType = typeFilter;
        if (bloodTypeFilter !== 'all') params.bloodTypeId = bloodTypeFilter;
        if (dateFilter) params.date = dateFilter;
        const res = await apiClient.get(ENDPOINTS.HOSPITAL.DASHBOARD_ACTIVITY_LOG, { params });
        setActivities(res.data?.value ?? []);
        setTotal(res.data?.total ?? 0);
        setTotalPages(res.data?.totalpages ?? 1);
      } catch {
        setActivities([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, typeFilter, bloodTypeFilter, dateFilter]);

  // Reset page when filters change
  const handleTypeChange = (v: string) => { setTypeFilter(v); setPage(1); };
  const handleBloodTypeChange = (v: string) => { setBloodTypeFilter(v); setPage(1); };
  const handleDateChange = (v: string) => { setDateFilter(v); setPage(1); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'سجل النشاط' : 'Activity Log'}
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">
            {language === 'ar' ? 'تتبع جميع أحداث النظام والمعاملات الموثقة على البلوكتشين.' : 'Track all system events and blockchain-verified transactions.'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium">
          <Download className="w-4 h-4" />
          {language === 'ar' ? 'تصدير السجل' : 'Export Log'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
            >
              <option value="all">{language === 'ar' ? 'كل الأنشطة' : 'All Activities'}</option>
              <option value="Donation">{language === 'ar' ? 'تبرعات' : 'Donations'}</option>
              <option value="Request">{language === 'ar' ? 'طلبات' : 'Requests'}</option>
              <option value="Inventory">{language === 'ar' ? 'المخزون' : 'Inventory'}</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Droplet className="w-5 h-5 text-gray-400" />
            <select
              value={bloodTypeFilter}
              onChange={(e) => handleBloodTypeChange(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
            >
              <option value="all">{language === 'ar' ? 'كل الفصائل' : 'All Blood Types'}</option>
              {bloodTypes.map(bt => (
                <option key={bt.id} value={bt.id}>{bt.typename}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => handleDateChange(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-gray-900 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-6 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-neutral-800 flex-shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center py-12 text-gray-500 dark:text-neutral-400">
            {language === 'ar' ? 'لا توجد أنشطة مطابقة' : 'No activities found'}
          </p>
        ) : (
          <div className="space-y-8">
            {activities.map((activity, index) => {
              const IconComp = getActivityIcon(activity.activitytype);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-6 relative"
                >
                  {/* Timeline Line */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-[-32px] w-0.5 bg-gray-200 dark:bg-neutral-800" />
                  )}

                  {/* Icon */}
                  <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${getActivityColor(activity.activitytype)} flex-shrink-0`}>
                    <IconComp className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-gray-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{formatDate(activity.occurredat, language)}</p>
                      </div>
                      {activity.bloodtypename && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-bold">
                          {activity.bloodtypename}
                        </span>
                      )}
                    </div>

                    {/* Blockchain Badge — only if verified or has hash */}
                    {(activity.isverified || activity.transactionhash) && (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {language === 'ar' ? 'موثق على البلوكتشين' : 'Blockchain Verified'}
                            </span>
                          </div>
                        </div>

                        {/* Transaction Hash */}
                        {activity.transactionhash && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 dark:text-neutral-400 font-medium">
                              {language === 'ar' ? 'معرف المعاملة:' : 'Transaction Hash:'}
                            </span>
                            <code className="flex-1 px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded text-xs font-mono text-gray-700 dark:text-neutral-300">
                              {truncateHash(activity.transactionhash)}
                            </code>
                            <button className="flex items-center gap-1 text-red-600 dark:text-red-500 hover:underline">
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                {language === 'ar' ? 'عرض' : 'View'}
                              </span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800">
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {language === 'ar'
                ? `عرض ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} من ${total}`
                : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'dots')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('dots');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === 'dots' ? (
                    <span key={`dots-${i}`} className="px-1 text-gray-400">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === item
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}