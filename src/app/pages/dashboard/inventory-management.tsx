import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, AlertTriangle, X, ChevronLeft, ChevronRight, Droplets, Package, Clock, Activity, Loader2, Eye, Zap, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import apiClient from '../../../api/apiClient';
import ENDPOINTS from '../../../api/endpoints';

// ── Types ────────────────────────────────────────────────────
interface InventoryItem {
  inventoryid: string;
  bloodtypeid: string;
  bloodtypename: string;
  totalunits: number;
  expiringin7days: number;
  batchcount: number;
  nearestexpiry: string | null;
}

interface BatchItem {
  id: string;
  units: number;
  remainingunits: number;
  collectiondate: string;
  expirydate: string;
  daysuntilexpiry: number;
  status: string;
}

interface InventoryDetail {
  inventoryid: string;
  bloodtypeid: string;
  bloodtypename: string;
  totalunits: number;
  batches: BatchItem[];
}

interface ExpiringBatch {
  batchid: string;
  bloodtypeid: string;
  bloodtypename: string;
  remainingunits: number;
  expirydate: string;
  daysuntilexpiry: number;
}

interface TransactionItem {
  id: string;
  bloodtypeid: string;
  bloodtypename: string;
  changeamount: number;
  reason: string;
  requestid: string | null;
  notes: string | null;
  changedat: string;
}

interface BloodTypeOption {
  id: string;
  typename: string;
}

const ALL_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function formatReason(reason: string, lang: string): string {
  const map: Record<string, [string, string]> = {
    'ManualAdd': ['Manual Add', 'إضافة يدوية'],
    'ManualWithdraw': ['Manual Withdraw', 'سحب يدوي'],
    'RequestFulfillment': ['Request Fulfilled', 'تنفيذ طلب'],
    'ExpiredAutoRemoved': ['Auto Expired', 'انتهاء تلقائي'],
    'CompatibleTypeUsed': ['Compatible Type Used', 'نوع متوافق'],
  };
  const entry = map[reason];
  if (!entry) return reason;
  return lang === 'ar' ? entry[1] : entry[0];
}

