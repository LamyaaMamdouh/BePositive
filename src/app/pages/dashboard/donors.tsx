import { motion, AnimatePresence } from "motion/react";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../contexts/language-context";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  BadgeCheck,
  XCircle,
  X,
  PhoneCall,
  MessageSquare,
  Loader2,
} from "lucide-react";
import apiClient from "../../../api/apiClient";
import ENDPOINTS from "../../../api/endpoints";

// ─── API Types ────────────────────────────────────────────────

interface APIBloodType {
  id: string;
  typename: string;
}

interface APIDonor {
  donorid: string;
  fullname: string;
  phone: string;
  bloodtypename: string;
  lastdonationdate: string;
  totaldonations: number;
  iseligible: boolean;
}

interface APIDonorDetail {
  donorid: string;
  fullname: string;
  bloodtypename: string;
  cityname: string;
  phone: string;
  email: string;
  lastdonationdate: string;
  totaldonations: number;
  iseligible: boolean;
}

interface APIStats {
  eligibledonors: number;
  recentlydonated: number;
  currentlyineligible: number;
}

// ─── Counter animation hook ───────────────────────────────────

function useCounterAnimation(
  targetValue: number,
  duration: number = 1500,
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1,
      );
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * targetValue));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  return count;
}

// ─── Component ────────────────────────────────────────────────

