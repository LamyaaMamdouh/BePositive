import { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertCircle, MapPin, Phone, Calendar, User, Droplet } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import { useTheme } from '../../contexts/theme-context';
import { useNavigate } from 'react-router';

// Blood type options
const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export function UrgentRequestPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bloodType: '',
    units: '',
    urgencyLevel: 'critical',
    patientName: '',
    patientAge: '',
    department: '',
    doctorName: '',
    contactNumber: '',
    reasonForRequest: '',
    requiredBy: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Urgent request submitted:', formData);
    // Navigate back to dashboard
    navigate('/org/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'إنشاء طلب عاجل' : 'Create Urgent Request'}
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 mt-1">
              {language === 'ar' ? 'املأ التفاصيل أدناه للحصول على دم عاجل.' : 'Fill in the details below to request urgent blood supply.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/org/dashboard')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Alert Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="border rounded-2xl p-4"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(127, 29, 29, 0.2)' : '#fef2f2',
          borderColor: theme === 'dark' ? '#991b1b' : '#fecaca'
        }}
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-300">
              {language === 'ar' ? 'طلب عاجل' : 'Urgent Request'}
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {language === 'ar' 
                ? 'سيتم إرسال هذا الطلب فوراً إلى جميع بنوك الدم المتاحة. يرجى التأكد من دقة جميع المعلومات.'
                : 'This request will be sent immediately to all available blood banks. Please ensure all information is accurate.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6 space-y-6"
      >
        {/* Blood Request Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'تفاصيل طلب الدم' : 'Blood Request Details'}
          </h3>
          <div className="space-y-6">
            {/* Blood Type Selector - Rectangular Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-3">
                {language === 'ar' ? 'فصيلة الدم المطلوبة' : 'Required Blood Type'} *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {BLOOD_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, bloodType: type })}
                    className={`
                      py-3 px-4 font-bold text-base rounded-lg border
                      transition-all duration-300 ease-in-out
                      hover:scale-[1.02] active:scale-95
                      ${formData.bloodType === type
                        ? 'bg-[#D32F2F] text-white border-[#D32F2F]'
                        : 'bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white border-gray-200 dark:border-[#334155] hover:bg-[#D32F2F] hover:text-white hover:border-[#D32F2F]'
                      }
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  {language === 'ar' ? 'عدد الوحدات' : 'Number of Units'} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  placeholder={language === 'ar' ? 'مثال: 5' : 'e.g., 5'}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                />
              </motion.div>

              {/* Urgency Level Selector - Pill Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  {language === 'ar' ? 'مستوى الأولوية' : 'Urgency Level'} *
                </label>
                <div className="flex gap-2">
                  {/* Critical */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, urgencyLevel: 'critical' })}
                    className={`
                      flex-1 py-2.5 px-3 rounded-full font-medium text-sm
                      transition-all duration-200 ease-in-out
                      hover:scale-[1.02] active:scale-95
                      ${formData.urgencyLevel === 'critical'
                        ? 'bg-[#FEE2E2] dark:bg-[#450A0A] border-2 border-[#DC2626] dark:border-[#EF4444] text-[#991B1B] dark:text-[#FCA5A5]'
                        : 'bg-[#FEE2E2] dark:bg-[rgba(220,38,38,0.15)] text-[#991B1B] dark:text-[#FCA5A5]'
                      }
                    `}
                  >
                    {language === 'ar' ? 'حرجة' : 'Critical'}
                  </button>

                  {/* Urgent */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, urgencyLevel: 'urgent' })}
                    className={`
                      flex-1 py-2.5 px-3 rounded-full font-medium text-sm
                      transition-all duration-200 ease-in-out
                      hover:scale-[1.02] active:scale-95
                      ${formData.urgencyLevel === 'urgent'
                        ? 'bg-[#FFEDD5] dark:bg-[rgba(249,115,22,0.2)] border-2 border-[#F97316] dark:border-[#FB923C] text-[#9A3412] dark:text-[#FDBA74]'
                        : 'bg-[#FFEDD5] dark:bg-[rgba(249,115,22,0.15)] text-[#9A3412] dark:text-[#FDBA74]'
                      }
                    `}
                  >
                    {language === 'ar' ? 'عاجلة' : 'Urgent'}
                  </button>

                  {/* Normal/Routine */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, urgencyLevel: 'routine' })}
                    className={`
                      flex-1 py-2.5 px-3 rounded-full font-medium text-sm
                      transition-all duration-200 ease-in-out
                      hover:scale-[1.02] active:scale-95
                      ${formData.urgencyLevel === 'routine'
                        ? 'bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.2)] border-2 border-[#3B82F6] dark:border-[#60A5FA] text-[#1E3A8A] dark:text-[#93C5FD]'
                        : 'bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.15)] text-[#1E3A8A] dark:text-[#93C5FD]'
                      }
                    `}
                  >
                    {language === 'ar' ? 'روتينية' : 'Routine'}
                  </button>
                </div>
              </motion.div>

              <motion.div 
                className="md:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                  {language === 'ar' ? 'مطلوب بحلول' : 'Required By'} *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-400" />
                  <input
                    type="datetime-local"
                    required
                    value={formData.requiredBy}
                    onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Patient Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'معلومات المريض' : 'Patient Information'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                {language === 'ar' ? 'اسم المريض' : 'Patient Name'} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل اسم المريض' : 'Enter patient name'}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                {language === 'ar' ? 'عمر المريض' : 'Patient Age'} *
              </label>
              <input
                type="number"
                required
                min="0"
                max="150"
                value={formData.patientAge}
                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                placeholder={language === 'ar' ? 'مثال: 45' : 'e.g., 45'}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                {language === 'ar' ? 'القسم/الجناح' : 'Department/Ward'} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder={language === 'ar' ? 'مثال: جناح الطوارئ' : 'e.g., Emergency Ward'}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                {language === 'ar' ? 'اسم الطبيب المسؤول' : 'Responsible Doctor'} *
              </label>
              <input
                type="text"
                required
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                placeholder={language === 'ar' ? 'مثال: د. أحمد محمد' : 'e.g., Dr. Ahmed Mohamed'}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                {language === 'ar' ? 'رقم الاتصال' : 'Contact Number'} *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder={language === 'ar' ? 'مثال: +966 50 123 4567' : 'e.g., +966 50 123 4567'}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                {language === 'ar' ? 'سبب الطلب' : 'Reason for Request'} *
              </label>
              <textarea
                required
                rows={4}
                value={formData.reasonForRequest}
                onChange={(e) => setFormData({ ...formData, reasonForRequest: e.target.value })}
                placeholder={language === 'ar' ? 'وصف موجز لحالة المريض وسبب طلب الدم...' : 'Brief description of patient condition and reason for blood request...'}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex gap-3 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <button
            type="button"
            onClick={() => navigate('/org/dashboard')}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors font-medium"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-red-500/30"
          >
            {language === 'ar' ? 'إرسال الطلب العاجل' : 'Submit Urgent Request'}
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}