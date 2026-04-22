import { motion } from "motion/react";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../contexts/language-context";
import {
  Search,
  Filter,
  Clock,
  Eye,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Users,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  Calendar,
  Save,
  Droplets,
  Activity,
  Zap,
  Heart,
} from "lucide-react";
import apiClient from "../../../api/apiClient";
import ENDPOINTS from "../../../api/endpoints";

// ── Circular Progress Component ─────────────────────────────
function CircleProgress({
  percent,
  size = 48,
  strokeWidth = 4,
  className = "",
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  
  // 100% or more is green, everything else is red.
  const color = percent >= 100 ? "#10B981" : "#D32F2F";

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-neutral-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span
        className="absolute font-bold text-gray-900 dark:text-white"
        style={{ fontSize: size * 0.22 }}
      >
        {Math.round(percent)}%
      </span>
    </div>
  );
}

interface RequestItem {
  id: string;
  bloodtypeid: string;
  bloodtypename: string;
  quantityrequired: number;
  quantityfulfilled: number;
  progresspercent: number;
  urgencylevel: string;
  status: string;
  note: string | null;
  deadline: string | null;
  createdat: string;
}

interface DonorResponse {
  responseid: string;
  donorid: string;
  fullname: string;
  bloodtypename: string;
  status: string;
  respondedat: string;
}

interface RequestDetail extends RequestItem {
  latitude: number | null;
  longitude: number | null;
  responses: number;
  accepted: number;
  arrived: number;
  donated: number;
  noshow: number;
  donorresponses: DonorResponse[] | null;
}

function getDisplayStatus(
  status: string,
  progresspercent: number,
  language: string,
) {
  if (status === "Open" && progresspercent > 0)
    return language === "ar" ? "قيد التنفيذ" : "In Progress";
  if (status === "Open")
    return language === "ar" ? "معلق" : "Pending";
  if (status === "Fulfilled")
    return language === "ar" ? "مكتمل" : "Fulfilled";
  if (status === "Cancelled")
    return language === "ar" ? "ملغى" : "Cancelled";
  if (status === "Expired")
    return language === "ar" ? "منتهي" : "Expired";
  return status;
}

function timeAgo(dateStr: string, language: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return language === "ar" ? "الآن" : "Just now";
  if (mins < 60)
    return language === "ar" ? `منذ ${mins} د` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)
    return language === "ar" ? `منذ ${hrs} س` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return language === "ar" ? `منذ ${days} ي` : `${days}d ago`;
}

