import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../../contexts/language-context';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile,
  ChevronRight,
  ChevronLeft,
  File,
  X,
  User,
  BellOff,
  Bell,
  Trash2,
  Ban,
  AlertTriangle,
  Droplets,
  Calendar,
  MapPin,
  Activity,
  PhoneOff,
  ChevronDown,
  Pin,
  CornerUpRight,
  Info,
  Check,
  CheckCheck
} from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  bloodType: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  phone?: string;
  location?: string;
  donationsCount?: number;
  lastDonation?: string;
}

interface Attachment {
  name: string;
  type: 'image' | 'file';
  url: string;
}

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
  attachment?: Attachment;
  isPinned?: boolean;
}

const EMOJIS = [
  '😀', '😂', '😅', '😊', '😍', '🥰', '😎', '🤔', '😐', '🙄', 
  '😪', '😫', '😭', '😡', '👍', '👎', '👏', '🙏', '🤝', '❤️', 
  '💔', '✨', '🔥', '🎉', '🩸', '💉', '🏥', '🩺', '💊', '🩹'
];

// الردود التلقائية 
const AUTO_REPLIES_AR = [
  "أهلاً بك، شكراً لاهتمامك.",
  "حسناً، فهمت قصدك.",
  "تمام جداً، سأكون في الموعد.",
  "هل يمكنك توضيح المكان بالضبط؟",
  "شكراً جزيلاً لك على المساعدة!",
  "أنا مستعد للتبرع في أي وقت تحتاجون فيه.",
  "عفواً، سأراجع جدولي وأرد عليك قريباً."
];

const AUTO_REPLIES_EN = [
  "Hello, thank you for reaching out.",
  "Okay, I understand.",
  "Great, I will be there on time.",
  "Could you clarify the exact location?",
  "Thank you so much for your help!",
  "I am ready to donate whenever you need.",
  "Let me check my schedule and get back to you soon."
];

