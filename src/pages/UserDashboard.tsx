import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Clock, Wallet, Shield, MapPin, Search, Filter,
  Menu, X, Bell, LogOut, LayoutDashboard, History,
  CheckCircle2, CreditCard, Heart, Trophy, Gavel, ArrowUpRight,
  Package, Truck, Ship, MessageSquare, Plus, Trash2, Edit, Building2,
  FileText, Mail, ShieldCheck, Store, List, File, HelpCircle, Settings,
  MoreVertical, UploadCloud, Globe, ShoppingCart, Check, Reply,
  Link as LinkIcon, Calculator, Info, BookOpen, TrendingUp, Handshake, Map, Camera,
  AlertCircle, Wallet as WalletIcon, FileCheck, User, BarChart3, ChevronRight, ChevronDown, Car, Home
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { MessageDropdown } from '../components/MessageDropdown';
import { SHIPMENT_STATUS_LABELS } from '../types';
import { KycPanel } from '../components/KycPanel';


export const UserDashboard = () => {
  const { currentUser, setCurrentUser, socket, showAlert, cars, watchlist, branchConfig, unreadCounts, markMessageAsRead, markNotificationAsRead } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'overview';

  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeBids, setActiveBids] = useState<any[]>([]);
  const [pendingCars, setPendingCars] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [userBids, setUserBids] = useState<any[]>([]);
  const [userOffers, setUserOffers] = useState<any[]>([]);
  const [lostAuctions, setLostAuctions] = useState<any[]>([]);

  // Sell Car State
  const [sellForm, setSellForm] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    reservePrice: '',
    location: '',
    odometer: '',
    transmission: 'automatic',
    engine: '',
    drive: 'AWD',
    primaryDamage: 'None',
    titleType: 'Clean',
    videoUrl: '',
    inspectionPdf: '',
    description: '',
    images: [] as string[],
    acceptOffers: true
  });

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [newMessageData, setNewMessageData] = useState({ subject: '', content: '', category: 'general' });
  const [inspectionForm, setInspectionForm] = useState({ carDetails: '', location: '', urgency: 'normal' });
  const [depositAmount, setDepositAmount] = useState('1000');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const glassCardClasses = "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem] transition-all duration-500 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]";

  const effectiveUser = currentUser || {
    id: 'user-1',
    firstName: 'محمد',
    lastName: 'العربي',
    email: 'user@autopro.com',
    role: 'admin', // Default to admin for development
    buyingPower: 50000,
    deposit: 5000,
    commission: 5
  } as any;

  const favoriteCars = cars.filter(car => watchlist.some(w => w.carId === car.id));
  const wonCars = cars.filter(car => car.status === 'closed' && car.winnerId === (effectiveUser.id));

  useEffect(() => {
    if (effectiveUser) {
      setProfileForm({
        firstName: effectiveUser.firstName || '',
        lastName: effectiveUser.lastName || '',
        phone: effectiveUser.phone || '',
        address: effectiveUser.address || ''
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: effectiveUser.id, ...profileForm })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        showAlert('تم تحديث الملف الشخصي بنجاح', 'success');
        setIsEditingProfile(false);
      }
    } catch {
      showAlert('فشل التحديث');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      showAlert('كلمة المرور الجديدة غير متطابقة', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: effectiveUser.id, currentPassword: passForm.current, newPassword: passForm.new })
      });
      if (res.ok) {
        showAlert('تم تغيير كلمة المرور بنجاح', 'success');
        setIsChangingPass(false);
        setPassForm({ current: '', new: '', confirm: '' });
      } else {
        const err = await res.json();
        showAlert(err.error || 'فشل التغيير', 'error');
      }
    } catch {
      showAlert('خطأ في الاتصال');
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    if (effectiveUser && socket) {
      socket.emit('join_user_room', effectiveUser.id);
    }
  }, [effectiveUser, socket]);

  // Fetch static user data only when effectiveUser changes or view changes
  useEffect(() => {
    if (effectiveUser?.id) {
      fetch(`/api/invoices/user/${effectiveUser.id}`).then(r => r.json()).then(setInvoices).catch(() => { });
      fetch(`/api/transactions/user/${effectiveUser.id}`).then(r => r.json()).then(setTransactions).catch(() => { });
      fetch(`/api/bids/user/${effectiveUser.id}`).then(r => r.json()).then(setUserBids).catch(() => { });
      fetch(`/api/shipments/user/${effectiveUser.id}`).then(r => r.json()).then(setShipments).catch(() => { });
      fetch(`/api/offers/user/${effectiveUser.id}`).then(r => r.json()).then(setUserOffers).catch(() => { });

      setLoadingMessages(true);
      fetch(`/api/messages/user/${effectiveUser.id}`)
        .then(r => r.json())
        .then(data => { setMessages(data); setLoadingMessages(false); })
        .catch(() => setLoadingMessages(false));

      if (effectiveUser.role === 'admin') {
        fetch('/api/admin/pending-cars').then(r => r.json()).then(setPendingCars).catch(() => { });
      }
    }
  }, [effectiveUser?.id, view]);

  // Derive active/lost auctions from cars (which updates frequently) without re-fetching
  useEffect(() => {
    if (effectiveUser) {
      const lost = cars.filter(car =>
        car.status === 'closed' &&
        car.winnerId !== effectiveUser.id &&
        userBids.some(b => b.carId === car.id)
      );
      setLostAuctions(lost);

      const leadingBids = cars.filter(car => car.status === 'live' && car.winnerId === effectiveUser.id);
      setActiveBids(leadingBids);
    }
  }, [cars, userBids, effectiveUser?.id]);

  const handlePayInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/pay`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid', pickupAuthCode: data.pickupAuthCode } : inv));
        showAlert('تم الدفع بنجاح! كود الاستلام متاح الآن.', 'success');
      }
    } catch (e) {
      showAlert('فشل الدفع', 'error');
    }
  };

  const handleRequestShipping = async (carId: string) => {
    try {
      const res = await fetch(`/api/shipments/${carId}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUser.id })
      });
      if (res.ok) {
        showAlert('تم إرسال طلب الشحن بنجاح! سيتم موافاتك بالتحديثات قريباً.', 'success');
        // Refresh shipments to show the new status
        fetch(`/api/shipments/user/${effectiveUser.id}`).then(r => r.json()).then(setShipments);
        // Switch to logistics view
        navigateTo('logistics');
      } else {
        showAlert('فشل إرسال طلب الشحن', 'error');
      }
    } catch (e) {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUser.id, amount, method: 'bank_transfer' })
      });

      if (res.ok) {
        showAlert('تم إرسال طلب الشحن بنجاح! سيتم تحديث رصيدك بعد مراجعة الإدارة.', 'success');
        setShowDepositModal(false);
        // Refresh transaction list
        fetch(`/api/wallet/${effectiveUser.id}/transactions`).then(r => r.json()).then(setTransactions);
      } else {
        showAlert('فشل إتمام العملية. يرجى المحاولة لاحقاً.', 'error');
      }
    } catch (e) {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sellForm.images.length < 10) {
      showAlert('يرجى رفع 10 صور على الأقل للسيارة', 'error');
      return;
    }
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sellForm, sellerId: effectiveUser.id })
      });
      if (res.ok) {
        showAlert('تم إرسال السيارة للمراجعة بنجاح', 'success');
        setSellForm({
          vin: '', make: '', model: '', year: '', reservePrice: '', location: '',
          odometer: '', transmission: 'automatic', engine: '', drive: 'AWD',
          primaryDamage: 'None', titleType: 'Clean', videoUrl: '',
          inspectionPdf: '', description: '', images: [], acceptOffers: true
        });
      } else {
        const err = await res.json();
        showAlert(err.error || 'فشل إرسال البيانات', 'error');
      }
    } catch (e) {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const navigateTo = (v: string) => {
    if (v === 'go_home') {
      window.location.href = '/';
      return;
    }
    setSearchParams({ view: v });
  };

  const renderOverview = () => {
    const totalExposure = activeBids.reduce((sum, car) => sum + (car.currentBid || 0), 0);
    const availableBuyingPower = (effectiveUser.buyingPower || 0) - totalExposure;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'القوة الشرائية المتاحة', value: `$${availableBuyingPower.toLocaleString()}`, icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-50', title: 'القوة الشرائية المتاحة في حسابك' },
            { label: 'إجمالي المزايدات الملتزم بها', value: `$${totalExposure.toLocaleString()}`, icon: Gavel, color: 'text-slate-900', bg: 'bg-slate-100', title: 'إجمالي المبلغ الملتزم به في المزايدات النشطة' },
            { label: 'السيارات المربوحة', value: wonCars.length, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', title: 'عدد السيارات التي فزت بها' },
            { label: 'فواتير غير مدفوعة', value: invoices.filter(i => i.status === 'unpaid').length, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', title: 'عدد الفواتير المستحقة للدفع' },
          ].map((stat, i) => (
            <div key={i} className={`${glassCardClasses} p-6 flex flex-col items-center text-center group`} title={stat.title}>
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" aria-hidden="true" />
              نشاط المزايدة الحالي
            </h3>
            <div className="space-y-4">
              {activeBids.map(car => (
                <div key={car.id} onClick={() => navigateTo('bids')} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all group">
                  <div className="flex items-center gap-3">
                    {car.images?.[0] ? (
                      <img src={car.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" alt="صورة" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">{car.make[0]}</div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{car.make} {car.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono">LOT #{car.lotNumber}</div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900">${car.currentBid?.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-green-500 uppercase tracking-tighter flex items-center gap-1">
                      الفائز حالياً
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                  </div>
                </div>
              ))}
              {activeBids.length === 0 && <div className="text-center py-8 text-slate-400 text-sm italic font-bold">لا توجد مزايدات نشطة (تكتات) حالياً</div>}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-2">بع سيارتك في ثوانٍ 🚀</h3>
                <p className="text-slate-400 text-sm font-medium mb-8">عملية سهلة، شفافة، وبأعلى سعر في السوق.</p>
              </div>
              <button
                onClick={() => navigateTo('sell')}
                className="bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 text-center"
                title="ابدأ عملية بيع سيارتك الآن"
              >
                ابدأ المزايدة على سيارتك الآن
              </button>
            </div>
            <AlertCircle className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 -rotate-12" aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  };

  const renderWallet = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">المحفظة والتمويل 🏦</h2>
        <button
          onClick={() => setShowDepositModal(true)}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-orange-500 transition-all flex items-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          شحن الرصيد / إيداع عربون
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <WalletIcon className="absolute -top-6 -right-6 w-32 h-32 text-white/5 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">رصيد المحفظة (نقداً)</div>
            <div className="text-5xl font-black mb-8 text-orange-500">${(effectiveUser.deposit || 0).toLocaleString()}</div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Shield className="w-4 h-4 text-emerald-400" />
              حساب مؤمن ومحمي
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl group hover:border-orange-200 transition-all">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">القوة الشرائية (Limit)</div>
          <div className="text-4xl font-black text-slate-900 mb-8 tracking-tight">${(effectiveUser.buyingPower || 0).toLocaleString()}</div>
          <div className="flex items-center gap-2 text-xs text-orange-500 font-black">
            <Gavel className="w-4 h-4" />
            سقف المزايدة الحالي ({branchConfig?.default_buying_power_multiplier || 10}x الإيداع)
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl group hover:border-blue-200 transition-all">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">إجمالي العمليات</div>
          <div className="text-4xl font-black text-slate-900 mb-8 tracking-tight">{transactions.length}</div>
          <div className="flex items-center gap-2 text-xs text-blue-500 font-black">
            <History className="w-4 h-4" />
            سجل النشاط المالي الكامل
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-900">سجل المعاملات المالية</h3>
          <Filter className="w-5 h-5 text-slate-400 cursor-pointer" />
        </div>
        <div className="divide-y divide-slate-50">
          {transactions.map(tx => (
            <div key={tx.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'deposit' ? <ArrowUpRight className="w-6 h-6" /> : <TrendingUp className="rotate-180 w-6 h-6" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{tx.type === 'deposit' ? 'إيداع رصيد' : 'مزايدة / دفع'}</div>
                  <div className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleString('ar-EG')}</div>
                </div>
              </div>
              <div className={`text-xl font-black ${tx.type === 'deposit' ? 'text-green-600' : 'text-slate-900'}`}>
                {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
              </div>
            </div>
          ))}
          {transactions.length === 0 && <div className="p-12 text-center text-slate-400 italic font-bold">لا توجد سجلات مالية بعد</div>}
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl font-black text-slate-900">الفواتير وإيضاحات الاستلام 📄</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {invoices.map(inv => (
          <div key={inv.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-2 h-full ${inv.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invoice ID: INV-{inv.id}</div>
                <h3 className="text-2xl font-black text-slate-900">{inv.year} {inv.make} {inv.model}</h3>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${inv.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                {inv.status === 'paid' ? 'مدفوعة ✅' : 'بانتظار الدفع'}
              </div>
            </div>

            <div className="text-4xl font-black text-slate-900 mb-8">${inv.amount.toLocaleString()} <span className="text-sm font-bold text-slate-400 ml-1">USD</span></div>

            {/* Storage Timer Alert */}
            {inv.status === 'paid' && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div className="text-xs font-bold text-slate-600">التخزين المجاني ينتهي في:</div>
                </div>
                <div className="text-sm font-black text-orange-600">
                  {(() => {
                    const days = Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return days > 0 ? `${days} أيام متبقية` : 'بدأت رسوم التخزين ⚠️';
                  })()}
                </div>
              </div>
            )}

            {inv.status === 'paid' ? (
              <div className="bg-green-50 p-6 rounded-3xl border border-green-100 relative group-hover:bg-green-100/50 transition-colors">
                <div className="text-[10px] font-black text-green-600 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Shield className="w-4 h-4" /> إذن استلام السيارة (Pickup Auth)
                </div>
                <div className="text-3xl font-mono font-black text-green-700 tracking-[0.3em] text-center bg-white py-4 rounded-xl shadow-inner border border-green-200">
                  {inv.pickupAuthCode}
                </div>
                <p className="mt-4 text-[11px] text-green-600 font-bold leading-relaxed">
                  * أبرز هذا الكود وإثبات الشخصية عند زيارة المعرض لاستكمال الاستلام.
                </p>
                {(() => {
                  const ship = shipments.find(s => s.carId === inv.carId);
                  if (!ship || ship.status === 'paid' || ship.status === 'awaiting_payment') {
                    return (
                      <button
                        onClick={() => handleRequestShipping(inv.carId)}
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all border border-slate-700 shadow-lg shadow-slate-900/10"
                      >
                        <Truck className="w-5 h-5 text-accent-500" />
                        طلب شحن السيارة للعنوان
                      </button>
                    );
                  } else {
                    return (
                      <div className="mt-6 p-3 bg-orange-100/50 rounded-2xl text-orange-700 text-xs font-black flex items-center justify-center gap-2 border border-orange-200">
                        <Package className="w-4 h-4" />
                        تم طلب الشحن - تابع حالة السيارة في قسم التتبع
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <button
                onClick={() => handlePayInvoice(inv.id)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95"
              >
                دفع قيمة السيارة الآن
              </button>
            )}
          </div>
        ))}
        {invoices.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-dashed border-slate-200">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p className="text-slate-400 font-bold">لا توجد فواتير حالياً</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSellCar = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">اعرض سيارتك للبيع 🏷️</h2>
        <p className="text-slate-500 font-medium">خطوات بسيطة لعرض سيارتك أمام آلاف المزايدين المحترفين.</p>
      </div>

      <form onSubmit={handleSellSubmit} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">رقم الشاسيه (VIN Lock) 🔒</label>
            <input aria-label="مدخل" title="مدخل" placeholder="مدخل" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-900 font-mono font-bold outline-none focus:border-orange-500 transition-all"
              value={sellForm.vin}
              onChange={e => setSellForm({ ...sellForm, vin: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">السنة</label>
            <input aria-label="مدخل" title="مدخل" placeholder="مدخل" 
              required type="number"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-900 font-bold outline-none focus:border-orange-500 transition-all"
              value={sellForm.year}
              onChange={e => setSellForm({ ...sellForm, year: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">الشركة المصنعة (Make)</label>
            <input aria-label="مدخل" title="مدخل" placeholder="مدخل" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-900 font-bold outline-none focus:border-orange-500 transition-all"
              value={sellForm.make}
              onChange={e => setSellForm({ ...sellForm, make: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">الطراز (Model)</label>
            <input aria-label="مدخل" title="مدخل" placeholder="مدخل" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-900 font-bold outline-none focus:border-orange-500 transition-all"
              value={sellForm.model}
              onChange={e => setSellForm({ ...sellForm, model: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">سعر الاحتياطي ($ Reserve)</label>
            <input aria-label="مدخل" title="مدخل" placeholder="مدخل" 
              required type="number"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-900 font-bold outline-none focus:border-orange-500 transition-all"
              value={sellForm.reservePrice}
              onChange={e => setSellForm({ ...sellForm, reservePrice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">المسافة المقطوعة (Odometer)</label>
            <input aria-label="مدخل" title="مدخل" placeholder="مدخل" 
              required type="number"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-900 font-bold outline-none focus:border-orange-500 transition-all"
              value={sellForm.odometer}
              onChange={e => setSellForm({ ...sellForm, odometer: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-orange-500 transition-colors cursor-pointer group bg-white/50">
            <UploadCloud className="w-10 h-10 text-slate-300 group-hover:text-orange-500 mb-2" />
            <span className="text-sm font-bold text-slate-500 group-hover:text-orange-500">رفع الصور (الحد الأدنى 10)</span>
            <input
              type="file" multiple className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  // Simulate image upload - in real app use FormData and backend
                  setSellForm(prev => ({ ...prev, images: [...prev.images, ...files.map(f => URL.createObjectURL(f as Blob))] }));
                  showAlert(`تم اختيار ${files.length} صور`, 'success');
                }
              }}
            />
            {sellForm.images.length > 0 && <span className="text-xs font-black text-green-500 mt-2">تم رفع {sellForm.images.length} صور</span>}
          </label>

          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-orange-500 transition-colors cursor-pointer group bg-white/50">
            <FileText className="w-10 h-10 text-slate-300 group-hover:text-orange-500 mb-2" />
            <span className="text-sm font-bold text-slate-500 group-hover:text-orange-500">رفع تقرير الفحص (PDF)</span>
            <input
              type="file" accept=".pdf" className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSellForm(prev => ({ ...prev, inspectionPdf: e.target.files![0].name }));
                  showAlert('تم رفع التقرير بنجاح', 'success');
                }
              }}
            />
            {sellForm.inspectionPdf && <span className="text-xs font-black text-green-500 mt-2">{sellForm.inspectionPdf}</span>}
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">وصف السيارة وملاحظات إضافية</label>
          <textarea
            value={sellForm.description}
            onChange={(e) => setSellForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="اكتب هنا حالة الماكينة، القير، أي خدوش، أو أي معلومات تهم المزايدين..."
            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:border-orange-500 transition-all min-h-[150px] font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-slate-900/40 active:scale-95 flex items-center justify-center gap-3"
        >
          <Package className="w-6 h-6" />
          إرسال السيارة بانتظار الاعتماد
        </button>
      </form>

      <div className="bg-orange-50 p-6 rounded-3xl flex gap-4 items-start border border-orange-100">
        <Info className="w-6 h-6 text-orange-500 flex-shrink-0" />
        <div className="text-xs text-orange-700 font-bold leading-relaxed">
          سيتم حجز رقم المنفذ (VIN Lock) فور الإرسال. سيقوم فريق المراجعة بالتأكد من البيانات واعتماد السيارة خلال 2-4 ساعات عمل.
        </div>
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900">غرفة الاعتمادات (Admin Panel) 🛡️</h2>
        <div className="bg-orange-500 text-white px-6 py-2 rounded-full font-black text-xs shadow-lg shadow-orange-500/30">
          {pendingCars.length} طلبات معلقة
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="p-6 font-black text-sm uppercase tracking-widest">المواصفات</th>
                <th className="p-6 font-black text-sm uppercase tracking-widest">VIN Lock</th>
                <th className="p-6 font-black text-sm uppercase tracking-widest">السعر المطلوبة</th>
                <th className="p-6 font-black text-sm uppercase tracking-widest">الإجراءات الحاسمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingCars.map(car => (
                <tr key={car.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6">
                    <div className="font-black text-slate-900 text-lg group-hover:text-orange-500 transition-colors">{car.year} {car.make} {car.model}</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">البائع: {car.sellerId}</div>
                  </td>
                  <td className="p-6 font-mono font-bold text-slate-500">{car.vin}</td>
                  <td className="p-6 font-black text-slate-900">${car.reservePrice?.toLocaleString()}</td>
                  <td className="p-6">
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/approve-car/${car.id}`, { method: 'POST' });
                          if (res.ok) {
                            setPendingCars(prev => prev.filter(c => c.id !== car.id));
                            showAlert('تم اعتماد السيارة وستظهر قريباً في المزادات', 'success');
                          }
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-xl shadow-green-600/20 active:scale-95 transition-all"
                      >
                        اعتماد ونشر ✅
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/admin/reject-car/${car.id}`, { method: 'POST' });
                          if (res.ok) {
                            setPendingCars(prev => prev.filter(c => c.id !== car.id));
                            showAlert('تم رفض السيارة وإخطار البائع', 'error');
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-2xl text-xs font-black transition-all"
                      >
                        رفض الطلب ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingCars.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-slate-300 font-black italic text-lg bg-slate-50/50">
                    لا توجد طلبات معلقة حالياً. عمل مذهل! ☕
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ── Phase 15: KYC rendered as proper component below ── */

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans" dir="rtl">
      {/* Dynamic Sidebar */}
      <aside className="w-80 bg-white border-l border-slate-100 p-8 flex flex-col gap-10 shadow-sm sticky top-0 h-screen">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigateTo('overview')}>
          <div className="w-12 h-12 bg-orange-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 rotate-12 group-hover:rotate-0 transition-transform">
            <Car className="w-7 h-7" />
          </div>
          <div>
            {branchConfig ? (
              <div className="text-xl font-black text-slate-950 tracking-tighter leading-tight">
                {branchConfig.logoText.split(' ')[0]}<br />
                <span className="text-orange-500">{branchConfig.logoText.split(' ').slice(1).join(' ')}</span>
              </div>
            ) : (
              <div className="text-xl font-black text-slate-950 tracking-tighter leading-tight">ليبيا<br /><span className="text-orange-500">أوتو برو</span></div>
            )}
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{branchConfig?.logoSubtext || 'Libya'}</div>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          {[
            { id: 'go_home', label: 'سوق السيارات', icon: Home, customNav: true },
            { id: 'overview', label: 'اللوحة الرئيسية', icon: LayoutDashboard },
            { id: 'bids', label: 'مزاداتي النشطة', icon: Gavel },
            { id: 'watchlist', label: 'المفضلة', icon: Heart },
            { id: 'wallet', label: 'المحفظة والتمويل', icon: WalletIcon },
            { id: 'invoices', label: 'الفواتير والاستلام', icon: FileText },
            { id: 'logistics', label: 'التتبع والشحن', icon: Truck, badge: shipments.filter(s => s.status !== 'delivered' && s.status !== 'awaiting_payment').length || 0 },
            { id: 'services', label: 'تقارير السوق', icon: BookOpen },
            { id: 'inspections', label: 'فحص السيارات', icon: Shield },
            { id: 'kyc', label: `توثيق الهوية (KYC) ${effectiveUser.kycStatus === 'approved' ? '✅' : effectiveUser.kycStatus === 'pending' ? '⏳' : '⚠️'}`, icon: FileCheck },
            { id: 'messages', label: `الرسائل ${unreadCounts.messages > 0 ? `(${unreadCounts.messages})` : ''}`, icon: Mail },
            { id: 'profile', label: 'الملف الشخصي', icon: User },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'go_home') {
                  window.location.href = '/marketplace';
                } else {
                  navigateTo(item.id);
                }
              }}
              className={`flex items-center justify-between px-6 py-4 rounded-[1.5rem] font-black text-sm transition-all group ${view === item.id
                ? 'bg-slate-950 text-white shadow-2xl shadow-slate-950/40 translate-x-3'
                : (item as any).highlight ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${view === item.id ? 'text-orange-400' : ''}`} />
                {item.label}
              </div>
              <div className="flex items-center gap-2">
                {(item as any).admin && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                {item.id === 'logistics' && (item.badge ?? 0) > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-orange-500/30">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>

        <button
          onClick={() => {
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-6 py-4 rounded-[1.5rem] font-black text-sm text-red-500 hover:bg-red-50 transition-all mt-4"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>

        <div className="mt-auto p-6 bg-slate-950 rounded-[2rem] text-white relative overflow-hidden group">
          <div className="relative z-10 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</div>
            <div className="text-xs font-black mb-4">عمولة مخفضة 3% تفعيل</div>
            <button
              onClick={() => navigateTo('bids')}
              className="w-full bg-white text-slate-950 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all relative"
            >
              تكتات النشطة
              {activeBids.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] animate-bounce">
                  {activeBids.length}
                </span>
              )}
            </button>
          </div>
          <Shield className="absolute -bottom-4 -right-4 w-20 h-20 text-white/5 rotate-12" />
        </div>
      </aside>

      {/* Primary Content Viewport */}
      <main className="flex-1 p-12 overflow-y-auto min-h-screen">
        <header className="flex justify-between items-center mb-16 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-6 text-right" dir="rtl">
            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-950/20 relative group">
              <User className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight">
                أهلاً بك، {effectiveUser.firstName} 👋
              </h1>
              <p className="text-slate-500 font-bold text-sm mt-1">لديك {invoices.filter(i => i.status === 'unpaid').length} فواتير بانتظار الدفع أو المراجعة.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm gap-2">
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
                  className={`p-3 rounded-xl transition-all relative ${showNotifications ? 'bg-orange-50 text-orange-500' : 'hover:bg-slate-50 text-slate-400'}`}
                >
                  <Bell className="w-6 h-6" />
                  {unreadCounts.notifications > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCounts.notifications}
                    </span>
                  )}
                </button>
                {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
              </div>

              <div className="relative">
                <button
                  onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
                  className={`p-3 rounded-xl transition-all relative ${showMessages ? 'bg-orange-50 text-orange-500' : 'hover:bg-slate-50 text-slate-400'}`}
                >
                  <Mail className="w-6 h-6" />
                  {unreadCounts.messages > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCounts.messages}
                    </span>
                  )}
                </button>
                {showMessages && <MessageDropdown onClose={() => setShowMessages(false)} />}
              </div>
            </div>
            <div className="h-14 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-left">
                <div className="text-sm font-black text-slate-900 group-hover:text-orange-500 transition-colors">{effectiveUser.firstName} {effectiveUser.lastName}</div>
                <div className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-[0.2em]">{effectiveUser.role}</div>
              </div>
              <div className="w-14 h-14 bg-slate-950 rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl border-4 border-white shadow-2xl group-hover:rotate-6 transition-transform">
                {effectiveUser.firstName[0]}
              </div>
            </div>
          </div>
        </header>

        {view === 'overview' && renderOverview()}
        {view === 'wallet' && renderWallet()}
        {view === 'invoices' && renderInvoices()}
        {view === 'sell' && renderSellCar()}
        {view === 'admin' && effectiveUser.role === 'admin' && renderAdminPanel()}
        {view === 'watchlist' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black text-slate-900">سيارات في المفضلة ❤️</h2>
            {watchlist.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-xl text-center">
                <Heart className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-400">لا توجد سيارات في المفضلة حالياً</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.filter(c => watchlist.some(w => w.carId === c.id)).map(car => (
                  <div key={car.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={car.images[0]} className="w-full h-full object-cover car-card-image group-hover:scale-110 transition-transform duration-700" alt="صورة" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black shadow-sm">#{car.lotNumber}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-black text-slate-900 mb-4">{car.year} {car.make} {car.model}</h3>
                      <button onClick={() => window.location.href = `/car-details/${car.id}`} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs hover:bg-orange-600 transition-all">مزايدة الآن</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {view === 'logistics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black text-slate-900">التتبع والشحن 📦</h2>
            {shipments.map((ship: any) => {
              const steps = [
                { key: 'awaiting_payment', label: 'بانتظار الدفع', icon: '💳' },
                { key: 'paid', label: 'تم الدفع', icon: '✅' },
                { key: 'shipping_requested', label: 'طلب الشحن', icon: '🚚' },
                { key: 'in_transport', label: 'قيد النقل', icon: '🚛' },
                { key: 'in_warehouse', label: 'في المستودع', icon: '🏭' },
                { key: 'in_shipping', label: 'جاري الشحن', icon: '🚢' },
                { key: 'customs', label: 'التخليص الجمركي', icon: '📋' },
                { key: 'delivered', label: 'تم التوصيل', icon: '🎉' }
              ];
              const currentIdx = steps.findIndex(s => s.key === ship.status);
              return (
                <div key={ship.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <img src={ship.images?.[0]} className="w-24 h-16 object-cover rounded-2xl car-card-image shadow-sm" alt="صورة" />
                    <div>
                      <div className="font-black text-slate-900 text-lg">{ship.year} {ship.make} {ship.model}</div>
                      <div className="text-xs text-slate-400 font-bold">LOT #{ship.lotNumber}</div>
                    </div>
                  </div>
                  {/* Timeline */}
                  <div className="relative px-4 pb-8">
                    <div className="flex items-center justify-between relative z-10">
                      {steps.map((s, i) => (
                        <div key={s.key} className="flex flex-col items-center flex-1 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${i < currentIdx ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                            i === currentIdx ? 'bg-orange-500 border-orange-500 text-white scale-110 shadow-lg shadow-orange-500/30' :
                              'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                            {i < currentIdx ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                          </div>
                          <span className={`text-[9px] font-black mt-3 text-center transition-colors duration-500 ${i <= currentIdx ? 'text-slate-900' : 'text-slate-400'
                            }`}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Progress bar background */}
                    <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 rounded-full">
                      {/* Animated progress fill */}
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        ref={(el) => { if (el) el.style.width = `${(currentIdx / (steps.length - 1)) * 100}%`; }}
                      ></div>
                    </div>
                  </div>
                  {(ship.currentLocation || ship.trackingNumber) && (
                    <div className="mt-4 pt-6 border-t border-slate-50 flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex gap-4">
                        {ship.trackingNumber && (
                          <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 border border-slate-100 flex items-center gap-2">
                            رقم التتبع: <span className="text-slate-900">{ship.trackingNumber}</span>
                          </div>
                        )}
                        {ship.currentLocation && (
                          <div className="px-4 py-2 bg-blue-50 rounded-xl text-[10px] font-black text-blue-700 border border-blue-100 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> الموقع: {ship.currentLocation}
                          </div>
                        )}
                      </div>
                      <button className="text-xs font-black text-orange-600 hover:text-orange-700 underline underline-offset-4">تحميل تقرير الشحن الكامل</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {view === 'messages' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-900">مركز الرسائل والدعم 💬</h2>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-orange-500 transition-all shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                رسالة جديدة
              </button>
            </div>

            {/* Message list */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
              {messages.length === 0 ? (
                <div className="p-20 text-center">
                  <Mail className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                  <h3 className="text-xl font-black text-slate-400 italic">لا توجد رسائل واردة حالياّ</h3>
                  <p className="text-sm text-slate-400 mt-2">اضغط على "رسالة جديدة" للتواصل مع فريق الدعم</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      onClick={() => !msg.isRead && markMessageAsRead(msg.id)}
                      className={`p-8 hover:bg-slate-50/50 transition-all flex justify-between items-center group cursor-pointer ${!msg.isRead ? 'bg-orange-50/20 border-r-4 border-orange-500' : ''
                        }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
                            {msg.senderFirstName?.[0] || 'إ'}
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{msg.category || 'عام'}</div>
                            <div className="text-sm font-black text-slate-900">{msg.senderFirstName} {msg.senderLastName}</div>
                          </div>
                        </div>
                        <h4 className={`text-lg transition-colors ${!msg.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-600 group-hover:text-slate-900'
                          }`}>{msg.subject}</h4>
                        <p className="text-sm text-slate-500 font-medium line-clamp-2 max-w-2xl">{msg.content}</p>
                        <div className="text-[10px] font-bold text-slate-400 mt-4">{new Date(msg.timestamp).toLocaleString('ar-LY')}</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-slate-900 group-hover:rtl:-translate-x-2 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── New Message Modal ── */}
            {showNewMessageModal && (
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[120] p-4" dir="rtl">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">إرسال رسالة للدعم</h3>
                    <button aria-label="زر" title="زر"  onClick={() => setShowNewMessageModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">نوع الطلب</label>
                      <select aria-label="تحديد" title="تحديد" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none focus:border-orange-500 transition-all"
                        value={newMessageData.category}
                        onChange={e => setNewMessageData(p => ({ ...p, category: e.target.value }))}
                      >
                        <option value="general">عام</option>
                        <option value="billing">فواتير ومدفوعات</option>
                        <option value="shipping">شحن ولوجستيك</option>
                        <option value="technical">دعم تقني</option>
                        <option value="auction">استفسار عن مزاد</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">موضوع الرسالة</label>
                      <input aria-label="مدخل" title="مدخل" placeholder="مدخل" 
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none focus:border-orange-500 transition-all"
                        value={newMessageData.subject}
                        onChange={e => setNewMessageData(p => ({ ...p, subject: e.target.value }))}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">نص الرسالة</label>
                      <textarea
                        rows={5}
                        placeholder="اكتب رسالتك هنا..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none focus:border-orange-500 transition-all resize-none"
                        value={newMessageData.content}
                        onChange={e => setNewMessageData(p => ({ ...p, content: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={async () => {
                          if (!newMessageData.subject.trim() || !newMessageData.content.trim()) {
                            showAlert('يرجى ملء الموضوع ونص الرسالة', 'error');
                            return;
                          }
                          try {
                            const res = await fetch('/api/messages', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                senderId: effectiveUser.id,
                                recipientId: 1, // Admin
                                subject: newMessageData.subject,
                                content: newMessageData.content,
                                category: newMessageData.category,
                              }),
                            });
                            if (res.ok) {
                              showAlert('✅ تم إرسال رسالتك! سيرد عليك فريق الدعم خلال 24 ساعة.', 'success');
                              setShowNewMessageModal(false);
                              setNewMessageData({ subject: '', content: '', category: 'general' });
                              // Refresh messages
                              fetch(`/api/messages/user/${effectiveUser.id}`)
                                .then(r => r.json())
                                .then(data => setMessages(data))
                                .catch(() => { });
                            } else {
                              showAlert('فشل الإرسال، حاول مرة أخرى', 'error');
                            }
                          } catch {
                            showAlert('خطأ في الاتصال بالخادم', 'error');
                          }
                        }}
                        className="flex-[2] bg-orange-500 hover:bg-orange-400 text-white py-3.5 rounded-2xl font-black transition-all"
                      >
                        📤 إرسال الرسالة
                      </button>
                      <button
                        onClick={() => { setShowNewMessageModal(false); setNewMessageData({ subject: '', content: '', category: 'general' }); }}
                        className="flex-1 bg-slate-100 text-slate-500 py-3.5 rounded-2xl font-black hover:bg-slate-200 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {view === 'services' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black text-slate-900">تقارير السوق والأسعار 📊</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'تحليل أسعار السوق', desc: 'قارن أسعار السيارات المشابهة في السوق المحلي والدولي.', icon: TrendingUp },
                { title: 'تقرير مبيعات الشهر', desc: 'إحصائيات تفصيلية عن حركة المبيعات والأصناف الأكثر طلباً.', icon: BarChart3 },
                { title: 'أسعار الشحن المحدثة', desc: 'آخر تحديثات تكاليف الشحن من الموانئ الأمريكية والخليجية.', icon: Ship },
              ].map((report, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <report.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{report.desc}</p>
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setShowReportModal(true);
                    }}
                    className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-2"
                  >
                    عرض التقرير التفصيلي <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Reports Modal */}
            {showReportModal && selectedReport && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 text-right" dir="rtl">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                      <selectedReport.icon className="w-8 h-8" />
                    </div>
                    <button aria-label="زر" title="زر"  onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedReport.title}</h3>
                  <p className="text-slate-500 font-bold mb-8">{selectedReport.desc}</p>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-2">النطاق الزمني</div>
                      <div className="text-lg font-black text-slate-900">آخر 30 يوماً</div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-2">دقة المعلومات</div>
                      <div className="text-lg font-black text-emerald-600">99.8% مؤكدة</div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4 mb-8">
                    <Info className="w-6 h-6 text-orange-500 shrink-0" />
                    <p className="text-xs text-orange-700 font-bold leading-relaxed">
                      هذا التقرير يستند إلى تحليل البيانات التاريخية لآلاف العمليات المشابهة في المنصة. قد تختلف الأسعار الفعلية بناءً على حالة كل سيارة وتوقيت المزاد.
                    </p>
                  </div>

                  <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                    تحميل التقرير الكامل بصيغة PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {view === 'inspections' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black text-slate-900">طلبات فحص السيارات 🔍</h2>
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl text-center">
              <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">خدمة الفحص الفني المعتمد</h3>
              <p className="text-slate-500 font-medium max-w-lg mx-auto mb-8">
                نوفر لك خدمة فحص فني شاملة بـ 150 نقطة فحص للتأكد من حالة السيارة الميكانيكية والكهربائية قبل الشراء.
              </p>
              <button
                onClick={() => setShowInspectionModal(true)}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
              >
                طلب فحص سيارة جديدة
              </button>
            </div>

            {/* Inspection Request Modal */}
            {showInspectionModal && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 text-right" dir="rtl">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in-95 duration-200">
                  <h3 className="text-2xl font-black text-slate-900 mb-6">طلب فحص فني جديد</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 mr-1">بيانات السيارة (الماركة، الطراز، VIN)</label>
                      <textarea
                        rows={3}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-orange-500 transition-all font-bold"
                        placeholder="Ex: Toyota Camry 2024 - VIN: 1234..."
                        value={inspectionForm.carDetails}
                        onChange={e => setInspectionForm(prev => ({ ...prev, carDetails: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 mr-1">موقع تواجد السيارة</label>
                      <input aria-label="مدخل" title="مدخل" placeholder="مدخل" 
                        type="text"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-orange-500 transition-all font-bold"
                        value={inspectionForm.location}
                        onChange={e => setInspectionForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 mr-1">درجة الاستعجال</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setInspectionForm(prev => ({ ...prev, urgency: 'normal' }))}
                          className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${inspectionForm.urgency === 'normal' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-slate-50 border-transparent text-slate-400'}`}
                        >
                          عادي (48 ساعة)
                        </button>
                        <button
                          onClick={() => setInspectionForm(prev => ({ ...prev, urgency: 'high' }))}
                          className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${inspectionForm.urgency === 'high' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-slate-50 border-transparent text-slate-400'}`}
                        >
                          مستعجل (24 ساعة)
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-blue-800 mb-1">تقرير معتمد بـ 150 نقطة</div>
                        <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                          ستحصل على تقرير PDF مفصل مع صور عالية الدقة لكل زوايا السيارة وفحص الكمبيوتر والميكانيكا.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => {
                          if (!inspectionForm.carDetails || !inspectionForm.location) {
                            showAlert('يرجى ملء البيانات المطلوبة', 'error');
                            return;
                          }
                          showAlert('تم إرسال طلب الفحص بنجاح! سيتواصل معك فريق الفحص قريباً.', 'success');
                          setShowInspectionModal(false);
                          setInspectionForm({ carDetails: '', location: '', urgency: 'normal' });
                        }}
                        className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                      >
                        تأكيد وإرسال الطلب
                      </button>
                      <button
                        onClick={() => setShowInspectionModal(false)}
                        className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {view === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-900">الملف الشخصي 👤</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-orange-500 transition-all flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  تعديل البيانات
                </button>
              )}
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-orange-500 to-amber-400"></div>

              <div className="flex items-center gap-8 mb-10">
                <div className="w-32 h-32 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl relative group">
                  {effectiveUser.firstName[0]}
                  <div className="absolute inset-0 bg-orange-500/80 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{effectiveUser.firstName} {effectiveUser.lastName}</h3>
                  <p className="text-slate-400 font-bold">{effectiveUser.email}</p>
                  <div className="mt-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${effectiveUser.kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      {effectiveUser.kycStatus === 'approved' ? 'موثق بالكامل ✅' : 'بانتظار التوثيق ⏳'}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">عضو {effectiveUser.role === 'admin' ? 'إدارة' : 'تاجر'} ⭐</span>
                  </div>
                </div>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6 pt-10 border-t border-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم الأول</label>
                      <input aria-label="مدخل" title="مدخل" placeholder="مدخل"  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-200 focus:border-orange-500 outline-none transition-all"
                        value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم الأخير</label>
                      <input aria-label="مدخل" title="مدخل" placeholder="مدخل"  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-200 focus:border-orange-500 outline-none transition-all"
                        value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">رقم الهاتف</label>
                      <input aria-label="مدخل" title="مدخل" placeholder="مدخل"  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-200 focus:border-orange-500 outline-none transition-all"
                        value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">العنوان</label>
                      <input aria-label="مدخل" title="مدخل" placeholder="مدخل"  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-200 focus:border-orange-500 outline-none transition-all"
                        value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={isSavingProfile} className="flex-1 bg-orange-500 text-white py-4 rounded-3xl font-black shadow-xl hover:bg-orange-600 transition-all disabled:opacity-50">
                      {isSavingProfile ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-3xl font-black hover:bg-slate-200 transition-all">
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم الأول</label>
                    <div className="p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-100">{effectiveUser.firstName}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم الأخير</label>
                    <div className="p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-100">{effectiveUser.lastName}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">رقم الهاتف</label>
                    <div className="p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-100">{effectiveUser.phone || '+218 92-000-0000'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">العنوان</label>
                    <div className="p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-100">{effectiveUser.address || 'طرابلس، ليبيا'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-orange-500" />
                الأمان وكلمة المرور
              </h3>

              {isChangingPass ? (
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">كلمة المرور الحالية</label>
                    <input aria-label="مدخل" title="مدخل" placeholder="مدخل"  type="password" required className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-orange-500 font-bold"
                      value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">كلمة المرور الجديدة</label>
                    <input aria-label="مدخل" title="مدخل" placeholder="مدخل"  type="password" required className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-orange-500 font-bold"
                      value={passForm.new} onChange={e => setPassForm({ ...passForm, new: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">تأكيد كلمة المرور الجديدة</label>
                    <input aria-label="مدخل" title="مدخل" placeholder="مدخل"  type="password" required className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-orange-500 font-bold"
                      value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={isSavingProfile} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-orange-500 transition-all disabled:opacity-50">
                      {isSavingProfile ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                    </button>
                    <button type="button" onClick={() => setIsChangingPass(false)} className="text-slate-400 font-bold hover:text-slate-600">إلغاء</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setIsChangingPass(true)} className="bg-orange-50 text-orange-600 px-8 py-4 rounded-2xl font-black text-sm hover:bg-orange-100 transition-all border border-orange-100">
                  تغيير كلمة المرور الشخصية
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== BIDS SECTION ===== */}
        {view === 'bids' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black text-slate-900">مزاداتي النشطة 🔨</h2>
            {/* Currently Winning */}
            {activeBids.length > 0 && (
              <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100">
                <h3 className="font-black text-green-700 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5" /> أنت الفائز حالياً في:</h3>
                <div className="space-y-3">
                  {activeBids.map(car => (
                    <div key={car.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <img src={car.images?.[0]} className="w-16 h-12 object-cover rounded-xl" alt="صورة" />
                        <div>
                          <div className="font-bold text-slate-900">{car.year} {car.make} {car.model}</div>
                          <div className="text-xs text-slate-400">LOT #{car.lotNumber}</div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-black text-green-700">${car.currentBid?.toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-green-500">الفائز حالياً ⭐</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Bid History */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100">
                <h3 className="font-black text-slate-900">سجل المزايدات</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {userBids.map((bid: any, i: number) => {
                  const isWinning = bid.carStatus === 'live' && bid.winnerId === effectiveUser.id;
                  const hasWon = bid.carStatus === 'closed' && bid.winnerId === effectiveUser.id;
                  const hasLost = bid.carStatus === 'closed' && bid.winnerId !== effectiveUser.id;
                  return (
                    <div key={bid.id || i} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={bid.images?.[0]} className="w-14 h-10 object-cover rounded-lg" alt="صورة" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{bid.year} {bid.make} {bid.model}</div>
                          <div className="text-xs text-slate-400">{new Date(bid.timestamp).toLocaleString('ar-EG')}</div>
                        </div>
                      </div>
                      <div className="text-left flex items-center gap-4">
                        <div className="font-black text-slate-900">${bid.amount?.toLocaleString()}</div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${isWinning ? 'bg-green-100 text-green-700' :
                          hasWon ? 'bg-yellow-100 text-yellow-700' :
                            hasLost ? 'bg-red-100 text-red-600' :
                              'bg-slate-100 text-slate-500'
                          }`}>
                          {isWinning ? 'الفائز حالياً ⭐' : hasWon ? 'فزت 🏆' : hasLost ? 'لم تفز' : 'مزايدة'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {userBids.length === 0 && <div className="p-12 text-center text-slate-400 italic font-bold">لا توجد مزايدات بعد</div>}
              </div>
            </div>
          </div>
        )}

        {/* Phase 15 — KYC Identity Verification */}
        {view === 'kyc' && (
          <div className="p-6 md:p-8 max-w-3xl">
            <KycPanel
              kycStatus={effectiveUser.kycStatus}
              userId={String(effectiveUser.id)}
              showAlert={showAlert}
            />
          </div>
        )}

        {/* Modal overlays are handled globally at the end of the viewport */}
      </main>
    </div>
  );
};
