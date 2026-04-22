import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/language-context';
import { MapPin, Phone, Mail, Building2, Edit3, X, Lock, Calendar, MapPinned, Navigation } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../api/apiClient';
import ENDPOINTS from '../../../api/endpoints';
import { useNavigate } from 'react-router';

// ─── Types ──────────────────────────────────────────────
interface CityObj { id: string; nameen: string; namear: string }
interface GovObj { id: string; nameen: string; namear: string }

interface ProfileData {
  id: string;
  name: string;
  licensenumber: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  joineddate: string;
  city: CityObj | null;
  governorate: GovObj | null;
}

// ─── Helpers ────────────────────────────────────────────
function formatJoinedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function statusBadge(status: string, lang: string) {
  switch (status) {
    case 'Active':
      return { label: lang === 'ar' ? 'نشط' : 'Active', cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
    case 'UnderReview':
      return { label: lang === 'ar' ? 'قيد المراجعة' : 'Under Review', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
    case 'Suspended':
      return { label: lang === 'ar' ? 'معلّق' : 'Suspended', cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' };
    default:
      return { label: status, cls: 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700' };
  }
}

// ─── Component ──────────────────────────────────────────
export function HospitalProfile() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGovId, setFormGovId] = useState('');
  const [formCityId, setFormCityId] = useState('');

  // Dropdown data
  const [governorates, setGovernorates] = useState<GovObj[]>([]);
  const [cities, setCities] = useState<CityObj[]>([]);
  const [govsLoading, setGovsLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  // ── Load Profile ──────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.HOSPITAL.PROFILE);
      const p: ProfileData = res.data?.value;
      if (p) setProfile(p);
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/org/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Load Governorates ─────────────────────────────────
  const loadGovernorates = useCallback(async () => {
    setGovsLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.LOCATIONS.GOVERNORATES);
      setGovernorates(res.data?.value ?? []);
    } catch { /* ignore */ }
    finally { setGovsLoading(false); }
  }, []);

  // ── Load Cities ───────────────────────────────────────
  const loadCities = useCallback(async (govId: string) => {
    if (!govId) { setCities([]); return; }
    setCitiesLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.LOCATIONS.CITIES_BY_GOV(govId));
      setCities(res.data?.value ?? []);
    } catch { setCities([]); }
    finally { setCitiesLoading(false); }
  }, []);

  // ── Open Modal ────────────────────────────────────────
  const openModal = () => {
    if (!profile) return;
    setFormName(profile.name || '');
    setFormPhone(profile.phone || '');
    setFormEmail(profile.email || '');
    setFormAddress(profile.address || '');
    setFormGovId(profile.governorate?.id || '');
    setFormCityId(profile.city?.id || '');
    setSaveError('');
    setIsModalOpen(true);
    loadGovernorates();
    if (profile.governorate?.id) loadCities(profile.governorate.id);
  };

  // ── Handle Gov Change ─────────────────────────────────
  const handleGovChange = (govId: string) => {
    setFormGovId(govId);
    setFormCityId('');
    setCities([]);
    if (govId) loadCities(govId);
  };

  // ── Save ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!formName.trim()) { setSaveError(language === 'ar' ? 'اسم المستشفى مطلوب' : 'Hospital name is required'); return; }
    setSaving(true);
    setSaveError('');
    try {
      await apiClient.patch(ENDPOINTS.HOSPITAL.UPDATE_PROFILE, {
        name: formName.trim(),
        address: formAddress.trim() || null,
        phone: formPhone.trim() || null,
        email: formEmail.trim() || null,
        cityid: formCityId || null,
        latitude: null,
        longitude: null,
      });
      setIsModalOpen(false);
      setToast({ message: language === 'ar' ? 'تم تحديث الملف بنجاح.' : 'Profile updated successfully.', type: 'success' });
      await loadProfile();
    } catch (err: any) {
      if (err?.response?.status === 401) { navigate('/org/login'); return; }
      setSaveError(err?.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving'));
    } finally {
      setSaving(false);
    }
  };

  const na = language === 'ar' ? 'غير متوفر' : 'Not provided';
  const badge = profile ? statusBadge(profile.status, language) : null;
  const hasCoords = profile && profile.latitude != null && profile.longitude != null && (profile.latitude !== 0 || profile.longitude !== 0);

  // ── Skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-800 rounded-lg mb-2" />
            <div className="h-4 w-72 bg-gray-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="h-12 w-36 bg-gray-200 dark:bg-neutral-800 rounded-xl" />
        </div>
        <div className="bg-white dark:bg-neutral-950 rounded-3xl border border-gray-100 dark:border-neutral-800 p-10 space-y-8">
          <div className="h-12 w-64 bg-gray-200 dark:bg-neutral-800 rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-neutral-800 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-8">
            {[1,2].map(i => <div key={i} className="space-y-4">{[1,2,3].map(j => <div key={j} className="h-20 bg-gray-200 dark:bg-neutral-800 rounded-xl" />)}</div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'ملف المستشفى' : 'Hospital Profile'}
          </h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-2">
            {language === 'ar' ? 'إدارة معلومات المستشفى وتفاصيل الاتصال.' : 'Manage hospital information and contact details.'}
          </p>
        </motion.div>
        <motion.button
          onClick={openModal}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-colors duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50"
        >
          <Edit3 className="w-5 h-5" />
          {language === 'ar' ? 'تعديل الملف' : 'Edit Profile'}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-neutral-950 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="relative p-10 bg-gradient-to-br from-white via-gray-50 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 border-b border-gray-100 dark:border-neutral-800">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23DC2626' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }} />
          </div>

          <div className="relative">
            {/* Name + Status */}
            <div className="flex flex-col items-center text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl shadow-red-500/40">
                  <Building2 className="w-14 h-14 text-white" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{profile.name}</h3>
                {badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-sm border font-semibold text-sm ${badge.cls}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {badge.label}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* License Number */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-md hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-1">{language === 'ar' ? 'رقم الترخيص' : 'License Number'}</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{profile.licensenumber}</p>
                  </div>
                </div>
              </motion.div>

              {/* Joined Date */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-neutral-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-md hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-1">{language === 'ar' ? 'تاريخ الانضمام' : 'Joined Date'}</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{formatJoinedDate(profile.joineddate)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border-2 border-gray-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-md hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-1">{language === 'ar' ? 'الموقع' : 'Location'}</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {profile.city && profile.governorate
                        ? `${language === 'ar' ? profile.city.namear : profile.city.nameen}, ${language === 'ar' ? profile.governorate.namear : profile.governorate.nameen}`
                        : na}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                </h4>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <motion.div whileHover={{ x: 5, scale: 1.01 }} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-all duration-200 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <Phone className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-1">{language === 'ar' ? 'الهاتف' : 'Phone'}</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{profile.phone || na}</p>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div whileHover={{ x: 5, scale: 1.01 }} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-all duration-200 group">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <Mail className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{profile.email || na}</p>
                  </div>
                </motion.div>

                {/* Address */}
                <motion.div whileHover={{ x: 5, scale: 1.01 }} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-all duration-200 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-1">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{profile.address || na}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Location Details */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <MapPinned className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'تفاصيل الموقع' : 'Location Details'}
                </h4>
              </div>

              <div className="space-y-4">
                {/* City */}
                <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950 rounded-xl p-5 border border-gray-200 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-800 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-2">{language === 'ar' ? 'المدينة' : 'City'}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {profile.city ? (language === 'ar' ? profile.city.namear : profile.city.nameen) : na}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-red-600 dark:text-red-500" />
                    </div>
                  </div>
                </motion.div>

                {/* Governorate */}
                <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950 rounded-xl p-5 border border-gray-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-2">{language === 'ar' ? 'المحافظة' : 'Governorate'}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {profile.governorate ? (language === 'ar' ? profile.governorate.namear : profile.governorate.nameen) : na}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <MapPinned className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                    </div>
                  </div>
                </motion.div>

                {/* Coordinates */}
                <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950 rounded-xl p-5 border border-gray-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-neutral-500 mb-2">{language === 'ar' ? 'الإحداثيات' : 'Coordinates'}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {hasCoords ? `${profile.latitude}, ${profile.longitude}` : (language === 'ar' ? 'غير محدد' : 'Not set')}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <Navigation className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Edit Profile Modal ─────────────────────────── */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-200 dark:border-neutral-700"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {language === 'ar' ? 'تعديل ملف المستشفى' : 'Edit Hospital Profile'}
                  </h3>
                  <p className="text-red-100 text-sm mt-0.5">
                    {language === 'ar' ? 'قم بتحديث معلومات المستشفى' : 'Update your hospital information'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* License Number (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'رقم الترخيص' : 'License Number'}
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl text-gray-500 dark:text-neutral-400">
                    <Lock className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{profile.licensenumber}</span>
                    <span className="text-xs ml-auto opacity-60">{language === 'ar' ? 'للقراءة فقط' : 'Read-only'}</span>
                  </div>
                </div>

                {/* Hospital Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'اسم المستشفى' : 'Hospital Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-600 dark:focus:border-red-600 text-gray-900 dark:text-white transition-all outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-600 dark:focus:border-red-600 text-gray-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-600 dark:focus:border-red-600 text-gray-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان' : 'Address'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formAddress}
                      onChange={e => setFormAddress(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-600 dark:focus:border-red-600 text-gray-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Governorate + City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'المحافظة' : 'Governorate'}
                    </label>
                    <select
                      value={formGovId}
                      onChange={e => handleGovChange(e.target.value)}
                      disabled={govsLoading}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-600 dark:focus:border-red-600 text-gray-900 dark:text-white transition-all outline-none"
                    >
                      <option value="">{govsLoading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'اختر المحافظة' : 'Select Governorate')}</option>
                      {governorates.map(g => (
                        <option key={g.id} value={g.id}>{language === 'ar' ? g.namear : g.nameen}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'المدينة' : 'City'}
                    </label>
                    <select
                      value={formCityId}
                      onChange={e => setFormCityId(e.target.value)}
                      disabled={citiesLoading || !formGovId}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-600 dark:focus:border-red-600 text-gray-900 dark:text-white transition-all outline-none disabled:opacity-50"
                    >
                      <option value="">{citiesLoading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'اختر المدينة' : 'Select City')}</option>
                      {cities.map(c => (
                        <option key={c.id} value={c.id}>{language === 'ar' ? c.namear : c.nameen}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Error */}
                {saveError && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                    {saveError}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 dark:bg-neutral-800/50 border-t border-gray-200 dark:border-neutral-700 flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="px-6 py-2.5 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
              >
                {saving
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