export function InventoryManagement() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // ── Inventory Overview ──────────────────────────────────
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // ── Expiring Soon ───────────────────────────────────────
  const [expiring, setExpiring] = useState<ExpiringBatch[]>([]);

  // ── Transactions ────────────────────────────────────────
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotal, setTxTotal] = useState(0);

  // ── Detail Modal ────────────────────────────────────────
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<InventoryDetail | null>(null);

  // ── Add Batch Modal ─────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addLocked, setAddLocked] = useState(false);
  const [bloodTypes, setBloodTypes] = useState<BloodTypeOption[]>([]);
  const [addForm, setAddForm] = useState({
    bloodtypeid: '',
    units: '',
    collectiondate: '',
    expirydate: '',
    notes: '',
  });

  // ── Toast ───────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch inventory ─────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.HOSPITAL.INVENTORY);
      setInventory(res.data?.value ?? []);
    } catch {
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  // ── Fetch expiring ──────────────────────────────────────
  const fetchExpiring = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.HOSPITAL.INVENTORY_EXPIRING, { params: { days: 7 } });
      setExpiring(res.data?.value ?? []);
    } catch {
      setExpiring([]);
    }
  }, []);

  // ── Fetch transactions ──────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.HOSPITAL.INVENTORY_TRANSACTIONS, { params: { page: txPage, limit: 10 } });
      setTransactions(res.data?.value ?? []);
      setTxTotal(res.data?.total ?? 0);
      setTxTotalPages(res.data?.totalpages ?? 1);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [txPage]);

  // ── Fetch blood types ───────────────────────────────────
  const fetchBloodTypes = useCallback(async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.LOCATIONS.BLOOD_TYPES);
      setBloodTypes(res.data?.value ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchExpiring();
    fetchBloodTypes();
  }, [fetchInventory, fetchExpiring, fetchBloodTypes]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ── Build full 8 cards ──────────────────────────────────
  const cardsData = ALL_BLOOD_TYPES.map(bt => {
    const found = inventory.find(i => i.bloodtypename === bt);
    return found || {
      inventoryid: '',
      bloodtypeid: '',
      bloodtypename: bt,
      totalunits: 0,
      expiringin7days: 0,
      batchcount: 0,
      nearestexpiry: null,
    };
  });

  // ── View Details ────────────────────────────────────────
  const handleViewDetails = async (bloodTypeId: string) => {
    if (!bloodTypeId) return;
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await apiClient.get(ENDPOINTS.HOSPITAL.INVENTORY_BY_TYPE(bloodTypeId));
      setDetailData(res.data?.value ?? null);
    } catch {
      showToast(isAr ? 'فشل تحميل التفاصيل.' : 'Failed to load details.', 'error');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Open Add Modal ──────────────────────────────────────
  const openAddModal = (preBloodTypeId?: string) => {
    setAddLocked(!!preBloodTypeId);
    setAddForm({
      bloodtypeid: preBloodTypeId || '',
      units: '',
      collectiondate: '',
      expirydate: '',
      notes: '',
    });
    setAddOpen(true);
  };

  // ── Submit Add Batch ────────────────────────────────────
  const handleAddBatch = async () => {
    if (!addForm.bloodtypeid || !addForm.units || !addForm.collectiondate || !addForm.expirydate) {
      showToast(isAr ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill all required fields.', 'error');
      return;
    }
    setAddLoading(true);
    try {
      await apiClient.post(ENDPOINTS.HOSPITAL.INVENTORY_ADD_BATCH, {
        bloodtypeid: addForm.bloodtypeid,
        units: parseInt(addForm.units),
        collectiondate: addForm.collectiondate,
        expirydate: addForm.expirydate,
        notes: addForm.notes || undefined,
      });
      showToast(isAr ? 'تم إضافة الدفعة بنجاح.' : 'Blood batch added successfully.');
      setAddOpen(false);
      fetchInventory();
      fetchExpiring();
      fetchTransactions();
    } catch {
      showToast(isAr ? 'فشل في إضافة الدفعة.' : 'Failed to add batch.', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // ── Skeleton ────────────────────────────────────────────
  const CardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gray-200 dark:bg-neutral-700 rounded-xl" />
            <div className="w-16 h-5 bg-gray-200 dark:bg-neutral-700 rounded-full" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-24 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-32 mb-4" />
          <div className="flex gap-2">
            <div className="flex-1 h-9 bg-gray-200 dark:bg-neutral-700 rounded-xl" />
            <div className="flex-1 h-9 bg-gray-200 dark:bg-neutral-700 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isAr ? 'مخزون الدم' : 'Blood Inventory'}
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">
            {isAr ? 'إدارة ومراقبة مخزون الدم المتاح.' : 'Manage and monitor available blood inventory.'}
          </p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] hover:bg-red-700 text-white rounded-xl transition-colors duration-200 font-medium shadow-sm shadow-red-500/20"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة وحدات' : 'Add Units'}
        </button>
      </div>

      {/* ═══ Expiring Soon Alert ═══ */}
      <AnimatePresence>
        {expiring.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-orange-700 dark:text-orange-400">
                {isAr
                  ? `⚠ ${expiring.length} دفعة تنتهي صلاحيتها خلال 7 أيام`
                  : `⚠ ${expiring.length} batch(es) expiring within 7 days`}
              </span>
            </div>
            <div className="space-y-2">
              {expiring.map(b => (
                <div key={b.batchid} className="flex items-center justify-between bg-white/60 dark:bg-neutral-900/50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 font-bold flex items-center justify-center text-sm">
                      {b.bloodtypename}
                    </span>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {b.remainingunits} {isAr ? 'وحدة' : 'units'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-neutral-400 block">
                        {isAr ? 'تنتهي' : 'Expires'}: {b.expirydate} ({b.daysuntilexpiry} {isAr ? 'يوم' : 'days'})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Inventory Cards ═══ */}
      {inventoryLoading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardsData.map((card, idx) => (
            <motion.div
              key={card.bloodtypename}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 hover:border-gray-200 dark:hover:border-neutral-700 transition-colors duration-200 shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 rounded-xl bg-red-50 dark:bg-red-500/10 text-[#D32F2F] font-bold text-xl flex items-center justify-center">
                  {card.bloodtypename}
                </div>
                {card.totalunits === 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
                    {isAr ? 'لا يوجد مخزون' : 'No Stock'}
                  </span>
                ) : card.expiringin7days > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                    ⚠ {isAr ? 'تنتهي قريباً' : 'Expiring Soon'}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    {isAr ? 'متوفر' : 'Available'}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.totalunits} <span className="text-sm font-medium text-gray-500 dark:text-neutral-400">{isAr ? 'وحدة' : 'Units'}</span>
              </h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {card.batchcount} {isAr ? 'دفعة نشطة' : 'Active Batch'}
                </span>
              </div>
              {card.nearestexpiry && (
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isAr ? 'تنتهي' : 'Expires'}: {card.nearestexpiry}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openAddModal(card.bloodtypeid || bloodTypes.find(bt => bt.typename === card.bloodtypename)?.id)}
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-[#D32F2F]/10 text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAr ? 'إضافة' : 'Add Units'}
                </button>
                <button
                  onClick={() => handleViewDetails(card.bloodtypeid)}
                  disabled={!card.bloodtypeid}
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isAr ? 'التفاصيل' : 'View Details'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ═══ Transaction History ═══ */}
      <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D32F2F]" />
          <h3 className="font-bold text-gray-900 dark:text-white">
            {isAr ? 'سجل المعاملات' : 'Transaction History'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-neutral-900/50 border-b border-gray-100 dark:border-neutral-800">
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">{isAr ? 'التاريخ' : 'Date'}</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">{isAr ? 'الفصيلة' : 'Blood Type'}</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">{isAr ? 'التغيير' : 'Change'}</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">{isAr ? 'السبب' : 'Reason'}</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">{isAr ? 'ملاحظات' : 'Notes'}</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">{isAr ? 'الطلب' : 'Request'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {txLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-4 px-5"><div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-neutral-400">
                    {isAr ? 'لا توجد معاملات بعد.' : 'No transactions yet.'}
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors duration-150"
                  >
                    <td className="py-3.5 px-5 text-sm text-gray-700 dark:text-neutral-300">
                      {new Date(tx.changedat).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(tx.changedat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-[#D32F2F] text-xs font-bold">
                        {tx.bloodtypename}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-sm font-medium ${tx.changeamount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.changeamount > 0 ? `+${tx.changeamount}` : tx.changeamount} {isAr ? (tx.changeamount > 0 ? 'وحدة مضافة' : 'وحدة مسحوبة') : (tx.changeamount > 0 ? 'Units Added' : 'Units Withdrawn')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-gray-700 dark:text-neutral-300">
                      {formatReason(tx.reason, language)}
                    </td>
                    <td className="py-3.5 px-5 text-sm text-gray-500 dark:text-neutral-400">
                      {tx.notes || '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      {tx.requestid ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                          {tx.requestid.slice(0, 8)}...
                        </span>
                      ) : '—'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!txLoading && txTotalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-neutral-400">
              {isAr ? `${txTotal} معاملة` : `${txTotal} transactions`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTxPage(p => Math.max(1, p - 1))}
                disabled={txPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                {txPage} / {txTotalPages}
              </span>
              <button
                onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                disabled={txPage === txTotalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Detail Modal ═══ */}
      <AnimatePresence>
        {detailOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {detailData && (
                    <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 text-[#D32F2F] font-bold text-lg flex items-center justify-center">
                      {detailData.bloodtypename}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {isAr ? 'تفاصيل المخزون' : 'Inventory Details'}
                    </h3>
                    {detailData && (
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {detailData.totalunits} {isAr ? 'وحدة إجمالية' : 'Total Units'}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setDetailOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {detailLoading ? (
                <div className="p-12 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-neutral-600 border-t-[#D32F2F] rounded-full animate-spin" />
                </div>
              ) : detailData?.batches && detailData.batches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-neutral-900/50 border-b border-gray-100 dark:border-neutral-800">
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase">{isAr ? 'تاريخ التجميع' : 'Collection Date'}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase">{isAr ? 'الوحدات' : 'Units'}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase">{isAr ? 'المتبقي' : 'Remaining'}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase">{isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase">{isAr ? 'الأيام المتبقية' : 'Days Left'}</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase">{isAr ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                      {detailData.batches.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors duration-150">
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-neutral-300">{b.collectiondate}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{b.units}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{b.remainingunits}</td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-neutral-300">{b.expirydate}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {b.daysuntilexpiry <= 7 && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                              <span className={`text-sm font-medium ${b.daysuntilexpiry <= 7 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-neutral-300'}`}>
                                {b.daysuntilexpiry}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              b.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                              b.status === 'Expired' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                              'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500 dark:text-neutral-400">
                  {isAr ? 'لا توجد دفعات.' : 'No batches found.'}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ Add Batch Modal ═══ */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAddOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {isAr ? 'إضافة دفعة جديدة' : 'Add New Batch'}
                </h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Blood Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'فصيلة الدم' : 'Blood Type'} *
                    {addLocked && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-neutral-500 ms-2">
                        <Lock className="w-3 h-3" />
                        {isAr ? '(مقفل)' : '(locked)'}
                      </span>
                    )}
                  </label>
                  <select
                    value={addForm.bloodtypeid}
                    onChange={e => setAddForm(f => ({ ...f, bloodtypeid: e.target.value }))}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F] dark:text-white text-sm ${addLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={addLocked}
                  >
                    <option value="">{isAr ? 'اختر الفصيلة' : 'Select Blood Type'}</option>
                    {bloodTypes.map(bt => (
                      <option key={bt.id} value={bt.id}>{bt.typename}</option>
                    ))}
                  </select>
                </div>

                {/* Units */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'عدد الوحدات' : 'Units'} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={addForm.units}
                    onChange={e => setAddForm(f => ({ ...f, units: e.target.value }))}
                    placeholder="1 - 1000"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F] dark:text-white text-sm"
                  />
                </div>

                {/* Collection Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'تاريخ التجميع' : 'Collection Date'} *
                  </label>
                  <input
                    type="date"
                    max={today}
                    value={addForm.collectiondate}
                    onChange={e => {
                      const newCollection = e.target.value;
                      setAddForm(f => {
                        const minExpiry = newCollection ? new Date(new Date(newCollection).getTime() + 86400000).toISOString().split('T')[0] : tomorrow;
                        return {
                          ...f,
                          collectiondate: newCollection,
                          expirydate: f.expirydate && f.expirydate < minExpiry ? '' : f.expirydate,
                        };
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F] text-gray-900 dark:text-white text-sm [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'تاريخ الانتهاء' : 'Expiry Date'} *
                  </label>
                  <input
                    type="date"
                    min={addForm.collectiondate ? new Date(new Date(addForm.collectiondate).getTime() + 86400000).toISOString().split('T')[0] : tomorrow}
                    value={addForm.expirydate}
                    onChange={e => setAddForm(f => ({ ...f, expirydate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F] text-gray-900 dark:text-white text-sm [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                    {isAr ? 'ملاحظات' : 'Notes'} ({isAr ? 'اختياري' : 'Optional'})
                  </label>
                  <input
                    type="text"
                    value={addForm.notes}
                    onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={isAr ? 'ملاحظات إضافية...' : 'Additional notes...'}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F] dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-neutral-800 flex gap-3">
                <button
                  onClick={() => setAddOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddBatch}
                  disabled={addLoading}
                  className="flex-1 py-2.5 bg-[#D32F2F] hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {addLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAr ? 'إضافة الدفعة' : 'Add Batch'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ Toast ═══ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}