import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/language-context';
import { Bell, Lock, Globe, Database, Mail, MessageSquare, AlertCircle, Shield, Key, Smartphone, Clock, Download, Trash2, Archive, FileText, CheckCircle, ChevronDown, Check, Calendar } from 'lucide-react';
import { useState } from 'react';

type TabType = 'notifications' | 'security' | 'language' | 'data';

export function DashboardSettings() {
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [timeZoneOpen, setTimeZoneOpen] = useState(false);
  const [dateFormatOpen, setDateFormatOpen] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState('uae');
  const [selectedDateFormat, setSelectedDateFormat] = useState('dmy');

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    urgent: true,
    weekly: false,
    push: true,
    sound: true
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: false,
    biometric: false
  });

  const [preferences, setPreferences] = useState({
    autoBackup: true,
    dataRetention: 90,
    exportFormat: 'json'
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSecurity = (key: keyof typeof security) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === 'boolean') {
      setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const timeZones = [
    { value: 'uae', label: '(GMT+4) Dubai, Abu Dhabi', icon: '🇦🇪' },
    { value: 'saudi', label: '(GMT+3) Riyadh, Jeddah', icon: '🇸🇦' },
    { value: 'egypt', label: '(GMT+2) Cairo', icon: '🇪🇬' },
    { value: 'morocco', label: '(GMT+1) Casablanca', icon: '🇲🇦' }
  ];

  const dateFormats = [
    { value: 'dmy', label: 'DD/MM/YYYY', example: '31/12/2024' },
    { value: 'mdy', label: 'MM/DD/YYYY', example: '12/31/2024' },
    { value: 'ymd', label: 'YYYY-MM-DD', example: '2024-12-31' }
  ];

  const tabs = [
    {
      id: 'notifications' as TabType,
      icon: Bell,
      label: language === 'ar' ? 'الإشعارات' : 'Notifications',
      color: 'blue'
    },
    {
      id: 'security' as TabType,
      icon: Lock,
      label: language === 'ar' ? 'الأمان' : 'Security',
      color: 'emerald'
    },
    {
      id: 'language' as TabType,
      icon: Globe,
      label: language === 'ar' ? 'اللغة والمنطقة' : 'Language & Region',
      color: 'purple'
    },
    {
      id: 'data' as TabType,
      icon: Database,
      label: language === 'ar' ? 'إدارة البيانات' : 'Data Management',
      color: 'amber'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {language === 'ar' ? 'الإعدادات' : 'Settings'}
        </h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-2">
          {language === 'ar' ? 'إدارة تفضيلات الحساب والإشعارات.' : 'Manage account preferences and notifications.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-1 space-y-2"
        >
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
              whileHover={{ scale: 1.03, x: 5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 shadow-md shadow-red-500/20'
                  : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-neutral-950 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl overflow-hidden"
              >
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-500/5 dark:to-neutral-950">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {language === 'ar' ? 'تخصيص كيفية تلقي التحديثات' : 'Customize how you receive updates'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Email Alerts */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'تنبيهات البريد الإلكتروني' : 'Email Alerts'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'تلقي تحديثات عبر البريد' : 'Receive updates via email'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleNotification('email')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        notifications.email ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          notifications.email ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* SMS Alerts */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'تنبيهات SMS' : 'SMS Alerts'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'رسائل نصية للحالات العاجلة' : 'Text messages for urgent cases'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleNotification('sms')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        notifications.sms ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          notifications.sms ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Emergency Override */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50/50 dark:hover:bg-red-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'تخطي الصامت للطوارئ' : 'Override Silent for Emergencies'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'تنبيهات فورية للطلبات الحرجة' : 'Immediate alerts for critical requests'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleNotification('urgent')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        notifications.urgent ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          notifications.urgent ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Push Notifications */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5 text-cyan-600 dark:text-cyan-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'إشعارات الدفع' : 'Push Notifications'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'تنبيهات على الهاتف المحمول' : 'Mobile device notifications'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleNotification('push')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        notifications.push ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          notifications.push ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Weekly Reports */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'تقارير أسبوعية' : 'Weekly Reports'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'ملخص أسبوعي للنشاط' : 'Weekly summary of activities'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleNotification('weekly')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        notifications.weekly ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          notifications.weekly ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>
                </div>

                <div className="p-6 sm:p-8 bg-gray-50 dark:bg-neutral-900/50 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 transition-all duration-200 flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-neutral-950 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl overflow-hidden"
              >
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-500/5 dark:to-neutral-950">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'إعدادات الأمان' : 'Security Settings'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {language === 'ar' ? 'حماية حسابك وبياناتك' : 'Protect your account and data'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Two-Factor Authentication */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'طبقة أمان إضافية لحسابك' : 'Extra layer of security for your account'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSecurity('twoFactor')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        security.twoFactor ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          security.twoFactor ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Login Alerts */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Key className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'تنبيهات تسجيل الدخول' : 'Login Alerts'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'إشعار عند تسجيل الدخول من جهاز جديد' : 'Notify when logging in from new device'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSecurity('loginAlerts')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        security.loginAlerts ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          security.loginAlerts ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Session Timeout */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'انتهاء الجلسة التلقائي' : 'Auto Session Timeout'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'تسجيل الخروج بعد 30 دقيقة من عدم النشاط' : 'Logout after 30 minutes of inactivity'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSecurity('sessionTimeout')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        security.sessionTimeout ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          security.sessionTimeout ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Biometric Login */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'تسجيل الدخول البيومتري' : 'Biometric Login'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'استخدام بصمة الإصبع أو التعرف على الوجه' : 'Use fingerprint or face recognition'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSecurity('biometric')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        security.biometric ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          security.biometric ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Change Password Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center gap-3 text-red-600 dark:text-red-500 font-semibold"
                  >
                    <Key className="w-5 h-5" />
                    {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                  </motion.button>
                </div>

                <div className="p-6 sm:p-8 bg-gray-50 dark:bg-neutral-900/50 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-200 flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'language' && (
              <motion.div
                key="language"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-neutral-950 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl overflow-visible"
              >
                <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-purple-50 to-white dark:from-purple-500/5 dark:to-neutral-950 rounded-t-2xl overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'اللغة والمنطقة' : 'Language & Region'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {language === 'ar' ? 'تخصيص تفضيلات اللغة والمنطقة' : 'Customize language and regional preferences'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'لغة التطبيق' : 'Application Language'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setLanguage('en')}
                        className={`p-3.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          language === 'en'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-lg shadow-purple-500/20'
                            : 'border-gray-200 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-800'
                        }`}
                      >
                        <div className="text-2xl">🇬🇧</div>
                        <div className="text-left">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">English</p>
                          <p className="text-xs text-gray-500 dark:text-neutral-400">Default language</p>
                        </div>
                        {language === 'en' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                          </motion.div>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setLanguage('ar')}
                        className={`p-3.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          language === 'ar'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-lg shadow-purple-500/20'
                            : 'border-gray-200 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-800'
                        }`}
                      >
                        <div className="text-2xl">🇸🇦</div>
                        <div className="text-left">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">العربية</p>
                          <p className="text-xs text-gray-500 dark:text-neutral-400">اللغة العربية</p>
                        </div>
                        {language === 'ar' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                          </motion.div>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Custom Time Zone Dropdown */}
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'المنطقة الزمنية' : 'Time Zone'}
                    </label>
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setTimeZoneOpen(!timeZoneOpen);
                          setDateFormatOpen(false);
                        }}
                        className={`w-full px-4 py-3 bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800 border-2 rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none flex items-center justify-between shadow-md hover:shadow-xl group ${
                          timeZoneOpen
                            ? 'border-purple-500 dark:border-purple-500 shadow-lg shadow-purple-500/30 dark:shadow-purple-500/20'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-purple-400 dark:hover:border-purple-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ scale: timeZoneOpen ? 1.1 : 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 flex items-center justify-center shadow-sm"
                          >
                            <span className="text-xl">{timeZones.find(tz => tz.value === selectedTimeZone)?.icon}</span>
                          </motion.div>
                          <div className="text-left">
                            <span className="font-semibold text-sm block">{timeZones.find(tz => tz.value === selectedTimeZone)?.label}</span>
                            <span className="text-xs text-gray-500 dark:text-neutral-400">
                              {language === 'ar' ? 'المنطقة الزمنية الحالية' : 'Current timezone'}
                            </span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: timeZoneOpen ? 180 : 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 dark:group-hover:from-purple-500/30 dark:group-hover:to-purple-600/30 transition-all duration-200 shadow-sm"
                        >
                          <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {timeZoneOpen && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="fixed inset-0 z-10"
                              onClick={() => setTimeZoneOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-900 border-2 border-purple-300 dark:border-purple-600 rounded-2xl shadow-2xl shadow-purple-500/30 dark:shadow-purple-500/20 overflow-y-auto max-h-[280px] backdrop-blur-xl"
                            >
                              {timeZones.map((tz, idx) => (
                                <motion.button
                                  key={tz.value}
                                  whileHover={{ x: 6 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setSelectedTimeZone(tz.value);
                                    setTimeZoneOpen(false);
                                  }}
                                  className={`w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                                    idx !== timeZones.length - 1 ? 'border-b border-gray-200 dark:border-neutral-700' : ''
                                  } ${selectedTimeZone === tz.value ? 'bg-purple-50 dark:bg-purple-500/15' : ''}`}
                                >
                                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="text-lg">{tz.icon}</span>
                                  </div>
                                  <span className="font-semibold text-sm text-gray-900 dark:text-white flex-1 text-left">{tz.label}</span>
                                  {selectedTimeZone === tz.value && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                      className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40"
                                    >
                                      <Check className="w-3.5 h-3.5 text-white" />
                                    </motion.div>
                                  )}
                                </motion.button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Custom Date Format Dropdown */}
                  <div className="pt-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'تنسيق التاريخ' : 'Date Format'}
                    </label>
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setDateFormatOpen(!dateFormatOpen);
                          setTimeZoneOpen(false);
                        }}
                        className={`w-full px-4 py-3 bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-800 border-2 rounded-xl text-gray-900 dark:text-white transition-all duration-200 outline-none flex items-center justify-between shadow-md hover:shadow-xl group ${
                          dateFormatOpen
                            ? 'border-purple-500 dark:border-purple-500 shadow-lg shadow-purple-500/30 dark:shadow-purple-500/20'
                            : 'border-gray-200 dark:border-neutral-700 hover:border-purple-400 dark:hover:border-purple-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ scale: dateFormatOpen ? 1.1 : 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 flex items-center justify-center shadow-sm"
                          >
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </motion.div>
                          <div className="text-left">
                            <span className="font-semibold text-sm block">{dateFormats.find(df => df.value === selectedDateFormat)?.label}</span>
                            <span className="text-xs text-gray-500 dark:text-neutral-400">
                              {dateFormats.find(df => df.value === selectedDateFormat)?.example}
                            </span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: dateFormatOpen ? 180 : 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 dark:group-hover:from-purple-500/30 dark:group-hover:to-purple-600/30 transition-all duration-200 shadow-sm"
                        >
                          <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {dateFormatOpen && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="fixed inset-0 z-10"
                              onClick={() => setDateFormatOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-900 border-2 border-purple-300 dark:border-purple-600 rounded-2xl shadow-2xl shadow-purple-500/30 dark:shadow-purple-500/20 overflow-y-auto max-h-[280px] backdrop-blur-xl"
                            >
                              {dateFormats.map((df, idx) => (
                                <motion.button
                                  key={df.value}
                                  whileHover={{ x: 6 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setSelectedDateFormat(df.value);
                                    setDateFormatOpen(false);
                                  }}
                                  className={`w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-500/20 ${
                                    idx !== dateFormats.length - 1 ? 'border-b border-gray-200 dark:border-neutral-700' : ''
                                  } ${selectedDateFormat === df.value ? 'bg-purple-50 dark:bg-purple-500/15' : ''}`}
                                >
                                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{df.label}</p>
                                    <p className="text-xs text-gray-600 dark:text-neutral-400">{df.example}</p>
                                  </div>
                                  {selectedDateFormat === df.value && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                      className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40"
                                    >
                                      <Check className="w-3.5 h-3.5 text-white" />
                                    </motion.div>
                                  )}
                                </motion.button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-gray-50 dark:bg-neutral-900/50 border-t border-gray-100 dark:border-neutral-800 flex justify-end rounded-b-2xl overflow-hidden">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-200 flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-neutral-950 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl overflow-hidden"
              >
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-amber-50 to-white dark:from-amber-500/5 dark:to-neutral-950">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'إدارة البيانات' : 'Data Management'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {language === 'ar' ? 'التحكم في بياناتك وخصوصيتك' : 'Control your data and privacy'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Auto Backup */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Archive className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'النسخ الاحتياطي التلقائي' : 'Automatic Backup'}</p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'نسخ احتياطي يومي لبياناتك' : 'Daily backup of your data'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => togglePreference('autoBackup')}
                      className={`w-14 h-7 rounded-full transition-all duration-200 relative shadow-inner ${
                        preferences.autoBackup ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-neutral-700'
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md ${
                          preferences.autoBackup ? 'right-1' : 'left-1'
                        }`}
                      />
                    </motion.button>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-center gap-3 text-blue-600 dark:text-blue-500 font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      {language === 'ar' ? 'تنزيل بياناتي' : 'Download My Data'}
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-500 font-semibold"
                    >
                      <FileText className="w-5 h-5" />
                      {language === 'ar' ? 'تصدير التقارير' : 'Export Reports'}
                    </motion.button>
                  </div>

                  {/* Danger Zone */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-8 p-6 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
                      <h4 className="text-lg font-bold text-red-600 dark:text-red-500">
                        {language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {language === 'ar' ? 'هذه الإجراءات لا يمكن التراجع عنها. يرجى المتابعة بحذر.' : 'These actions cannot be undone. Please proceed with caution.'}
                    </p>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-3 rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-500 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        {language === 'ar' ? 'حذف جميع البيانات' : 'Delete All Data'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-3 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-600 dark:text-red-500 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                <div className="p-6 sm:p-8 bg-gray-50 dark:bg-neutral-900/50 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-200 flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