export function MessagingPage() {
  const { language } = useLanguage();
  const [selectedContact, setSelectedContact] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [stagedFile, setStagedFile] = useState<Attachment | null>(null);

  const [mutedContacts, setMutedContacts] = useState<number[]>([]);
  const [blockedContacts, setBlockedContacts] = useState<number[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'audio' | 'video', contact: Contact } | null>(null);
  
  const [typingContacts, setTypingContacts] = useState<number[]>([]);

  // Message Actions States
  const [activeMessageMenu, setActiveMessageMenu] = useState<number | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [infoMessage, setInfoMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);

  const [chatHistories, setChatHistories] = useState<Record<number, Message[]>>({
    1: [
      { id: 1, sender: 'them', text: 'السلام عليكم', time: '10:20 AM' },
      { id: 2, sender: 'me', text: 'وعليكم السلام ورحمة الله', time: '10:22 AM' },
      { id: 3, sender: 'me', text: 'نشكرك على تسجيلك كمتبرع بالدم', time: '10:22 AM' },
      { id: 4, sender: 'them', text: 'شكراً على التواصل، أنا مستعد للتبرع', time: '10:30 AM' },
    ],
    2: [
      { id: 1, sender: 'them', text: 'متى موعد التبرع القادم؟', time: '09:15 AM' },
    ],
    3: [
      { id: 1, sender: 'them', text: 'I can donate next week', time: 'Yesterday' },
    ]
  });

  const contacts: Contact[] = [
    { id: 1, name: 'Ahmed Ali', bloodType: 'O+', lastMessage: 'شكراً على التواصل، أنا مستعد للتبرع', time: '10:30 AM', unread: 2, online: true, phone: '+20 123 456 7890', location: 'القاهرة، مصر', donationsCount: 3, lastDonation: '15 Jan 2026' },
    { id: 2, name: 'Sarah Hassan', bloodType: 'A-', lastMessage: 'متى موعد التبرع القادم؟', time: '09:15 AM', unread: 0, online: true, phone: '+20 111 222 3333', location: 'الفيوم، مصر', donationsCount: 1, lastDonation: '10 Nov 2025' },
    { id: 3, name: 'Omar Youssef', bloodType: 'B+', lastMessage: 'I can donate next week', time: 'Yesterday', unread: 1, online: false, phone: '+20 100 999 8888', location: 'الجيزة، مصر', donationsCount: 5, lastDonation: '05 Dec 2025' },
    { id: 4, name: 'Fatima Khalid', bloodType: 'AB+', lastMessage: 'شكراً لكم على خدمتكم', time: 'Yesterday', unread: 0, online: false, phone: '+20 155 555 4444', location: 'الإسكندرية، مصر', donationsCount: 0, lastDonation: 'N/A' },
    { id: 5, name: 'Mohammed Saeed', bloodType: 'O-', lastMessage: 'Available for urgent donations', time: '2 days ago', unread: 0, online: true, phone: '+20 122 333 4444', location: 'القاهرة، مصر', donationsCount: 8, lastDonation: '20 Feb 2026' },
    { id: 6, name: 'Aisha Abdullah', bloodType: 'A+', lastMessage: 'Thank you for your help', time: '3 days ago', unread: 0, online: false, phone: '+20 100 111 2222', location: 'الفيوم، مصر', donationsCount: 2, lastDonation: '01 Jan 2026' },
    { id: 7, name: 'Khalid Hassan', bloodType: 'B-', lastMessage: 'سأكون متاحاً غداً', time: '4 days ago', unread: 0, online: true, phone: '+20 111 444 5555', location: 'بني سويف، مصر', donationsCount: 4, lastDonation: '18 Oct 2025' },
    { id: 8, name: 'Layla Mohammed', bloodType: 'O+', lastMessage: 'When is the next donation?', time: '5 days ago', unread: 3, online: false, phone: '+20 122 999 0000', location: 'المنيا، مصر', donationsCount: 1, lastDonation: '30 Sep 2025' },
  ];

  const activeContact = contacts.find(c => c.id === selectedContact);
  const isMuted = activeContact ? mutedContacts.includes(activeContact.id) : false;
  const isBlocked = activeContact ? blockedContacts.includes(activeContact.id) : false;
  
  const currentMessages = selectedContact ? (chatHistories[selectedContact] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isMobileChatOpen, typingContacts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setActiveMessageMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredContacts = contacts.filter(contact => 
    contactSearchQuery === '' || 
    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.bloodType.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.lastMessage.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if ((messageInput.trim() || stagedFile) && selectedContact) {
      const contactId = selectedContact;
      const newMessage: Message = {
        id: Date.now(),
        sender: 'me',
        text: messageInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachment: stagedFile || undefined
      };
      
      setChatHistories(prev => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), newMessage]
      }));
      
      setMessageInput('');
      setStagedFile(null);
      setShowEmojiPicker(false);

      setTimeout(() => {
        setTypingContacts(prev => [...prev, contactId]);
        setTimeout(() => {
          const replies = language === 'ar' ? AUTO_REPLIES_AR : AUTO_REPLIES_EN;
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const replyMessage: Message = {
            id: Date.now() + 1,
            sender: 'them',
            text: randomReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatHistories(prev => ({
            ...prev,
            [contactId]: [...(prev[contactId] || []), replyMessage]
          }));
          setTypingContacts(prev => prev.filter(id => id !== contactId));
        }, 2000);
      }, 500);
    }
  };

  const handleContactClick = (id: number) => {
    setSelectedContact(id);
    setIsMobileChatOpen(true);
    if (!chatHistories[id] || chatHistories[id].length === 0) {
      setChatHistories(prev => ({
        ...prev,
        [id]: [{ id: Date.now(), sender: 'them', text: language === 'ar' ? 'أهلاً بك' : 'Hello', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
      }));
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      setStagedFile({
        name: file.name,
        type: isImage ? 'image' : 'file',
        url: URL.createObjectURL(file) 
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- دوال التحكم في الرسائل المحددة ---
  const deleteMessage = (msgId: number) => {
    if (selectedContact) {
      setChatHistories(prev => ({
        ...prev,
        [selectedContact]: prev[selectedContact].filter(m => m.id !== msgId)
      }));
    }
    setActiveMessageMenu(null);
  };

  const togglePinMessage = (msgId: number) => {
    if (selectedContact) {
      setChatHistories(prev => ({
        ...prev,
        [selectedContact]: prev[selectedContact].map(m => 
          m.id === msgId ? { ...m, isPinned: !m.isPinned } : m
        )
      }));
    }
    setActiveMessageMenu(null);
  };

  const handleForwardMessage = (contactId: number) => {
    if (forwardMessage) {
      const forwardedMsg: Message = {
        ...forwardMessage,
        id: Date.now(),
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPinned: false
      };
      setChatHistories(prev => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), forwardedMsg]
      }));
      setForwardMessage(null);
    }
  };

  // --- دوال باقي القوائم ---
  const toggleMute = () => {
    if (!activeContact) return;
    setMutedContacts(prev => 
      prev.includes(activeContact.id) ? prev.filter(id => id !== activeContact.id) : [...prev, activeContact.id]
    );
    setShowMoreMenu(false);
  };

  const confirmClearChat = () => {
    if (selectedContact) {
      setChatHistories(prev => ({ ...prev, [selectedContact]: [] }));
    }
    setShowClearConfirm(false);
  };

  const confirmBlockContact = () => {
    if (activeContact) setBlockedContacts(prev => [...prev, activeContact.id]);
    setShowBlockConfirm(false);
  };

  const unblockContact = () => {
    if (activeContact) setBlockedContacts(prev => prev.filter(id => id !== activeContact.id));
  };

  const startCall = (type: 'audio' | 'video') => {
    if (activeContact && !isBlocked) setActiveCall({ type, contact: activeContact });
  };
  const endCall = () => setActiveCall(null);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'ar' ? 'الرسائل' : 'Messages'}
        </h2>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">
          {language === 'ar' ? 'تواصل مع المتبرعين المسجلين' : 'Communicate with registered donors'}
        </p>
      </div>

      <div className="flex-1 bg-white dark:bg-[#1f1f1f] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden flex relative">
        
        {/* Contacts Sidebar */}
        <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 dark:border-neutral-800 flex-col bg-white dark:bg-[#1f1f1f] ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${language === 'ar' ? 'right-3.5' : 'left-3.5'}`} />
              <input 
                type="text" 
                placeholder={language === 'ar' ? 'البحث عن متبرع...' : 'Search donors...'} 
                className={`w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl py-2.5 ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} focus:ring-2 focus:ring-[#D32F2F] outline-none text-sm dark:text-white transition-all`}
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center mt-10">
                <Search className="w-10 h-10 text-gray-300 dark:text-neutral-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-neutral-400 text-sm">
                  {language === 'ar' ? 'لا توجد نتائج' : 'No contacts found'}
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactClick(contact.id)}
                  className={`w-full text-left p-4 border-b border-gray-50 dark:border-neutral-800/50 transition-colors flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-neutral-900/50 ${
                    selectedContact === contact.id && !isMobileChatOpen ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/20 dark:to-red-500/5 flex items-center justify-center font-bold text-[#D32F2F] border border-red-100 dark:border-red-500/20 shadow-sm">
                      {contact.name.charAt(0)}
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#1f1f1f] rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{contact.name}</h4>
                        {mutedContacts.includes(contact.id) && <BellOff className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-neutral-500 whitespace-nowrap ml-2">
                        {chatHistories[contact.id] && chatHistories[contact.id].length > 0 
                          ? chatHistories[contact.id][chatHistories[contact.id].length - 1].time 
                          : contact.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate flex-1 ${contact.unread > 0 ? 'text-gray-900 dark:text-gray-200 font-semibold' : 'text-gray-500 dark:text-neutral-400'}`}>
                        {blockedContacts.includes(contact.id) 
                          ? (language === 'ar' ? 'تم حظر المستخدم' : 'Contact Blocked') 
                          : typingContacts.includes(contact.id)
                            ? <span className="text-[#D32F2F] italic">{language === 'ar' ? 'يكتب الآن...' : 'typing...'}</span>
                            : (chatHistories[contact.id] && chatHistories[contact.id].length > 0 
                                ? (chatHistories[contact.id][chatHistories[contact.id].length - 1].text || (language === 'ar' ? 'مرفق' : 'Attachment')) 
                                : contact.lastMessage)}
                      </p>
                      {contact.unread > 0 && !blockedContacts.includes(contact.id) && (
                        <span className="ml-2 bg-[#D32F2F] text-white text-[10px] rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center font-bold shadow-sm shadow-red-500/30">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex gap-1">
                      <span className="inline-block px-1.5 py-0.5 bg-red-50 dark:bg-red-500/10 text-[#D32F2F] text-[10px] rounded font-bold">
                        {contact.bloodType}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex-col bg-gray-50/30 dark:bg-neutral-900/10 ${!isMobileChatOpen ? 'hidden md:flex' : 'flex'} w-full md:w-auto absolute md:relative inset-0 z-10`}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-[#1f1f1f] shadow-sm z-20 relative">
                <div className="flex items-center gap-2 md:gap-3">
                  <button 
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                    onClick={() => setIsMobileChatOpen(false)}
                  >
                    {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  
                  <div 
                    className="relative cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/20 dark:to-red-500/5 flex items-center justify-center font-bold text-[#D32F2F] border border-red-100 dark:border-red-500/20">
                      {activeContact.name.charAt(0)}
                    </div>
                    {activeContact.online && (
                      <div className="absolute bottom-0.5 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#1f1f1f] rounded-full"></div>
                    )}
                  </div>
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{activeContact.name}</h3>
                      {isMuted && <BellOff className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-neutral-400">
                      {typingContacts.includes(activeContact.id) ? (
                        <span className="text-[#D32F2F] italic">{language === 'ar' ? 'يكتب الآن...' : 'typing...'}</span>
                      ) : activeContact.online ? (
                        <span className="text-emerald-500">{language === 'ar' ? 'متصل الآن' : 'Online'}</span>
                      ) : (
                        language === 'ar' ? 'غير متصل' : 'Offline'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  <button 
                    onClick={() => startCall('audio')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50" 
                    disabled={isBlocked}
                  >
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button 
                    onClick={() => startCall('video')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors hidden sm:block disabled:opacity-50" 
                    disabled={isBlocked}
                  >
                    <Video className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  <div className="relative" ref={moreMenuRef}>
                    <button 
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className={`p-2 rounded-full transition-colors ${showMoreMenu ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400'}`}
                    >
                      <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    <AnimatePresence>
                      {showMoreMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute top-full mt-2 ${language === 'ar' ? 'left-0' : 'right-0'} w-56 bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5`}
                        >
                          <button onClick={() => { setShowProfileModal(true); setShowMoreMenu(false); }} className="w-full text-start px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-900/50 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                            <User className="w-4 h-4 text-gray-400" /> {language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                          </button>
                          <button onClick={toggleMute} className="w-full text-start px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-900/50 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                            {isMuted ? <Bell className="w-4 h-4 text-gray-400" /> : <BellOff className="w-4 h-4 text-gray-400" />}
                            {isMuted ? (language === 'ar' ? 'إلغاء كتم الإشعارات' : 'Unmute') : (language === 'ar' ? 'كتم الإشعارات' : 'Mute Notifications')}
                          </button>
                          <div className="h-px bg-gray-100 dark:border-neutral-800 my-1.5"></div>
                          <button onClick={() => { setShowClearConfirm(true); setShowMoreMenu(false); }} className="w-full text-start px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-900/50 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                            <Trash2 className="w-4 h-4 text-gray-400" /> {language === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}
                          </button>
                          {!isBlocked && (
                            <button onClick={() => { setShowBlockConfirm(true); setShowMoreMenu(false); }} className="w-full text-start px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 text-sm font-medium text-[#D32F2F] transition-colors">
                              <Ban className="w-4 h-4" /> {language === 'ar' ? 'حظر المستخدم' : 'Block Contact'}
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] dark:bg-[#121212] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
                {currentMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-neutral-600">
                    <p className="text-sm bg-white dark:bg-[#1f1f1f] px-4 py-2 rounded-full border border-gray-100 dark:border-neutral-800 shadow-sm">
                      {language === 'ar' ? 'ابدأ المحادثة الآن' : 'Start the conversation'}
                    </p>
                  </div>
                ) : (
                  currentMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${message.sender === 'me' ? 'items-end' : 'items-start'} group`}
                    >
                      {/* Pinned Indicator */}
                      {message.isPinned && (
                        <div className={`flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mb-1 ${message.sender === 'me' ? 'mr-1' : 'ml-1'}`}>
                          <Pin className="w-3 h-3" />
                          {language === 'ar' ? 'رسالة مثبتة' : 'Pinned'}
                        </div>
                      )}
                      
                      <div className="relative flex items-center gap-2 max-w-[85%] md:max-w-md">
                        
                        {/* Message Bubble */}
                        <div className={`relative flex flex-col ${
                          message.sender === 'me' 
                            ? 'bg-[#D32F2F] text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-neutral-800 text-gray-900 dark:text-white rounded-2xl rounded-tl-sm'
                          } px-4 py-2.5 shadow-sm`}
                        >
                          {/* Chevron for Menu (Inside bubble, top corner) */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === message.id ? null : message.id); }}
                            className={`absolute top-1 ${language === 'ar' ? 'left-1' : 'right-1'} p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ${message.sender === 'me' ? 'hover:bg-black/10 text-white/80' : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400'}`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Message Content */}
                          {message.attachment && (
                            <div className="mb-2 mt-1">
                              {message.attachment.type === 'image' ? (
                                <img src={message.attachment.url} alt="attachment" className="rounded-xl max-w-full max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity border border-black/10 dark:border-white/10" />
                              ) : (
                                <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${message.sender === 'me' ? 'bg-red-700/50 border-red-500/50' : 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800'}`}>
                                  <div className={`p-2 rounded-lg ${message.sender === 'me' ? 'bg-red-600' : 'bg-white dark:bg-neutral-800'}`}><File className="w-5 h-5" /></div>
                                  <span className="text-sm font-medium truncate max-w-[150px]">{message.attachment.name}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {message.text && <p className="text-sm leading-relaxed whitespace-pre-wrap pr-4">{message.text}</p>}
                          <p className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${message.sender === 'me' ? 'text-red-100/80' : 'text-gray-400 dark:text-neutral-500'}`}>
                            {message.time}
                            {message.sender === 'me' && <CheckCheck className="w-3.5 h-3.5" />}
                          </p>
                        </div>

                        {/* Message Context Menu Dropdown */}
                        <AnimatePresence>
                          {activeMessageMenu === message.id && (
                            <motion.div 
                              ref={messageMenuRef}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                              className={`absolute top-8 ${message.sender === 'me' ? (language === 'ar' ? 'left-0' : 'right-0') : (language === 'ar' ? 'right-0' : 'left-0')} w-44 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 z-50 py-1.5`}
                            >
                              <button onClick={() => { setForwardMessage(message); setActiveMessageMenu(null); }} className="w-full text-start px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-900/50 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <CornerUpRight className="w-4 h-4 text-gray-400" /> {language === 'ar' ? 'تحويل' : 'Forward'}
                              </button>
                              <button onClick={() => togglePinMessage(message.id)} className="w-full text-start px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-900/50 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Pin className="w-4 h-4 text-gray-400" /> {message.isPinned ? (language === 'ar' ? 'إلغاء التثبيت' : 'Unpin') : (language === 'ar' ? 'تثبيت' : 'Pin')}
                              </button>
                              <button onClick={() => { setInfoMessage(message); setActiveMessageMenu(null); }} className="w-full text-start px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-900/50 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <Info className="w-4 h-4 text-gray-400" /> {language === 'ar' ? 'معلومات' : 'Info'}
                              </button>
                              <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1"></div>
                              <button onClick={() => deleteMessage(message.id)} className="w-full text-start px-3 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 text-sm text-[#D32F2F]">
                                <Trash2 className="w-4 h-4" /> {language === 'ar' ? 'مسح' : 'Delete'}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    </motion.div>
                  ))
                )}

                {typingContacts.includes(selectedContact) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                    <div className="bg-white dark:bg-[#1f1f1f] border border-gray-100 dark:border-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex items-center gap-1.5">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area / Blocked State */}
              {isBlocked ? (
                <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] z-20 flex flex-col items-center justify-center py-6">
                  <p className="text-sm text-gray-500 dark:text-neutral-400 mb-3 text-center">
                    {language === 'ar' ? 'لقد قمت بحظر هذا المستخدم. لن تتمكن من إرسال أو استقبال رسائل.' : 'You blocked this contact. You cannot send or receive messages.'}
                  </p>
                  <button onClick={unblockContact} className="px-5 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors">
                    {language === 'ar' ? 'إلغاء الحظر' : 'Unblock Contact'}
                  </button>
                </div>
              ) : (
                <div className="relative p-3 md:p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] z-20">
                  
                  {/* File Preview before sending */}
                  <AnimatePresence>
                    {stagedFile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-3 left-4 right-4 md:left-auto md:right-auto md:min-w-[250px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-2 shadow-lg flex items-center gap-3 z-30"
                      >
                        {stagedFile.type === 'image' ? (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-neutral-700">
                            <img src={stagedFile.url} alt="preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-500/10 text-[#D32F2F] flex items-center justify-center flex-shrink-0"><File className="w-6 h-6" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{stagedFile.name}</p>
                          <p className="text-xs text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'جاهز للإرسال' : 'Ready to send'}</p>
                        </div>
                        <button onClick={() => setStagedFile(null)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-[#D32F2F] rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Emoji Picker Popup */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div 
                        ref={emojiPickerRef}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className={`absolute bottom-full mb-3 ${language === 'ar' ? 'right-12' : 'left-12'} bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl p-3 z-30 w-64 md:w-72`}
                      >
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-2 px-1">
                          {language === 'ar' ? 'تعبيرات' : 'Emojis'}
                        </h4>
                        <div className="grid grid-cols-6 gap-1 overflow-y-auto max-h-48 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
                          {EMOJIS.map((emoji, idx) => (
                            <button key={idx} onClick={() => handleEmojiClick(emoji)} className="text-xl hover:bg-gray-100 dark:hover:bg-neutral-800 p-1.5 rounded-lg transition-colors flex items-center justify-center">
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input Controls */}
                  <div className="flex items-end gap-2 max-w-4xl mx-auto">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />
                    
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-full transition-colors flex-shrink-0 text-gray-500 hover:text-[#D32F2F]">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl flex items-end px-1 transition-colors focus-within:border-red-200 dark:focus-within:border-red-900/50 focus-within:bg-white dark:focus-within:bg-[#1f1f1f]">
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2.5 rounded-full transition-colors m-1 flex-shrink-0 ${showEmojiPicker ? 'bg-red-50 dark:bg-red-500/10 text-[#D32F2F]' : 'hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                        <Smile className="w-5 h-5" />
                      </button>
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                        className={`flex-1 bg-transparent py-3 px-1 outline-none resize-none text-sm dark:text-white max-h-32 min-h-[44px] ${language === 'ar' ? 'text-right' : 'text-left'} [&::-webkit-scrollbar]:w-1`}
                        rows={1}
                      />
                    </div>
                    
                    <button 
                      onClick={handleSendMessage}
                      className={`p-3 rounded-full transition-all flex-shrink-0 ${
                        messageInput.trim() || stagedFile
                          ? 'bg-[#D32F2F] text-white shadow-md shadow-red-500/30 hover:bg-[#B71C1C] scale-100' 
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 scale-95 cursor-not-allowed'
                      }`}
                      disabled={!messageInput.trim() && !stagedFile}
                    >
                      <Send className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''} ${(messageInput.trim() || stagedFile) ? '-ml-0.5' : ''}`} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8f9fa] dark:bg-[#121212] text-center">
              <div className="w-20 h-20 bg-white dark:bg-[#1f1f1f] rounded-full flex items-center justify-center shadow-sm mb-4">
                <Send className="w-8 h-8 text-gray-300 dark:text-neutral-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{language === 'ar' ? 'مرحباً بك في المحادثات' : 'Welcome to Messages'}</h3>
              <p className="text-gray-500 dark:text-neutral-400 text-sm max-w-sm">{language === 'ar' ? 'اختر محادثة من القائمة الجانبية للبدء في التواصل مع المتبرعين وتنسيق المواعيد.' : 'Select a chat from the sidebar to start communicating with donors and coordinating appointments.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Forward Modal */}
      <AnimatePresence>
        {forwardMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setForwardMessage(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1F1F1F] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'تحويل الرسالة إلى...' : 'Forward message to...'}
                </h3>
                <button onClick={() => setForwardMessage(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto p-2">
                {contacts.filter(c => c.id !== selectedContact).map(contact => (
                  <button 
                    key={contact.id} 
                    onClick={() => handleForwardMessage(contact.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-neutral-900/50 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 text-[#D32F2F] font-bold flex items-center justify-center">
                      {contact.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{contact.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {infoMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setInfoMessage(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1F1F1F] rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'معلومات الرسالة' : 'Message Info'}
                </h3>
                <button onClick={() => setInfoMessage(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-gray-50 dark:bg-neutral-900/50 p-4 rounded-xl text-sm text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-neutral-800">
                  {infoMessage.text || (language === 'ar' ? '[مرفق]' : '[Attachment]')}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CheckCheck className="w-4 h-4 text-emerald-500" /> 
                      {language === 'ar' ? 'قرئت' : 'Read'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{infoMessage.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CheckCheck className="w-4 h-4 text-gray-400" /> 
                      {language === 'ar' ? 'سُلمت' : 'Delivered'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{infoMessage.time}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-neutral-800 text-center">
                <button onClick={() => setInfoMessage(null)} className="text-sm font-bold text-[#D32F2F]">
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Call Modal */}
      <AnimatePresence>
        {activeCall && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1f1f1f] border border-neutral-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center pt-12 pb-8 px-6 text-center"
            >
              <div className="mb-2">
                <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest">
                  {language === 'ar' 
                    ? (activeCall.type === 'video' ? 'مكالمة فيديو...' : 'جاري الاتصال...') 
                    : (activeCall.type === 'video' ? 'VIDEO CALLING...' : 'CALLING...')}
                </p>
                <h2 className="text-2xl font-bold text-white">{activeCall.contact.name}</h2>
              </div>

              <div className="relative my-8">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-[#D32F2F] rounded-full" />
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="absolute inset-0 bg-[#D32F2F] rounded-full" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-5xl text-white shadow-xl shadow-red-500/20 border-4 border-[#1f1f1f] z-10">
                  {activeCall.contact.name.charAt(0)}
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <button className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors">
                  {activeCall.type === 'video' ? <Video className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                </button>
                <button onClick={endCall} className="w-16 h-16 rounded-full bg-[#D32F2F] hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-colors">
                  <PhoneOff className="w-7 h-7" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && activeContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowProfileModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1F1F1F] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-red-50 to-white dark:from-neutral-800 dark:to-[#1F1F1F] pt-8 pb-4 px-6 text-center border-b border-gray-100 dark:border-neutral-800">
                <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
                <div className="relative inline-block mb-3">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center font-bold text-3xl text-[#D32F2F] border-4 border-white dark:border-[#1F1F1F] shadow-lg shadow-red-500/10 mx-auto">
                    {activeContact.name.charAt(0)}
                  </div>
                  {activeContact.online && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-[#1F1F1F] rounded-full"></div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeContact.name}</h2>
                <div className="flex justify-center items-center gap-2 mt-1">
                  <Droplets className="w-4 h-4 text-[#D32F2F]" />
                  <span className="font-bold text-[#D32F2F]">{activeContact.bloodType}</span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-neutral-900 flex items-center justify-center text-gray-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white" dir="ltr">{activeContact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-neutral-900 flex items-center justify-center text-gray-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'الموقع' : 'Location'}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{activeContact.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-red-50 dark:bg-red-500/5 rounded-2xl p-4 text-center border border-red-100 dark:border-red-500/10">
                    <Activity className="w-5 h-5 text-[#D32F2F] mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{activeContact.donationsCount}</p>
                    <p className="text-[10px] text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'مرات التبرع' : 'Donations'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-4 text-center border border-gray-100 dark:border-neutral-800">
                    <Calendar className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1.5">{activeContact.lastDonation}</p>
                    <p className="text-[10px] text-gray-500 dark:text-neutral-400">{language === 'ar' ? 'آخر تبرع' : 'Last Donation'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Chat Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowClearConfirm(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-[#D32F2F]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'مسح المحادثة؟' : 'Clear Chat?'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
                {language === 'ar' ? 'هل أنت متأكد من مسح جميع الرسائل؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to clear all messages? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={confirmClearChat} className="flex-1 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl font-medium transition-colors">
                  {language === 'ar' ? 'نعم، امسح' : 'Yes, Clear'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Block Contact Confirm Modal */}
      <AnimatePresence>
        {showBlockConfirm && activeContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowBlockConfirm(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-red-100 dark:border-red-900/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Ban className="w-8 h-8 text-[#D32F2F]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? `حظر ${activeContact.name}؟` : `Block ${activeContact.name}?`}
              </h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
                {language === 'ar' ? 'لن يتمكن هذا المستخدم من إرسال رسائل إليك بعد الآن.' : 'This contact will no longer be able to send you messages.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowBlockConfirm(false)} className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={confirmBlockContact} className="flex-1 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/20">
                  {language === 'ar' ? 'تأكيد الحظر' : 'Block Contact'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}