export function DonorsMonitoring() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // ── UI state ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDialog, setShowFilterDialog] =
    useState(false);
  const [showContactDialog, setShowContactDialog] =
    useState(false);

  // ── Blood type options (from API) ─────────────────────────────
  const [bloodTypeOptions, setBloodTypeOptions] = useState<
    APIBloodType[]
  >([]);
  const [isLoadingBloodTypes, setIsLoadingBloodTypes] =
    useState(false);

  // ── Pending filter state (inside modal, not yet applied) ──────
  const [pendingBloodTypeIds, setPendingBloodTypeIds] =
    useState<string[]>([]);
  const [pendingStatus, setPendingStatus] = useState<
    "Eligible" | "Ineligible" | ""
  >("");

  // ── Applied filter state (sent to API) ────────────────────────
  const [appliedBloodTypeId, setAppliedBloodTypeId] =
    useState("");
  const [appliedStatus, setAppliedStatus] = useState<
    "Eligible" | "Ineligible" | ""
  >("");

  // ── API data state ────────────────────────────────────────────
  const [donors, setDonors] = useState<APIDonor[]>([]);
  const [stats, setStats] = useState<APIStats | null>(null);
  const [donorDetail, setDonorDetail] =
    useState<APIDonorDetail | null>(null);
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ── Debounced search ──────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    if (debounceTimer.current)
      clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => {
      if (debounceTimer.current)
        clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  // ── Counter animation targets ─────────────────────────────────
  const eligibleCount = useCounterAnimation(
    stats?.eligibledonors ?? 0,
  );
  const recentCount = useCounterAnimation(
    stats?.recentlydonated ?? 0,
  );
  const ineligibleCount = useCounterAnimation(
    stats?.currentlyineligible ?? 0,
  );

  // ── Fetch blood types (on mount) ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchBloodTypes = async () => {
      setIsLoadingBloodTypes(true);
      try {
        const res = await apiClient.get(
          ENDPOINTS.LOCATIONS.BLOOD_TYPES,
        );
        if (!cancelled)
          setBloodTypeOptions(res.data.value as APIBloodType[]);
      } catch {
        // fall back to empty — buttons just won't render
      } finally {
        if (!cancelled) setIsLoadingBloodTypes(false);
      }
    };
    fetchBloodTypes();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch stats (on mount) ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const res = await apiClient.get(
          ENDPOINTS.HOSPITAL.DONOR_STATS,
        );
        if (!cancelled) setStats(res.data.value as APIStats);
      } catch {
        // stats remain null; counters show 0
      } finally {
        if (!cancelled) setIsLoadingStats(false);
      }
    };
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch donors ───��──────────────────────────────────────────
  const fetchDonors = useCallback(
    async (page: number, append: boolean = false) => {
      if (append) setIsLoadingMore(true);
      else setIsLoadingDonors(true);

      try {
        const params: Record<string, string | number> = {
          page,
          limit: 10,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (appliedBloodTypeId)
          params.bloodTypeId = appliedBloodTypeId;
        if (appliedStatus) params.status = appliedStatus;

        const res = await apiClient.get(
          ENDPOINTS.HOSPITAL.DONORS,
          { params },
        );
        const data = res.data;
        const list: APIDonor[] = data.value ?? [];

        if (append) {
          setDonors((prev) => [...prev, ...list]);
        } else {
          setDonors(list);
        }
        setTotalPages(data.totalpages ?? 1);
      } catch {
        if (!append) setDonors([]);
      } finally {
        if (append) setIsLoadingMore(false);
        else setIsLoadingDonors(false);
      }
    },
    [debouncedSearch, appliedBloodTypeId, appliedStatus],
  );

  // Reset to page 1 and re-fetch whenever search or applied filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchDonors(1, false);
  }, [fetchDonors]);

  // ── Load more ─────────────────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchDonors(nextPage, true);
  };

  const hasMoreDonors = currentPage < totalPages;

  // ── Contact donor (fetch detail) ──────────────────────────────
  const handleContactDonor = async (donor: APIDonor) => {
    setDonorDetail(null);
    setDetailError(null);
    setShowContactDialog(true);
    setIsLoadingDetail(true);
    try {
      const res = await apiClient.get(
        ENDPOINTS.HOSPITAL.DONOR_DETAIL(donor.donorid),
      );
      setDonorDetail(res.data.value as APIDonorDetail);
    } catch {
      setDetailError(
        language === "ar"
          ? "فشل تحميل بيانات المتبرع"
          : "Failed to load donor details",
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ── Filter helpers ────────────────────────────────────────────
  const openFilterDialog = () => {
    // Sync pending state from currently applied filters when opening
    setPendingBloodTypeIds(
      appliedBloodTypeId ? [appliedBloodTypeId] : [],
    );
    setPendingStatus(appliedStatus);
    setShowFilterDialog(true);
  };

  const applyFilters = () => {
    setAppliedBloodTypeId(pendingBloodTypeIds[0] ?? "");
    setAppliedStatus(pendingStatus);
    setShowFilterDialog(false);
  };

  const clearPendingFilters = () => {
    setPendingBloodTypeIds([]);
    setPendingStatus("");
  };

  const clearAllFilters = () => {
    setPendingBloodTypeIds([]);
    setPendingStatus("");
    setAppliedBloodTypeId("");
    setAppliedStatus("");
  };

  const togglePendingBloodType = (id: string) => {
    setPendingBloodTypeIds((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id],
    );
  };

  const togglePendingStatus = (
    status: "Eligible" | "Ineligible",
  ) => {
    setPendingStatus((prev) => (prev === status ? "" : status));
  };

  const hasActiveFilters =
    appliedBloodTypeId !== "" || appliedStatus !== "";
  const activeFilterCount =
    (appliedBloodTypeId ? 1 : 0) + (appliedStatus ? 1 : 0);

  // ── Misc helpers ──────────────────────────────────────────────
  const handleNavigateToMessaging = () => {
    window.scrollTo(0, 0);
    navigate("/org/dashboard/messaging");
  };

  const handleCallDonor = (phone: string) =>
    window.open(`tel:${phone}`, "_self");
  const handleEmailDonor = (email: string) =>
    window.open(`mailto:${email}`, "_self");
  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  // ── Skeleton cards ────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 bg-white dark:bg-neutral-950 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-neutral-800" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-full bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-neutral-800 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 dark:border-neutral-800">
        <div className="h-9 rounded-xl bg-gray-200 dark:bg-neutral-800" />
        <div className="h-9 rounded-xl bg-gray-200 dark:bg-neutral-800" />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === "ar"
              ? "مراقبة المتبرعين"
              : "Donor Monitoring"}
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">
            {language === "ar"
              ? "إدارة والتواصل مع المتبرعين المسجلين."
              : "Manage and contact registered donors."}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1f1f1f] p-4 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {language === "ar"
                ? "متبرعون مؤهلون"
                : "Eligible Donors"}
            </p>
            {isLoadingStats ? (
              <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {eligibleCount.toLocaleString()}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1f1f1f] p-4 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {language === "ar"
                ? "تبرعوا مؤخراً"
                : "Recently Donated"}
            </p>
            {isLoadingStats ? (
              <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {recentCount.toLocaleString()}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1f1f1f] p-4 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {language === "ar"
                ? "غير مؤهلين حالياً"
                : "Currently Ineligible"}
            </p>
            {isLoadingStats ? (
              <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {ineligibleCount.toLocaleString()}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-[oklch(0.145_0_0)] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-neutral-900/50">
          <div className="relative w-full sm:w-96">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${language === "ar" ? "right-3" : "left-3"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "ar"
                  ? "البحث بالاسم، الهاتف، أو الفصيلة..."
                  : "Search by name, phone, or blood type..."
              }
              className={`w-full bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl py-2 ${language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"} focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent outline-none text-sm dark:text-white`}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              >
                <X className="w-4 h-4" />
                {language === "ar"
                  ? "مسح الفلاتر"
                  : "Clear Filters"}
              </button>
            )}
            <button
              onClick={openFilterDialog}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {language === "ar"
                ? "تصفية المتبرعين"
                : "Filter Donors"}
              {hasActiveFilters && (
                <span className="bg-[#D32F2F] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Donors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {isLoadingDonors ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {donors.map((donor, idx) => (
                <motion.div
                  key={donor.donorid}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    delay: idx * 0.05,
                    layout: { duration: 0.3 },
                  }}
                  whileHover={{
                    boxShadow:
                      "0 4px 20px rgba(211, 47, 47, 0.15)",
                  }}
                  className="border border-gray-100 dark:border-neutral-800 hover:border-[#D32F2F] rounded-2xl p-5 transition-all bg-white dark:bg-neutral-950 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-neutral-900 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-lg border border-gray-100 dark:border-neutral-800">
                        {donor.fullname.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#D32F2F] dark:group-hover:text-[#D32F2F] transition-colors">
                          {donor.fullname}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />{" "}
                          {donor.phone}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 text-[#D32F2F] font-bold flex items-center justify-center shadow-sm">
                      {donor.bloodtypename}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-neutral-400">
                        {language === "ar"
                          ? "آخر تبرع"
                          : "Last Donation"}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {donor.lastdonationdate}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-neutral-400">
                        {language === "ar"
                          ? "إجمالي التبرعات"
                          : "Total Donations"}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {donor.totaldonations}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center pt-1">
                      <span className="text-gray-500 dark:text-neutral-400">
                        {language === "ar"
                          ? "الحالة"
                          : "Status"}
                      </span>
                      {donor.iseligible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-md text-xs font-bold">
                          <BadgeCheck className="w-3 h-3" />{" "}
                          {language === "ar"
                            ? "مؤهل"
                            : "Eligible"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 rounded-md text-xs font-bold">
                          <XCircle className="w-3 h-3" />{" "}
                          {language === "ar"
                            ? "غير مؤهل"
                            : "Ineligible"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 dark:border-neutral-800">
                    <button
                      onClick={handleNavigateToMessaging}
                      className="flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    >
                      <Mail className="w-4 h-4" />
                      {language === "ar" ? "رسالة" : "Message"}
                    </button>
                    <button
                      onClick={() => handleContactDonor(donor)}
                      className="flex items-center justify-center gap-2 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    >
                      <PhoneCall className="w-4 h-4" />
                      {language === "ar" ? "اتصال" : "Contact"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Empty state */}
        {!isLoadingDonors && donors.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-neutral-400">
              {language === "ar"
                ? "لا يوجد متبرعون"
                : "No donors found"}
            </p>
          </div>
        )}

        {/* Load More */}
        {hasMoreDonors && (
          <div className="p-4 border-t border-gray-100 dark:border-neutral-800 text-center bg-gray-50/50 dark:bg-neutral-900/50">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D32F2F] hover:bg-red-700 text-white rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === "ar"
                    ? "جاري التحميل..."
                    : "Loading..."}
                </>
              ) : language === "ar" ? (
                "تحميل المزيد"
              ) : (
                "Load More Donors"
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Filter Dialog ───────────────────────────────────────── */}
      <AnimatePresence>
        {showFilterDialog && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFilterDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-950 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-950 z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === "ar"
                    ? "تصفية المتبرعين"
                    : "Filter Donors"}
                </h3>
                <button
                  onClick={() => setShowFilterDialog(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ── Blood Type ─────────────────────────────────── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {language === "ar"
                      ? "فصيلة الدم"
                      : "Blood Type"}
                  </label>

                  {isLoadingBloodTypes ? (
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-9 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {bloodTypeOptions.map((bt) => (
                        <motion.button
                          key={bt.id}
                          onClick={() =>
                            togglePendingBloodType(bt.id)
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                            pendingBloodTypeIds.includes(bt.id)
                              ? "bg-[#D32F2F] text-white shadow-md"
                              : "bg-gray-50 dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {bt.typename}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Eligibility Status ────────────────────────── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {language === "ar"
                      ? "حالة الأهلية"
                      : "Eligibility Status"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Eligible", "Ineligible"] as const).map(
                      (status) => (
                        <motion.button
                          key={status}
                          onClick={() =>
                            togglePendingStatus(status)
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                            pendingStatus === status
                              ? "bg-[#D32F2F] text-white shadow-md"
                              : "bg-gray-50 dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {status === "Eligible"
                            ? language === "ar"
                              ? "مؤهل"
                              : "Eligible"
                            : language === "ar"
                              ? "غير مؤهل"
                              : "Ineligible"}
                        </motion.button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-neutral-800 flex gap-3 sticky bottom-0 bg-white dark:bg-neutral-950">
                <button
                  onClick={clearPendingFilters}
                  className="flex-1 py-2.5 px-4 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  {language === "ar" ? "مسح الكل" : "Clear All"}
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-2.5 px-4 bg-[#D32F2F] hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  {language === "ar"
                    ? "تطبيق الفلاتر"
                    : "Apply Filters"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Contact Dialog ──────────────────────────────────────── */}
      <AnimatePresence>
        {showContactDialog && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowContactDialog(false);
              setDonorDetail(null);
              setDetailError(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-950 rounded-2xl border border-[#f3f4f6] dark:border-neutral-800 shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Loading state */}
              {isLoadingDetail && (
                <div className="p-16 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D32F2F]" />
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    {language === "ar"
                      ? "جاري التحميل..."
                      : "Loading..."}
                  </p>
                </div>
              )}

              {/* Error state */}
              {!isLoadingDetail && detailError && (
                <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                  <p className="text-sm text-red-500">
                    {detailError}
                  </p>
                  <button
                    onClick={() => {
                      setShowContactDialog(false);
                      setDetailError(null);
                    }}
                    className="mt-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {language === "ar" ? "إغلاق" : "Close"}
                  </button>
                </div>
              )}

              {/* Detail content */}
              {!isLoadingDetail && donorDetail && (
                <>
                  <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white dark:bg-neutral-900 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-2xl border-2 border-emerald-200 dark:border-emerald-800">
                        {donorDetail.fullname.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {donorDetail.fullname}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-neutral-400 flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-md font-medium text-xs">
                            {donorDetail.bloodtypename}
                          </span>
                          <span>{donorDetail.cityname}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowContactDialog(false);
                        setDonorDetail(null);
                      }}
                      className="p-2 hover:bg-white/50 dark:hover:bg-neutral-900/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl">
                        <Phone className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-neutral-400">
                            {language === "ar"
                              ? "رقم الهاتف"
                              : "Phone Number"}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {donorDetail.phone}
                          </p>
                        </div>
                      </div>

                      {donorDetail.email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl">
                          <Mail className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-neutral-400">
                              {language === "ar"
                                ? "البريد الإلكتروني"
                                : "Email"}
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {donorDetail.email}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl">
                        <Calendar className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-neutral-400">
                            {language === "ar"
                              ? "آخر تبرع"
                              : "Last Donation"}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {donorDetail.lastdonationdate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl">
                        <BadgeCheck className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-neutral-400">
                            {language === "ar"
                              ? "إجمالي التبرعات"
                              : "Total Donations"}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {donorDetail.totaldonations}{" "}
                            {language === "ar"
                              ? "تبرع"
                              : "donations"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button
                        onClick={() =>
                          handleCallDonor(donorDetail.phone)
                        }
                        className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-medium transition-all hover:scale-105"
                      >
                        <PhoneCall className="w-4 h-4" />
                        {language === "ar"
                          ? "اتصال"
                          : "Call Now"}
                      </button>
                      <button
                        onClick={() =>
                          openWhatsApp(donorDetail.phone)
                        }
                        className="flex items-center justify-center gap-2 py-3 bg-[#D32F2F] hover:bg-red-700 text-white rounded-xl font-medium transition-all hover:scale-105"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {language === "ar"
                          ? "رسالة"
                          : "Message"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}