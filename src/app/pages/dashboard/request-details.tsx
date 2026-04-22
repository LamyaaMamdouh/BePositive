import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '../../contexts/language-context';
import { useTheme } from '../../contexts/theme-context';
import { 
  ArrowLeft, 
  Droplet, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';

export function RequestDetails() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - in a real app, fetch based on id
  const request = {
    id: id || 'REQ-001',
    bloodType: 'O-',
    units: 3,
    fulfilled: 2,
    urgency: 'Critical',
    status: 'In Progress',
    progress: 66,
    createdAt: '2024-03-13 10:30 AM',
    neededBy: '2024-03-13 06:00 PM',
    patientName: 'Ahmed Hassan',
    patientAge: 45,
    department: 'Emergency Ward',
    doctor: 'Dr. Sarah Mohamed',
    contactNumber: '+966 50 123 4567',
    reason: 'Emergency surgery required. Patient has lost significant blood and requires immediate transfusion.',
    donors: [
      { name: 'John Smith', type: 'O-', status: 'Confirmed', time: '1h ago' },
      { name: 'Maria Garcia', type: 'O-', status: 'Confirmed', time: '2h ago' },
      { name: 'Ahmed Ali', type: 'O-', status: 'Pending', time: '30m ago' }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            {language === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">
            {request.id} • {language === 'ar' ? 'تم الإنشاء' : 'Created'} {request.createdAt}
          </p>
        </div>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-6 ${
          request.urgency === 'Critical' 
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
            : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2' }}
          >
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {request.urgency} {language === 'ar' ? 'الأولوية' : 'Priority'}
              </h3>
              <span className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full text-sm font-medium">
                {request.status}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {language === 'ar' 
                ? `${request.fulfilled} من ${request.units} وحدات تم تأكيدها • مطلوب بحلول ${request.neededBy}`
                : `${request.fulfilled} of ${request.units} units confirmed • Needed by ${request.neededBy}`
              }
            </p>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تقدم الطلب' : 'Request Progress'}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{request.progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D32F2F] rounded-full transition-all duration-500"
                  style={{ width: `${request.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blood Request Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'معلومات الطلب' : 'Request Information'}
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-neutral-400 mb-2">
                {language === 'ar' ? 'فصيلة الدم' : 'Blood Type'}
              </label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }}>
                  <span className="text-xl font-bold text-red-600">{request.bloodType}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-neutral-400 mb-2">
                {language === 'ar' ? 'الوحدات المطلوبة' : 'Units Required'}
              </label>
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{request.units}</span>
                <span className="text-gray-500 dark:text-neutral-400">units</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-neutral-400 mb-2">
                {language === 'ar' ? 'مطلوب بحلول' : 'Needed By'}
              </label>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{request.neededBy}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-neutral-400 mb-2">
                {language === 'ar' ? 'تم الإنشاء' : 'Created At'}
              </label>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{request.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
            <label className="block text-sm font-medium text-gray-500 dark:text-neutral-400 mb-2">
              {language === 'ar' ? 'سبب الطلب' : 'Reason for Request'}
            </label>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{request.reason}</p>
          </div>
        </motion.div>

        {/* Patient Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'معلومات المريض' : 'Patient Information'}
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 text-sm mb-1">
                <User className="w-4 h-4" />
                <span>{language === 'ar' ? 'اسم المريض' : 'Patient Name'}</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{request.patientName}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 text-sm mb-1">
                <Activity className="w-4 h-4" />
                <span>{language === 'ar' ? 'العمر' : 'Age'}</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{request.patientAge} years</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                <span>{language === 'ar' ? 'القسم' : 'Department'}</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{request.department}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 text-sm mb-1">
                <User className="w-4 h-4" />
                <span>{language === 'ar' ? 'الطبيب المسؤول' : 'Responsible Doctor'}</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{request.doctor}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 text-sm mb-1">
                <Phone className="w-4 h-4" />
                <span>{language === 'ar' ? 'رقم الاتصال' : 'Contact Number'}</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{request.contactNumber}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Donor Responses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-100 dark:border-neutral-800 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'استجابات المتبرعين' : 'Donor Responses'}
        </h3>

        <div className="space-y-3">
          {request.donors.map((donor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }}
                >
                  <User className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{donor.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-bold">{donor.type}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{donor.time}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                donor.status === 'Confirmed' 
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
              }`}>
                {donor.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3"
      >
        <button
          onClick={() => navigate('/org/dashboard/requests/active')}
          className="flex-1 px-6 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors font-medium"
        >
          {language === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <button
          onClick={() => navigate(`/org/dashboard/requests/${request.id}/update`)}
          className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-red-500/30"
        >
          {language === 'ar' ? 'تحديث الطلب' : 'Update Request'}
        </button>
      </motion.div>
    </div>
  );
}
