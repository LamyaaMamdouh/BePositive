import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '../../contexts/language-context';
import { ArrowLeft, Calendar, Save, X, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import ENDPOINTS from '../../../api/endpoints';

// ── API body shape ────────────────────────────────────────────
interface UpdateRequestBody {
  quantityrequired: number;
  urgencylevel: string;
  note: string;
  deadline: string;
  status: string;
}

// ── Existing request shape from GET ──────────────────────────
interface RequestDetail {
  id: string;
  bloodtypename: string;
  quantityrequired: number;
  urgencylevel: string;
  status: string;
  note: string;
  deadline: string;
}

export function UpdateRequest() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ── Form state (matches API body exactly) ─────────────────
  const [quantityrequired, setQuantityrequired] = useState(1);
  const [urgencylevel, setUrgencylevel]         = useState('Routine');
  const [status, setStatus]                     = useState('Open');
  const [note, setNote]                         = useState('');
  const [deadline, setDeadline]                 = useState('');

  // ── Read-only display (not editable via PATCH) ────────────
  const [bloodTypeName, setBloodTypeName] = useState('');

  // ── UI state ──────────────────────────────────────────────
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState('');

  // ── Fetch existing request to pre-populate form ───────────
  useEffect(() => {
    if (!id) return;
    setFetchLoading(true);
    setFetchError('');

    apiClient
      .get<{ statusCode: number; value: RequestDetail }>(ENDPOINTS.HOSPITAL.GET_REQUEST(id))
      .then((res) => {
        const r = res.data?.value;
        if (r) {
          setQuantityrequired(r.quantityrequired ?? 1);
          setUrgencylevel(r.urgencylevel ?? 'Routine');
          setStatus(r.status ?? 'Open');
          setNote(r.note ?? '');
          setBloodTypeName(r.bloodtypename ?? '');
          // Convert ISO to datetime-local format (strip trailing Z/ms for input)
          if (r.deadline) {
            setDeadline(r.deadline.slice(0, 16));
          }
        }
      })
      .catch(() => {
        setFetchError(
          language === 'ar'
            ? 'فشل تحميل بيانات الطلب.'
            : 'Failed to load request data.'
        );
      })
      .finally(() => setFetchLoading(false));
  }, [id]);

  // ── Submit — PATCH /api/hospital/requests/:id ─────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    console.log("Token in storage:", localStorage.getItem("access_token"));
    console.log("All localStorage keys:", Object.keys(localStorage));

    setSubmitError('');
    setIsSubmitting(true);

    const body: UpdateRequestBody = {
      quantityrequired,
      urgencylevel,
      note,
      deadline: deadline ? new Date(deadline).toISOString() : '',
      status,
    };

    try {
      await apiClient.patch(ENDPOINTS.HOSPITAL.UPDATE_REQUEST(id), body);
      window.scrollTo(0, 0);
      navigate('/org/dashboard/requests/active');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setSubmitError(
        error?.response?.data?.message ||
          (language === 'ar'
            ? 'فشل تحديث الطلب. يرجى المحاولة مرة أخرى.'
            : 'Failed to update request. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Urgency options (exact API enum values) ───────────────
  const URGENCY_OPTIONS = [
    {
      value: 'Critical',
      label: language === 'ar' ? 'حرجة' : 'Critical',
      active:   'bg-[#FEE2E2] dark:bg-[#450A0A] border-2 border-[#DC2626] dark:border-[#EF4444] text-[#991B1B] dark:text-[#FCA5A5]',
      inactive: 'bg-[#FEE2E2] dark:bg-[rgba(220,38,38,0.15)] text-[#991B1B] dark:text-[#FCA5A5]',
    },
    {
      value: 'Urgent',
      label: language === 'ar' ? 'عاجلة' : 'Urgent',
      active:   'bg-[#FFEDD5] dark:bg-[rgba(249,115,22,0.2)] border-2 border-[#F97316] dark:border-[#FB923C] text-[#9A3412] dark:text-[#FDBA74]',
      inactive: 'bg-[#FFEDD5] dark:bg-[rgba(249,115,22,0.15)] text-[#9A3412] dark:text-[#FDBA74]',
    },
    {
      value: 'Routine',
      label: language === 'ar' ? 'روتينية' : 'Routine',
      active:   'bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.2)] border-2 border-[#3B82F6] dark:border-[#60A5FA] text-[#1E3A8A] dark:text-[#93C5FD]',
      inactive: 'bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.15)] text-[#1E3A8A] dark:text-[#93C5FD]',
    },
  ];

  // ── Status options (exact API enum values) ────────────────
  const STATUS_OPTIONS = [
    { value: 'Open',      label: language === 'ar' ? 'مفتوح'     : 'Open'      },
    { value: 'Fulfilled', label: language === 'ar' ? 'مكتمل'     : 'Fulfilled' },
    { value: 'Cancelled', label: language === 'ar' ? 'ملغي'      : 'Cancelled' },
  ];

  // ── Loading skeleton ──────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Fetch error ──────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/org/dashboard/requests/active')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'تحديث الطلب' : 'Update Request'}
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-1 text-sm">
            {id} • {language === 'ar' ? 'تعديل تفاصيل الطلب' : 'Modify request details'}
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6 space-y-6"
      >
        {/* Blood Type — read-only (not part of PATCH body) */}
        {bloodTypeName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              {language === 'ar' ? 'فصيلة الدم' : 'Blood Type'}
            </label>
            <div className="inline-flex items-center px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 font-bold">
              {bloodTypeName}
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-neutral-500">
                ({language === 'ar' ? 'لا يمكن تغييرها' : 'cannot be changed'})
              </span>
            </div>
          </div>
        )}

        {/* Quantity & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              {language === 'ar' ? 'عدد الوحدات' : 'Number of Units'} *
            </label>
            <input
              type="number"
              required
              min={1}
              value={quantityrequired}
              onChange={(e) => setQuantityrequired(Number(e.target.value))}
              placeholder={language === 'ar' ? 'مال: 5' : 'e.g., 5'}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              {language === 'ar' ? 'الموعد النهائي' : 'Deadline'} *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-400" />
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-3">
            {language === 'ar' ? 'مستوى الأولوية' : 'Urgency Level'} *
          </label>
          <div className="flex gap-2">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setUrgencylevel(opt.value)}
                className={`
                  flex-1 py-2.5 px-3 rounded-full font-medium text-sm
                  transition-all duration-200 ease-in-out
                  hover:scale-[1.02] active:scale-95
                  ${urgencylevel === opt.value ? opt.active : opt.inactive}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
            {language === 'ar' ? 'حالة الطلب' : 'Request Status'} *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
            {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={language === 'ar' ? 'أضف أي ملاحظات أو تحديثات...' : 'Add any notes or updates...'}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white resize-none"
          />
        </div>

        {/* Submit error */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-sm">{submitError}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate('/org/dashboard/requests/active')}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}