export function ActiveRequests() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Data
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  // Detail modal
  const [detailData, setDetailData] =
    useState<RequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Cancel
  const [cancellingId, setCancellingId] = useState<
    string | null
  >(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<
    string | null
  >(null);

  // Use Inventory (Withdraw)
  const [withdrawReq, setWithdrawReq] =
    useState<RequestItem | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSubmitting, setWithdrawSubmitting] =
    useState(false);
  const [compatibleData, setCompatibleData] = useState<{
    requestedtype: string;
    exactunits: number;
    compatible: {
      bloodtypeid: string;
      bloodtypename: string;
      availableunits: number;
      isexactmatch: boolean;
    }[];
    totalavailable: number;
  } | null>(null);
  const [withdrawSelected, setWithdrawSelected] = useState("");
  const [withdrawUnits, setWithdrawUnits] = useState("");

  // Update modal
  const [updateReq, setUpdateReq] = useState<RequestItem | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    quantityrequired: 1,
    urgencylevel: "Routine",
    status: "Open",
    note: "",
    deadline: "",
  });

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
      };
      if (debouncedSearch.trim())
        params.search = debouncedSearch.trim();
      if (filterStatus) params.status = filterStatus;
      if (filterUrgency) params.urgencyLevel = filterUrgency;

      const res = await apiClient.get(
        ENDPOINTS.HOSPITAL.GET_REQUESTS,
        { params },
      );
      setRequests(res.data?.value ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalActive(res.data?.totalactive ?? 0);
      setTotalPages(res.data?.totalpages ?? 1);
    } catch (error: any) {
      setRequests([]);
      const status = error?.response?.status;
      if (status === 403) {
        showToast(
          language === "ar"
            ? "ليس لديك صلاحية لعرض الطلبات (403)."
            : "Access denied to view requests (403).",
          "error",
        );
      } else if (status !== 401) {
        showToast(
          language === "ar"
            ? "فشل تحميل الطلبات."
            : "Failed to load requests.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    filterStatus,
    filterUrgency,
    language,
  ]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleFilterApply = (
    status: string,
    urgency: string,
  ) => {
    setFilterStatus(status);
    setFilterUrgency(urgency);
    setPage(1);
    setShowFilters(false);
  };

  const handleDetails = async (id: string) => {
    setShowDetail(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await apiClient.get(
        ENDPOINTS.HOSPITAL.GET_REQUEST(id),
      );
      setDetailData(res.data?.value ?? null);
    } catch (err: any) {
      if (err?.response?.status === 404)
        showToast(
          language === "ar"
            ? "الطلب غير موجود."
            : "Request not found.",
          "error",
        );
      else
        showToast(
          language === "ar"
            ? "خطأ في تحميل التفاصيل."
            : "Failed to load details.",
          "error",
        );
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await apiClient.patch(
        ENDPOINTS.HOSPITAL.CANCEL_REQUEST(id),
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "Cancelled" } : r,
        ),
      );
      showToast(
        language === "ar"
          ? "تم إلغاء الطلب بنجاح."
          : "Request cancelled successfully.",
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400)
        showToast(
          err?.response?.data?.message ||
            (language === "ar"
              ? "لا يمكن إلغاء هذا الطلب."
              : "Cannot cancel this request."),
          "error",
        );
      else if (status === 404)
        showToast(
          language === "ar"
            ? "الطلب غير موجود."
            : "Request not found.",
          "error",
        );
      else
        showToast(
          language === "ar"
            ? "خطأ في الخادم."
            : "Server error.",
          "error",
        );
    } finally {
      setCancellingId(null);
      setShowCancelConfirm(null);
    }
  };

  const handleOpenUpdate = async (req: RequestItem) => {
    setUpdateReq(req);
    setUpdateLoading(true);
    try {
      const res = await apiClient.get(
        ENDPOINTS.HOSPITAL.GET_REQUEST(req.id),
      );
      const r = res.data?.value;
      if (r) {
        setUpdateForm({
          quantityrequired: r.quantityrequired ?? 1,
          urgencylevel: r.urgencylevel ?? "Routine",
          status: r.status ?? "Open",
          note: r.note ?? "",
          deadline: r.deadline ? r.deadline.slice(0, 16) : "",
        });
      }
    } catch {
      showToast(
        language === "ar"
          ? "فشل تحميل بيانات الطلب."
          : "Failed to load request data.",
        "error",
      );
      setUpdateReq(null);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!updateReq) return;
    setUpdateSubmitting(true);
    try {
      await apiClient.patch(
        ENDPOINTS.HOSPITAL.UPDATE_REQUEST(updateReq.id),
        {
          quantityrequired: updateForm.quantityrequired,
          urgencylevel: updateForm.urgencylevel,
          note: updateForm.note,
          deadline: updateForm.deadline
            ? new Date(updateForm.deadline).toISOString()
            : "",
          status: updateForm.status,
        },
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.id === updateReq.id
            ? {
                ...r,
                quantityrequired: updateForm.quantityrequired,
                urgencylevel: updateForm.urgencylevel,
                status: updateForm.status,
                note: updateForm.note,
              }
            : r,
        ),
      );
      showToast(
        language === "ar"
          ? "تم تحديث الطلب بنجاح."
          : "Request updated successfully.",
      );
      setUpdateReq(null);
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ||
          (language === "ar"
            ? "فشل تحديث الطلب."
            : "Failed to update request."),
        "error",
      );
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const activeFilterCount =
    (filterStatus ? 1 : 0) + (filterUrgency ? 1 : 0);

  const handleUseInventory = async (req: RequestItem) => {
    setWithdrawReq(req);
    setWithdrawLoading(true);
    setCompatibleData(null);
    setWithdrawSelected("");
    setWithdrawUnits("");
    try {
      const res = await apiClient.get(
        ENDPOINTS.HOSPITAL.INVENTORY_COMPATIBLE(
          req.bloodtypeid,
        ),
      );
      setCompatibleData(res.data?.value ?? null);
    } catch {
      showToast(
        language === "ar"
          ? "فشل تحميل المخزون المتاح."
          : "Failed to load available inventory.",
        "error",
      );
      setWithdrawReq(null);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawReq || !withdrawSelected || !withdrawUnits) {
      showToast(
        language === "ar"
          ? "يرجى ملء جميع الحقول."
          : "Please fill all fields.",
        "error",
      );
      return;
    }
    setWithdrawSubmitting(true);
    try {
      await apiClient.post(
        ENDPOINTS.HOSPITAL.INVENTORY_WITHDRAW,
        {
          bloodtypeid: withdrawSelected,
          units: parseInt(withdrawUnits),
          requestid: withdrawReq.id,
          notes: "Fulfilled from inventory",
        },
      );
      showToast(
        language === "ar"
          ? "تم استخدام المخزون بنجاح."
          : "Inventory used successfully.",
      );
      setWithdrawReq(null);
      fetchRequests();
    } catch {
      showToast(
        language === "ar"
          ? "فشل في سحب المخزون."
          : "Failed to withdraw inventory.",
        "error",
      );
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const SkeletonRows = () => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="py-4 px-6">
            <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-20" />
            <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-14 mt-2" />
          </td>
          <td className="py-4 px-6">
            <div className="w-12 h-12 bg-gray-200 dark:bg-neutral-700 rounded-full" />
          </td>
          <td className="py-4 px-6">
            <div className="h-5 bg-gray-200 dark:bg-neutral-700 rounded-full w-16" />
          </td>
          <td className="py-4 px-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gray-200 dark:bg-neutral-700 rounded-full" />
              <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-12" />
            </div>
          </td>
          <td className="py-4 px-6">
            <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-16" />
          </td>
          <td className="py-4 px-6">
            <div className="h-7 bg-gray-200 dark:bg-neutral-700 rounded-lg w-24 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );

  const SkeletonCards = () => (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-4 space-y-4 bg-white dark:bg-[#1f1f1f] rounded-2xl mb-3 mx-4 border border-gray-100 dark:border-neutral-800 animate-pulse"
        >
          <div className="flex justify-between">
            <div className="flex gap-3">
              <div className="w-14 h-14 bg-gray-200 dark:bg-neutral-700 rounded-full" />
              <div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-20" />
                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-14 mt-2" />
              </div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded-full w-18" />
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-neutral-900/50 rounded-xl">
            <div className="w-14 h-14 bg-gray-200 dark:bg-neutral-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-24" />
              <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-200 dark:bg-neutral-700 rounded-xl" />
            <div className="flex-1 h-10 bg-gray-200 dark:bg-neutral-700 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#D32F2F] via-[#B71C1C] to-[#880E0E] p-6 lg:p-8 shadow-xl shadow-red-500/10"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Activity className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                {language === "ar"
                  ? "الطلبات النشطة"
                  : "Active Requests"}
              </h2>
              <p className="text-red-100/80 mt-0.5 text-sm">
                {language === "ar"
                  ? "مراقبة وإدارة طلبات الدم الجارية"
                  : "Monitor and manage ongoing blood requests"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
              <Activity className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {totalActive} {language === "ar" ? "نشط" : "active"}
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm font-medium">
              {total} {language === "ar" ? "إجمالي" : "total"}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden flex flex-col"
      >
        {/* Toolbar */}
        <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80 group">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#D32F2F] transition-colors ${language === "ar" ? "right-3.5" : "left-3.5"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                handleSearchChange(e.target.value)
              }
              placeholder={
                language === "ar"
                  ? "البحث في الطلبات..."
                  : "Search requests..."
              }
              className={`w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl py-2.5 ${language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"} focus:ring-2 focus:ring-[#D32F2F]/30 focus:border-[#D32F2F] outline-none text-sm dark:text-white transition-all duration-200`}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-medium transition-all duration-200 relative ${
                showFilters || activeFilterCount > 0
                  ? "border-[#D32F2F]/30 bg-red-50 dark:bg-red-500/10 text-[#D32F2F]"
                  : "border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900 hover:border-gray-300 dark:hover:border-neutral-600"
              }`}
            >
              <Filter className="w-4 h-4" />
              {language === "ar" ? "تصفية" : "Filter"}
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D32F2F] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Dropdown */}
        {showFilters && (
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">
                  {language === "ar" ? "الحالة" : "Status"}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    handleFilterApply(
                      e.target.value,
                      filterUrgency,
                    )
                  }
                  className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm dark:text-white outline-none"
                >
                  <option value="">
                    {language === "ar" ? "الكل" : "All"}
                  </option>
                  <option value="Open">Open</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1.5">
                  {language === "ar" ? "الاستعجال" : "Urgency"}
                </label>
                <select
                  value={filterUrgency}
                  onChange={(e) =>
                    handleFilterApply(
                      filterStatus,
                      e.target.value,
                    )
                  }
                  className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm dark:text-white outline-none"
                >
                  <option value="">
                    {language === "ar" ? "الكل" : "All"}
                  </option>
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => handleFilterApply("", "")}
                className="text-xs text-[#D32F2F] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                {language === "ar"
                  ? "مسح الفلاتر"
                  : "Clear filters"}
              </button>
            )}
          </div>
        )}

        {/* Table - Desktop View */}
        {/* Modified Scrollbar using custom CSS styling to fix the issue natively */}
        <div className="hidden lg:block overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 dark:from-neutral-900/80 dark:to-neutral-900/30 border-b border-gray-100 dark:border-neutral-800">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  {language === "ar"
                    ? "رقم الطلب"
                    : "Request ID"}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  {language === "ar" ? "الفصيلة" : "Blood Type"}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  {language === "ar" ? "الاستعجال" : "Urgency"}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  {language === "ar" ? "التقدم" : "Progress"}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  {language === "ar" ? "الحالة" : "Status"}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider text-right whitespace-nowrap">
                  {language === "ar" ? "إجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {loading ? (
                <SkeletonRows />
              ) : (
                requests.map((req, idx) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50/80 dark:hover:bg-neutral-900/50 transition-all duration-200 group/row"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {req.id.slice(0, 8)}...
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />{" "}
                          {timeAgo(req.createdat, language)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/15 dark:to-red-500/5 text-[#D32F2F] font-bold flex items-center justify-center border border-red-100 dark:border-red-500/20 shadow-sm shadow-red-500/10">
                        <Droplets className="w-3 h-3 mr-0.5 opacity-60" />
                        {req.bloodtypename}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          req.urgencylevel === "Critical"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-500/30"
                            : req.urgencylevel === "Urgent"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/30"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/30"
                        }`}
                      >
                        {req.urgencylevel === "Critical" && <Zap className="w-3 h-3" />}
                        {req.urgencylevel === "Urgent" && <AlertCircle className="w-3 h-3" />}
                        {req.urgencylevel === "Routine" && <Heart className="w-3 h-3" />}
                        {req.urgencylevel}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <CircleProgress
                          percent={req.progresspercent}
                          size={44}
                          strokeWidth={4}
                        />
                        <div className="text-xs text-gray-500 dark:text-neutral-400">
                          <span className="font-semibold text-gray-900 dark:text-white block">
                            {req.quantityfulfilled}/{req.quantityrequired}
                          </span>
                          {language === "ar" ? "وحدة" : "units"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {/* Added whitespace-nowrap to fix "In Progress" splitting issue */}
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          req.status === "Fulfilled"
                            ? "bg-emerald-500 shadow-md shadow-emerald-500/30"
                            : req.status === "Cancelled"
                              ? "bg-gray-400"
                              : req.status === "Expired"
                                ? "bg-orange-400"
                                : req.progresspercent > 0
                                  ? "bg-cyan-500 animate-pulse shadow-md shadow-cyan-500/50" 
                                  : "bg-blue-500 animate-pulse shadow-md shadow-blue-500/30"
                        }`} />
                        {getDisplayStatus(
                          req.status,
                          req.progresspercent,
                          language,
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDetails(req.id)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {language === "ar"
                            ? "التفاصيل"
                            : "Details"}
                        </button>
                        {req.status === "Open" && (
                          <>
                            {/* Added whitespace-nowrap to prevent "Use Inventory" wrapping */}
                            <button
                              onClick={() =>
                                handleUseInventory(req)
                              }
                              className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-emerald-500/10 whitespace-nowrap"
                            >
                              <Package className="w-3.5 h-3.5" />
                              {language === "ar"
                                ? "المخزون"
                                : "Use Inventory"}
                            </button>
                            <button
                              onClick={() =>
                                handleOpenUpdate(req)
                              }
                              className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              {language === "ar"
                                ? "تحديث"
                                : "Update"}
                            </button>
                            <button
                              onClick={() =>
                                setShowCancelConfirm(req.id)
                              }
                              disabled={cancellingId === req.id}
                              className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-500 hover:text-red-600 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                            >
                              {cancellingId === req.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              {language === "ar"
                                ? "إلغاء"
                                : "Cancel"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card View - Mobile/Tablet */}
        {/* Adjusted Mobile layout to avoid strange scrolling issues and fit things properly */}
        <div className="lg:hidden divide-y divide-gray-100 dark:divide-neutral-800 pb-3 flex flex-col">
          {loading ? (
            <SkeletonCards />
          ) : (
            requests.map((req, idx) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 space-y-4 bg-white dark:bg-[#1f1f1f] rounded-2xl mb-3 mx-4 border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/15 dark:to-red-500/5 text-[#D32F2F] font-bold flex items-center justify-center text-sm border border-red-100 dark:border-red-500/20 shadow-sm shadow-red-500/10 flex-shrink-0">
                      <Droplets className="w-3 h-3 mr-0.5 opacity-60" />
                      {req.bloodtypename}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {req.id.slice(0, 8)}...
                      </h4>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />{" "}
                        {timeAgo(req.createdat, language)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      req.urgencylevel === "Critical"
                        ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-500/30"
                        : req.urgencylevel === "Urgent"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/30"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/30"
                    }`}
                  >
                    {req.urgencylevel === "Critical" && <Zap className="w-3 h-3" />}
                    {req.urgencylevel === "Urgent" && <AlertCircle className="w-3 h-3" />}
                    {req.urgencylevel === "Routine" && <Heart className="w-3 h-3" />}
                    {req.urgencylevel}
                  </span>
                </div>

                {/* Circular Progress Section */}
                <div className="flex items-center gap-4 py-2 px-3 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border border-gray-100 dark:border-neutral-800">
                  <CircleProgress
                    percent={req.progresspercent}
                    size={56}
                    strokeWidth={5}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        req.status === "Fulfilled"
                          ? "bg-emerald-500 shadow-md shadow-emerald-500/30"
                          : req.status === "Cancelled"
                            ? "bg-gray-400"
                            : req.progresspercent > 0
                              ? "bg-cyan-500 animate-pulse shadow-md shadow-cyan-500/50"
                              : "bg-blue-500 animate-pulse shadow-md shadow-blue-500/30"
                      }`} />
                      {/* Prevent "In Progress" splitting on mobile */}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {getDisplayStatus(
                          req.status,
                          req.progresspercent,
                          language,
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-neutral-400">
                      {req.quantityfulfilled}/{req.quantityrequired}{" "}
                      {language === "ar" ? "وحدة مكتملة" : "units fulfilled"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDetails(req.id)}
                    className="flex-1 py-2.5 px-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    {language === "ar" ? "التفاصيل" : "Details"}
                  </button>
                  {req.status === "Open" && (
                    <>
                      {/* Prevent "Use Inventory" splitting on mobile */}
                      <button
                        onClick={() => handleUseInventory(req)}
                        className="flex-1 py-2.5 px-3 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 hover:bg-emerald-600 hover:text-white text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 whitespace-nowrap"
                      >
                        <Package className="w-4 h-4" />
                        {language === "ar"
                          ? "المخزون"
                          : "Use Inventory"}
                      </button>
                      <button
                        onClick={() => handleOpenUpdate(req)}
                        className="flex-1 py-2.5 px-3 bg-red-50 dark:bg-red-500/10 text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {language === "ar" ? "تحديث" : "Update"}
                      </button>
                      <button
                        onClick={() =>
                          setShowCancelConfirm(req.id)
                        }
                        disabled={cancellingId === req.id}
                        className="py-2.5 px-3 bg-gray-100 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-500 hover:text-red-600 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 whitespace-nowrap"
                      >
                        {cancellingId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="py-20 px-4 text-center">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-5">
              <img
                src={new URL("../../../imports/Untitled_design_(7)-2.png", import.meta.url).href}
                alt="Be Positive Logo"
                className="w-full h-full object-contain opacity-40 dark:opacity-70 transition-opacity duration-300"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {language === "ar"
                ? "لم يتم العثور على نتائج"
                : "No results found"}
            </h3>
            <p className="text-gray-500 dark:text-neutral-400 text-sm max-w-xs mx-auto">
              {language === "ar"
                ? "حاول البحث بكلمات مفتاحية مختلفة أو غيّر الفلاتر"
                : "Try searching with different keywords or adjust your filters"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 lg:p-5 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-900/30">
            <span className="text-sm text-gray-500 dark:text-neutral-400">
              {language === "ar"
                ? `صفحة ${page} من ${totalPages}`
                : `Page ${page} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page === 1}
                className="p-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600 disabled:opacity-30 transition-all duration-200 hover:shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-gray-900 dark:text-white px-3 py-1.5 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 min-w-[3rem] text-center">
                {page}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600 disabled:opacity-30 transition-all duration-200 hover:shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDetail(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white dark:from-neutral-900/50 dark:to-[#1F1F1F]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {language === "ar"
                    ? "تفاصيل الطلب"
                    : "Request Details"}
                </h3>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {detailLoading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 dark:border-neutral-600 border-t-[#D32F2F] rounded-full animate-spin" />
              </div>
            ) : (
              detailData && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/20 dark:to-red-500/5 text-[#D32F2F] font-bold text-2xl flex items-center justify-center border border-red-100 dark:border-red-500/20 shadow-lg shadow-red-500/10 flex-shrink-0">
                      {detailData.bloodtypename}
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          detailData.urgencylevel === "Critical"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                            : detailData.urgencylevel ===
                                "Urgent"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                        }`}
                      >
                        {detailData.urgencylevel}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                        {getDisplayStatus(
                          detailData.status,
                          detailData.progresspercent,
                          language,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border border-gray-100 dark:border-neutral-800">
                    <CircleProgress
                      percent={detailData.progresspercent}
                      size={64}
                      strokeWidth={5}
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 dark:text-neutral-400">
                        {language === "ar"
                          ? "التقدم"
                          : "Progress"}
                      </span>
                      <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                        {detailData.quantityfulfilled} /{" "}
                        {detailData.quantityrequired}{" "}
                        {language === "ar" ? "وحدة" : "units"}
                      </p>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-neutral-400">
                        {language === "ar"
                          ? "تاريخ الإنشاء"
                          : "Created"}
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                        {new Date(
                          detailData.createdat,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-neutral-400">
                        {language === "ar"
                          ? "الموعد النائي"
                          : "Deadline"}
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                        {detailData.deadline
                          ? new Date(
                              detailData.deadline,
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {detailData.note && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-neutral-400">
                        {language === "ar"
                          ? "ملاحظات"
                          : "Notes"}
                      </span>
                      <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                        {detailData.note}
                      </p>
                    </div>
                  )}

                  {/* Response stats */}
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">
                      {language === "ar"
                        ? "إحصائيات الاستجابة"
                        : "Response Stats"}
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        {
                          label:
                            language === "ar"
                              ? "استجابات"
                              : "Responses",
                          value: detailData.responses,
                          icon: Users,
                          color: "text-blue-500",
                        },
                        {
                          label:
                            language === "ar"
                              ? "مقبول"
                              : "Accepted",
                          value: detailData.accepted,
                          icon: CheckCircle2,
                          color: "text-green-500",
                        },
                        {
                          label:
                            language === "ar"
                              ? "وصل"
                              : "Arrived",
                          value: detailData.arrived,
                          icon: UserCheck,
                          color: "text-emerald-500",
                        },
                        {
                          label:
                            language === "ar"
                              ? "تبرع"
                              : "Donated",
                          value: detailData.donated,
                          icon: AlertCircle,
                          color: "text-[#D32F2F]",
                        },
                        {
                          label:
                            language === "ar"
                              ? "لم يحضر"
                              : "No-show",
                          value: detailData.noshow,
                          icon: UserX,
                          color: "text-gray-400",
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="text-center p-2.5 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 hover:shadow-sm transition-shadow duration-200"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center mx-auto shadow-sm">
                            <s.icon
                              className={`w-4 h-4 ${s.color}`}
                            />
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1.5">
                            {s.value}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-neutral-400">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Donor Responses */}
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">
                      {language === "ar"
                        ? "استجابات المتبرعين"
                        : "Donor Responses"}
                    </span>
                    {!detailData.donorresponses || detailData.donorresponses.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-neutral-400 text-center py-4">
                        {language === "ar"
                          ? "لم يستجب أي متبرع بعد."
                          : "No donors have responded yet."}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
                        {detailData.donorresponses.map((dr) => {
                          const statusMap: Record<string, { label: string; cls: string }> = {
                            Pending: { label: language === "ar" ? "قيد الانتظار" : "Pending", cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" },
                            Accepted: { label: language === "ar" ? "مؤكد" : "Confirmed", cls: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
                            Arrived: { label: language === "ar" ? "وصل" : "Arrived", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
                            Donated: { label: language === "ar" ? "تبرع" : "Donated", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
                            NoShow: { label: language === "ar" ? "لم يحضر" : "No-show", cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
                            Rejected: { label: language === "ar" ? "مرفوض" : "Rejected", cls: "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-400" },
                          };
                          const s = statusMap[dr.status] || { label: dr.status, cls: "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-400" };
                          return (
                            <div
                              key={dr.responseid}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-500/10 text-[#D32F2F] font-bold text-sm flex items-center justify-center flex-shrink-0">
                                  {dr.fullname?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {dr.fullname}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-500/10 text-[#D32F2F] rounded text-[10px] font-bold">
                                      {dr.bloodtypename}
                                    </span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {timeAgo(dr.respondedat, language)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${s.cls}`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCancelConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-500/20 dark:to-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/10">
                <XCircle className="w-8 h-8 text-[#D32F2F]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {language === "ar"
                  ? "إلغاء الطلب؟"
                  : "Cancel Request?"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
                {language === "ar"
                  ? "لا يمكن التراجع عن هذا الإجراء."
                  : "This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(null)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  {language === "ar" ? "لا" : "No"}
                </button>
                <button
                  onClick={() =>
                    handleCancel(showCancelConfirm)
                  }
                  disabled={!!cancellingId}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {cancellingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {language === "ar"
                    ? "نعم، إلغاء"
                    : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fulfill from Inventory Modal */}
      {withdrawReq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setWithdrawReq(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {language === "ar"
                      ? "صرف من المخزون"
                      : "Withdraw from Inventory"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {language === "ar"
                      ? `طلب ${withdrawReq.bloodtypename}`
                      : `Request for ${withdrawReq.bloodtypename}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWithdrawReq(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {withdrawLoading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 dark:border-neutral-600 border-t-[#D32F2F] rounded-full animate-spin" />
              </div>
            ) : compatibleData ? (
              <div className="p-5 space-y-4">
                {/* Total Available */}
                <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-4 text-center border border-gray-100 dark:border-neutral-800 shadow-inner">
                  <span className="text-sm text-gray-500 dark:text-neutral-400">
                    {language === "ar"
                      ? "إجمالي المتاح"
                      : "Total Available"}
                  </span>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {compatibleData.totalavailable}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      {language === "ar" ? "وحدة" : "units"}
                    </span>
                  </p>
                </div>

                {/* Exact Match */}
                {compatibleData.compatible.filter(
                  (c) => c.isexactmatch,
                ).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 pr-1">
                      {language === "ar"
                        ? "تطابق تام"
                        : "Exact Match"}
                    </h4>
                    <div className="space-y-2.5">
                      {compatibleData.compatible
                        .filter((c) => c.isexactmatch)
                        .map((c) => (
                          <button
                            key={c.bloodtypeid}
                            onClick={() =>
                              setWithdrawSelected(c.bloodtypeid)
                            }
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 shadow-sm ${
                              withdrawSelected === c.bloodtypeid
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-emerald-500/10"
                                : "border-gray-200 dark:border-neutral-700 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-12 h-12 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 text-[#D32F2F] font-bold text-base flex items-center justify-center border border-red-100 dark:border-red-500/20">
                                {c.bloodtypename}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white text-base">
                                {c.availableunits}{" "}
                                <span className="font-normal text-sm text-gray-500">
                                  {language === "ar"
                                    ? "وحدة متاحة"
                                    : "units available"}
                                </span>
                              </span>
                            </div>
                            {withdrawSelected ===
                              c.bloodtypeid && (
                              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Compatible Types */}
                {compatibleData.compatible.filter(
                  (c) => !c.isexactmatch,
                ).length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 pr-1">
                      {language === "ar"
                        ? "أنواع متوافقة"
                        : "Compatible Types"}
                    </h4>
                    <div className="space-y-2.5">
                      {compatibleData.compatible
                        .filter((c) => !c.isexactmatch)
                        .map((c) => (
                          <button
                            key={c.bloodtypeid}
                            onClick={() =>
                              setWithdrawSelected(c.bloodtypeid)
                            }
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 shadow-sm ${
                              withdrawSelected === c.bloodtypeid
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-emerald-500/10"
                                : "border-gray-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-800 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-500/10 dark:to-orange-500/5 text-orange-700 font-bold text-base flex items-center justify-center border border-orange-100 dark:border-orange-500/20">
                                {c.bloodtypename}
                              </span>
                              <div>
                                <span className="font-semibold text-gray-900 dark:text-white text-base block">
                                  {c.availableunits}{" "}
                                  <span className="font-normal text-sm text-gray-500">
                                    {language === "ar"
                                      ? "وحدة متاحة"
                                      : "units available"}
                                  </span>
                                </span>
                                <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                                  {language === "ar"
                                    ? "نوع متوافق"
                                    : "Compatible type"}
                                </span>
                              </div>
                            </div>
                            {withdrawSelected ===
                              c.bloodtypeid && (
                              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Units Input */}
                {withdrawSelected && (
                  <div className="pt-3 border-t border-gray-100 dark:border-neutral-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2 pr-1">
                      {language === "ar"
                        ? "عدد الوحدات للسحب"
                        : "Units to withdraw"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={
                        compatibleData.compatible.find(
                          (c) =>
                            c.bloodtypeid === withdrawSelected,
                        )?.availableunits ?? 1000
                      }
                      value={withdrawUnits}
                      onChange={(e) =>
                        setWithdrawUnits(e.target.value)
                      }
                      placeholder={
                        language === "ar"
                          ? "أدخل العدد المطللوب..."
                          : "Enter required amount..."
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white text-sm"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-16 text-center text-gray-500 dark:text-neutral-400">
                {language === "ar"
                  ? "لا يوجد مخزون متاح."
                  : "No compatible inventory available."}
              </div>
            )}

            {compatibleData && !withdrawLoading && (
              <div className="p-5 border-t border-gray-100 dark:border-neutral-800 flex gap-3 bg-gray-50 dark:bg-neutral-900/50">
                <button
                  onClick={() => setWithdrawReq(null)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleWithdrawSubmit}
                  disabled={
                    withdrawSubmitting ||
                    !withdrawSelected ||
                    !withdrawUnits
                  }
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-400 shadow-md shadow-emerald-500/20"
                >
                  {withdrawSubmitting && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {language === "ar"
                    ? "تأكيد السحب من المخزون"
                    : "Confirm Withdraw"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Update Modal */}
      {updateReq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !updateSubmitting && setUpdateReq(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 text-[#D32F2F] flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {language === "ar" ? "تحديث الطلب" : "Update Request"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {updateReq.bloodtypename} • {updateReq.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={() => !updateSubmitting && setUpdateReq(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {updateLoading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 dark:border-neutral-600 border-t-[#D32F2F] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Quantity & Deadline */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5 pr-1">
                      {language === "ar" ? "عدد الوحدات المطلوبة" : "Units Required"} *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={updateForm.quantityrequired}
                      onChange={(e) =>
                        setUpdateForm((f) => ({
                          ...f,
                          quantityrequired: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5 pr-1">
                      {language === "ar" ? "الموعد النهائي" : "Deadline"} *
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute ${language === "ar" ? "right-2.5" : "left-2.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                      <input
                        type="datetime-local"
                        required
                        value={updateForm.deadline}
                        onChange={(e) =>
                          setUpdateForm((f) => ({
                            ...f,
                            deadline: e.target.value,
                          }))
                        }
                        className={`w-full ${language === "ar" ? "pr-8 pl-2" : "pl-8 pr-2"} py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm [color-scheme:light] dark:[color-scheme:dark]`}
                      />
                    </div>
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2 pr-1">
                    {language === "ar" ? "مستوى الأولوية (الاستعجال)" : "Urgency Level"} *
                  </label>
                  <div className="flex gap-2.5">
                    {(
                      [
                        {
                          value: "Critical",
                          label: language === "ar" ? "حرجة" : "Critical",
                          active: "bg-red-100 dark:bg-red-500/20 border-2 border-red-500 text-red-700 dark:text-red-400 shadow-md shadow-red-500/10",
                          inactive: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all",
                        },
                        {
                          value: "Urgent",
                          label: language === "ar" ? "عاجلة" : "Urgent",
                          active: "bg-orange-100 dark:bg-orange-500/20 border-2 border-orange-500 text-orange-700 dark:text-orange-400 shadow-md shadow-orange-500/10",
                          inactive: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all",
                        },
                        {
                          value: "Routine",
                          label: language === "ar" ? "روتينية" : "Routine",
                          active: "bg-blue-100 dark:bg-blue-500/20 border-2 border-blue-500 text-blue-700 dark:text-blue-400 shadow-md shadow-blue-500/10",
                          inactive: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all",
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setUpdateForm((f) => ({
                            ...f,
                            urgencylevel: opt.value,
                          }))
                        }
                        className={`flex-1 py-3 px-3 rounded-xl font-semibold text-xs transition-all duration-300 ${
                          updateForm.urgencylevel === opt.value
                            ? opt.active
                            : opt.inactive
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5 pr-1">
                    {language === "ar" ? "حالة الطلب الحالية" : "Current Request Status"} *
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) =>
                      setUpdateForm((f) => ({
                        ...f,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm"
                  >
                    <option value="Open">
                      {language === "ar" ? "مفتوح" : "Open"}
                    </option>
                    <option value="Fulfilled">
                      {language === "ar" ? "مكتمل" : "Fulfilled"}
                    </option>
                    <option value="Cancelled">
                      {language === "ar" ? "ملغي" : "Cancelled"}
                    </option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5 pr-1">
                    {language === "ar" ? "ملاحظات إضافية" : "Additional Notes"}
                  </label>
                  <textarea
                    rows={4}
                    value={updateForm.note}
                    onChange={(e) =>
                      setUpdateForm((f) => ({
                        ...f,
                        note: e.target.value,
                      }))
                    }
                    placeholder={
                      language === "ar"
                        ? "أضف أي ملاحظات أو تعليمات إضافية هنا..."
                        : "Add any additional notes or instructions here..."
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-sm resize-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 mt-1 rounded-b-2xl -mx-5 px-5">
                  <button
                    type="button"
                    disabled={updateSubmitting}
                    onClick={() => setUpdateReq(null)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {language === "ar" ? "إلغاء التحديث" : "Cancel Update"}
                  </button>
                  <button
                    type="button"
                    disabled={updateSubmitting}
                    onClick={handleUpdateSubmit}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-semibold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-gray-400"
                  >
                    {updateSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {language === "ar"
                      ? "حفظ تغييرات الطلب"
                      : "Save Request Changes"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/30"
              : "bg-red-600 text-white shadow-xl shadow-red-500/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </motion.div>
      )}
    </div>
  );
}