import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/language-context';
import { useTheme } from '../../contexts/theme-context';
import { Droplet, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import ENDPOINTS from '../../../api/endpoints';
import { useNavigate } from 'react-router';

interface BloodType {
  id: string;
  typename: string;
}

export function CreateRequest() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Blood types from API
  const [bloodTypes, setBloodTypes] = useState<BloodType[]>([]);
  const [bloodTypesLoading, setBloodTypesLoading] = useState(true);

  // Form state
  const [selectedBloodTypeId, setSelectedBloodTypeId] = useState('');
  const [quantityRequired, setQuantityRequired] = useState(1);
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [deadline, setDeadline] = useState('');
  const [note, setNote] = useState('');

  // Errors
  const [formError, setFormError] = useState('');

  const urgencies = [
    { value: 'Routine', label: language === 'ar' ? 'روتيني' : 'Routine', icon: Droplet, color: 'text-blue-500' },
    { value: 'Urgent', label: language === 'ar' ? 'عاجل' : 'Urgent', icon: AlertTriangle, color: 'text-orange-500' },
    { value: 'Critical', label: language === 'ar' ? 'حرج' : 'Critical', icon: AlertTriangle, color: 'text-red-500' },
  ];

  // Load blood types on mount
  useEffect(() => {
    const fetchBloodTypes = async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.LOCATIONS.BLOOD_TYPES);
        setBloodTypes(res.data?.value ?? []);
      } catch {
        setBloodTypes([]);
      } finally {
        setBloodTypesLoading(false);
      }
    };
    fetchBloodTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    console.log("Token in storage:", localStorage.getItem("access_token"));
    console.log("All localStorage keys:", Object.keys(localStorage));

    // Validation
    if (!selectedBloodTypeId) {
      setFormError(language === 'ar' ? 'يرجى اختيار فصيلة الدم' : 'Please select a blood type');
      return;
    }
    if (quantityRequired < 1) {
      setFormError(language === 'ar' ? 'يجب أن تكون الوحدات 1 على الأقل' : 'Units must be at least 1');
      return;
    }
    if (!urgencyLevel) {
      setFormError(language === 'ar' ? 'يرجى اختيار مستوى الاستعجال' : 'Please select an urgency level');
      return;
    }

    setStatus('submitting');

    try {
      const body = {
        bloodtypeid: selectedBloodTypeId,
        quantityrequired: quantityRequired,
        urgencylevel: urgencyLevel,
        note: note.trim() || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      };

      await apiClient.post(ENDPOINTS.HOSPITAL.CREATE_REQUEST, body);
      setStatus('success');
    } catch (err: any) {
      setStatus('idle');
      const responseStatus = err?.response?.status;
      if (responseStatus === 400) {
        setFormError(err?.response?.data?.message || (language === 'ar' ? 'بيانات غير صالحة' : 'Invalid request data'));
      } else if (responseStatus === 401) {
        window.location.href = '/org/login';
      } else {
        setFormError(language === 'ar' ? 'خطأ في الخادم. يرجى المحاولة لاحقاً.' : 'Server error. Please try again later.');
      }
    }
  };

  // Auto-redirect after 3 seconds on success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/org/dashboard/requests/active');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const resetForm = () => {
    setSelectedBloodTypeId('');
    setQuantityRequired(1);
    setUrgencyLevel('');
    setDeadline('');
    setNote('');
    setFormError('');
    setStatus('idle');
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 text-emerald-600 dark:text-emerald-500 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5' }}
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Request Created Successfully'}
        </h2>
        <p className="text-gray-500 dark:text-neutral-400">
          {language === 'ar' ? 'تم إرسال طلبك ويتم الآن إخطار المتبرعين.' : 'Your request has been broadcasted to available donors.'}
        </p>
        <button 
          onClick={resetForm}
          className="mt-8 px-6 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-xl transition-colors font-medium"
        >
          {language === 'ar' ? 'إنشاء طلب آخر' : 'Create Another Request'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'ar' ? 'إنشاء طلب دم جديد' : 'Create New Blood Request'}
        </h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">
          {language === 'ar' ? 'املأ التفاصيل أدناه لإخطار المتبرعين المطابقين.' : 'Fill in the details below to notify matching donors.'}
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* Blood Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'فصيلة الدم المطلوبة' : 'Required Blood Type'}
            </label>
            {bloodTypesLoading ? (
              <div className="flex items-center justify-center h-14">
                <div className="w-6 h-6 border-2 border-gray-300 dark:border-neutral-600 border-t-[#D32F2F] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {bloodTypes.map((bt) => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setSelectedBloodTypeId(bt.id)}
                    className={`h-14 flex items-center justify-center rounded-xl border-2 font-bold text-lg transition-all duration-300 ${
                      selectedBloodTypeId === bt.id
                        ? 'border-transparent bg-[#D32F2F] text-white'
                        : 'border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white hover:bg-[#D32F2F] hover:text-white hover:border-transparent'
                    }`}
                  >
                    {bt.typename}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Units Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'الوحدات المطلوبة' : 'Units Needed'}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={quantityRequired}
                onChange={(e) => setQuantityRequired(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>

            {/* Needed By (Date/Time) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'مطلوب بحلول' : 'Needed By'}
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'مستوى الاستعجال' : 'Urgency Level'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {urgencies.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setUrgencyLevel(level.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    urgencyLevel === level.value
                      ? 'border-transparent bg-[#D32F2F] text-white'
                      : 'border-gray-200 dark:border-neutral-800 hover:bg-[#D32F2F] hover:text-white hover:border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <level.icon className={`w-5 h-5 ${urgencyLevel === level.value ? 'text-white' : level.color}`} />
                    <span className={`font-medium ${urgencyLevel === level.value ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{level.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'ar' ? 'أضف أي تفاصيل محددة (مثل: جناح الجراحة، حالة المريض)...' : 'Add any specific details (e.g., Surgery Ward, Patient condition)...'}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all resize-none dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Inline Error */}
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-4">
            <button 
              type="button"
              className="px-6 py-2.5 text-gray-600 dark:text-neutral-400 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="flex items-center gap-2 px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-red-500/20 disabled:opacity-70"
            >
              {status === 'submitting' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}