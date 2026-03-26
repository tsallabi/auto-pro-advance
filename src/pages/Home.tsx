import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Car } from '../types';
import {
  LayoutGrid, List, Heart, Activity, Bell, Save, Filter,
  ChevronDown, ArrowUpRight, Search, SlidersHorizontal,
  MapPin, Shield, Clock, CheckCircle2, AlertCircle, X,
  Calendar, Gauge, Info, Gavel, User, Menu, Settings,
  Car as CarIcon, Mail, Laptop, Truck, BookOpen,
  Calculator as CalcIcon, Wallet, LayoutDashboard, Plus, Handshake,
  Droplets, Settings2, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { MessageDropdown } from '../components/MessageDropdown';
import { useTranslation } from 'react-i18next';

const ListCarTimer = ({ car }: { car: Car }) => {
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    const updateCountdown = () => {
      let targetTime = 0;
      if (car.status === 'upcoming' && car.auctionStartTime) {
        targetTime = new Date(car.auctionStartTime).getTime();
      } else if (car.status === 'live' && car.auctionEndDate) {
        targetTime = new Date(car.auctionEndDate).getTime();
      }

      if (!targetTime) {
        setTimeLeft('لا يوجد موعد');
        return;
      }

      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [car]);

  return (
    <div className="flex items-center gap-2 text-rose-600">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-black font-mono">{timeLeft}</span>
    </div>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cars, watchlist, toggleWatchlist, currentUser, unreadCounts, users, exchangeRate } = useStore();
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'events' | 'saved'>('events');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Use URL for tab state
  const activeTab = searchParams.get('tab') || 'all';

  const handleTabChange = (tabId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabId);
    setSearchParams(newParams);
  };

  // Filters logic
  const filteredCars = (cars || []).filter(car => {
    if (!car) return false;

    const urlSearch = searchParams.get('search')?.toLowerCase() || '';
    const urlMake = searchParams.get('make')?.toLowerCase() || 'all';

    const matchesSearch =
      (car.make?.toLowerCase() || '').includes(searchTerm.toLowerCase() || urlSearch) ||
      (car.model?.toLowerCase() || '').includes(searchTerm.toLowerCase() || urlSearch) ||
      (car.lotNumber?.toString() || '').includes(searchTerm || urlSearch) ||
      (car.year?.toString() || '').includes(searchTerm || urlSearch);

    let matchesTab = true;
    if (activeTab === 'all') matchesTab = ['live', 'upcoming', 'offer_market', 'closed'].includes(car.status);
    if (activeTab === 'live') matchesTab = car.status === 'live';
    if (activeTab === 'watchlist') matchesTab = (watchlist || []).some((w: any) => w.carId === car.id);
    if (activeTab === 'upcoming') matchesTab = car.status === 'upcoming';
    if (activeTab === 'offer_market') matchesTab = car.status === 'offer_market';
    if (activeTab === 'closed') matchesTab = car.status === 'closed';

    // Additional Brand Filter from URL
    const matchesMake = urlMake === 'all' || car.make?.toLowerCase() === urlMake;

    return matchesSearch && matchesTab && matchesMake;
  });

  const categories = [
    { id: 'marketplace', label: t('home.categories.carMarket'), icon: CarIcon, path: '/marketplace' },
    { id: 'offer_market', label: t('home.categories.offersMarket'), icon: Handshake, path: currentUser?.role === 'admin' ? '/dashboard/admin?view=marketplace_management' : '/marketplace?tab=offer_market' },
    { id: 'reports', label: t('home.categories.marketReports'), icon: BookOpen, path: currentUser?.role === 'admin' ? '/dashboard/admin?view=reports' : '/dashboard/user?view=services' },
    { id: 'capital', label: t('home.categories.financeWallet'), icon: Wallet, path: currentUser?.role === 'admin' ? '/dashboard/admin?view=financial_ledger' : '/dashboard/user?view=wallet' },
    { id: 'shipping', label: t('home.categories.shippingServices'), icon: Truck, path: currentUser?.role === 'admin' ? '/dashboard/admin?view=logistics' : '/dashboard/user?view=logistics' },
  ];

  const handleCategoryClick = (cat: any) => {
    if (!currentUser && cat.id !== 'marketplace') {
      navigate('/auth');
      return;
    }
    navigate(cat.path);
  };

  const handleBidClick = (car: Car) => {
    navigate(`/car-details/${car.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-cairo text-slate-900" dir="rtl">
      {/* --- TOP FULL-WIDTH HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[101] shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo */}
            <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group shrink-0">
              <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <CarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight hidden sm:block">{t('nav.autoPro')}</span>
            </div>

            {/* Navigation Links — only on xl+ to avoid crowding */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-950 transition-all whitespace-nowrap"
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Action Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <div className="relative">
                <button
                  title="الرسائل"
                  aria-label="عرض الرسائل"
                  onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
                  className={`p-2.5 rounded-xl transition-all relative ${showMessages ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Mail className="w-5 h-5" />
                  {unreadCounts.messages > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCounts.messages}
                    </span>
                  )}
                </button>
                {showMessages && <MessageDropdown onClose={() => setShowMessages(false)} />}
              </div>

              <div className="relative">
                <button
                  title="الإشعارات"
                  aria-label="عرض الإشعارات"
                  onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
                  className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCounts.notifications > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCounts.notifications}
                    </span>
                  )}
                </button>
                {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
              </div>
            </div>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                  >
                    <div className="w-7 h-7 bg-orange-500 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                      {currentUser.firstName[0]}
                    </div>
                    <div className="text-right hidden xl:block">
                      <div className="text-xs font-black leading-none">{currentUser.firstName}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{currentUser.role}</div>
                    </div>
                  </button>

                  {showUserDropdown && (
                    <div className="absolute left-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={() => navigate(currentUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/user')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-2xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-orange-500" />
                        {t('nav.dashboard')}
                      </button>
                      <button onClick={() => navigate('/dashboard/user?view=profile')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-2xl transition-colors">
                        <User className="w-4 h-4 text-slate-400" />
                        الملف الشخصي
                      </button>
                      <button onClick={() => navigate('/dashboard/user?view=settings')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-2xl transition-colors">
                        <Settings className="w-4 h-4 text-slate-400" />
                        الإعدادات
                      </button>
                      <div className="h-px bg-slate-50 my-1"></div>
                      <button onClick={() => { localStorage.removeItem('currentUser'); window.location.reload(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                        <Activity className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(
                    currentUser.role === 'admin' ? '/dashboard/admin' :
                      currentUser.role === 'seller' ? '/dashboard/seller' :
                        '/dashboard/user'
                  )}
                  className="hidden lg:flex items-center gap-1.5 bg-orange-500 text-white text-xs font-black px-3 py-2 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t('nav.dashboard')}
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/auth')} className="bg-orange-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
                {t('nav.loginRegister')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- STICKY FILTER BAR --- */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              aria-label={t('home.search.placeholder')}
              title={t('home.search.placeholder')}
              placeholder={t('home.search.placeholder')}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
              <SlidersHorizontal className="w-4 h-4" />
              {t('home.search.advancedSearch')}
            </button>
            <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
              <button
                title={t('home.search.grid_view')}
                aria-label={t('home.search.grid_view')}
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                title={t('home.search.list_view')}
                aria-label={t('home.search.list_view')}
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-8 items-start w-full overflow-hidden min-w-0">

        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-40 z-10">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex p-2 bg-slate-50">
              <button
                onClick={() => setActiveSidebarTab('events')}
                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${activeSidebarTab === 'events' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t('home.sidebar.eventsAuctions')}
              </button>
              <button
                onClick={() => setActiveSidebarTab('saved')}
                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${activeSidebarTab === 'saved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t('home.sidebar.savedSearches')}
              </button>
            </div>

            <div className="p-6">
              {activeSidebarTab === 'events' ? (
                <div className="space-y-4">
                  {[
                    { label: t('home.sidebar.copartLive'), count: 124, active: true },
                    { label: t('home.sidebar.noReserve'), count: 42, active: false },
                    { label: t('home.sidebar.gulfUpcoming'), count: 88, active: false },
                    { label: t('home.sidebar.dealerClearance'), count: 15, active: false },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (item.label.includes('Copart')) handleTabChange('all');
                        if (item.label.includes('الخليج') || item.label.includes('Gulf')) handleTabChange('upcoming');
                      }}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${item.active ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-sm">{item.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.active ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{item.count}</span>
                      </div>
                      {item.active && <div className="text-[10px] font-bold opacity-70">{t('home.sidebar.auctionInProgress')}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Save className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-base font-black text-slate-900 mb-2">{t('home.sidebar.noSavedSearches')}</h3>
                  <p className="text-xs text-slate-500 font-bold mb-6">{t('home.sidebar.saveSearchAlert')}</p>
                  <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs">{t('home.sidebar.saveCurrentSearch')}</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
            <div className="relative z-10">
              <div className="text-orange-500 font-black text-[10px] uppercase tracking-widest mb-2 text-right">{t('home.news.platformNews')}</div>
              <h3 className="text-xl font-black mb-4 leading-tight">{t('home.news.freeCarfax')}</h3>
              <button className="flex items-center gap-2 text-sm font-black text-white group-hover:gap-4 transition-all">
                {t('home.news.details')} <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <Shield className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 -rotate-12" />
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 space-y-6 min-w-0 overflow-hidden w-full max-w-[100vw]">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide min-w-0 w-full max-w-[100vw]">
            {[
              { id: 'all', label: t('home.tabs.all'), count: (cars || []).length },
              { id: 'upcoming', label: t('home.tabs.upcoming'), count: (cars || []).filter(c => c.status === 'upcoming').length },
              { id: 'live', label: t('home.tabs.liveAuctions'), count: (cars || []).filter(c => c.status === 'live').length },
              { id: 'offer_market', label: t('home.tabs.offersMarket'), count: (cars || []).filter(c => c.status === 'offer_market').length },
              { id: 'closed', label: t('home.tabs.soldCars'), count: (cars || []).filter(c => c.status === 'closed').length },
              { id: 'watchlist', label: t('home.tabs.favorites'), count: (watchlist || []).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-black whitespace-nowrap transition-all border-2 flex items-center gap-2 ${activeTab === tab.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
              >
                {tab.label}
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {filteredCars.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Search className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{t('home.emptyState.title')}</h3>
              <p className="text-slate-500 font-bold mb-8">{t('home.emptyState.subtitle')}</p>
              <button onClick={() => { setSearchTerm(''); handleTabChange('all'); }} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm">{t('home.emptyState.clearFilters')}</button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
              {filteredCars.map((car) => {
                const seller = users.find(u => u.id === car.sellerId);
                const showroomName = seller?.companyName || seller?.firstName ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() : 'معرض غير معروف';
                const isVerified = seller?.kycStatus === 'approved' || seller?.status === 'active';

                return (
                  <div
                    key={car.id}
                    className={`bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 group ${viewMode === 'list' ? 'flex flex-col md:flex-row h-auto' : 'flex flex-col'}`}
                  >
                    {/* Image Section with Consistent Sizing */}
                    <div className={`relative overflow-hidden bg-slate-100 shrink-0 ${viewMode === 'list' ? 'w-full h-48 md:h-auto md:w-[35%] lg:w-[35%] xl:w-[400px]' : 'w-full aspect-[16/10]'}`}>
                      <img
                        src={car.images && car.images[0] && car.images[0].length > 5 ? car.images[0] : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'}
                        alt={`${car.make} ${car.model}`}
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800' }}
                        className="w-full h-full object-cover car-card-image text-transparent"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* Status Overlay */}
                      <div className="absolute top-5 right-5 flex flex-col gap-2">
                        {car.status === 'live' && (
                          <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 shadow-xl animate-pulse">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            {t('home.carCard.liveNow')}
                          </div>
                        )}
                        <div className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg">
                          #{car.lotNumber}
                        </div>
                      </div>

                      <div className="absolute top-4 left-4 flex gap-2">
                        <button
                          title="إضافة للمفضلة"
                          aria-label="المفضلة"
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(car.id); }}
                          className={`p-2 rounded-xl transition-all shadow-lg ${watchlist.some((w: any) => w.carId === car.id) ? 'bg-rose-500 text-white' : 'bg-white/80 backdrop-blur text-slate-600 hover:text-rose-500'}`}
                        >
                          <Heart className={`w-5 h-5 ${watchlist.some((w: any) => w.carId === car.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 md:p-6 flex-1 flex flex-col justify-between min-w-0">
                      <div onClick={() => handleBidClick(car)} className="cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                              {car.year} {car.make} {car.model}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-0.5 flex items-center gap-2 tracking-widest leading-none">
                              <MapPin className="w-3 h-3" /> {car.location}
                              <span className="mx-1 text-slate-300">•</span>
                              <span className="font-bold flex items-center gap-1 text-slate-600">
                                {showroomName}
                                {isVerified ? (
                                  <span title="معرض موثق" className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" /></span>
                                ) : (
                                  <span title="معرض غير موثق" className="flex items-center"><AlertTriangle className="w-3.5 h-3.5 text-red-500" /></span>
                                )}
                              </span>
                            </p>
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                              {car.status === 'offer_market' ? t('home.carCard.lastOffer') : car.status === 'upcoming' ? t('home.carCard.startingPrice') : car.status === 'closed' ? t('home.carCard.finalSalePrice') : t('home.carCard.currentAuction')}
                            </div>
                            <div className={`text-2xl font-black font-mono mt-1 ${car.status === 'live' ? 'text-emerald-600' :
                              car.status === 'offer_market' ? 'text-purple-600' :
                                car.status === 'closed' ? 'text-slate-600' :
                                  'text-slate-900'
                              }`}>${(car.currentBid || car.startingBid || 0).toLocaleString()}
                              <div className="text-sm font-bold text-slate-400 font-mono mt-0.5">
                                {Math.round((car.currentBid || car.startingBid || 0) * (exchangeRate || 7)).toLocaleString()} د.ل
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 overflow-hidden">
                            <Droplets className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[10px] font-black text-slate-900 truncate">{car.fuelType || 'بنزين'}</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 overflow-hidden">
                            <Settings2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[10px] font-black text-slate-900 truncate">{car.transmission || 'اوتوماتيك'}</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 overflow-hidden">
                            <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[10px] font-black text-slate-900 truncate">{car.odometer?.toLocaleString() || '0'} mi</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 overflow-hidden">
                            <div className={`w-1.5 h-1.5 shrink-0 rounded-full ${car.primaryDamage && car.primaryDamage !== 'لا يوجد' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <span className="text-[10px] font-black text-slate-900 truncate">{car.primaryDamage ? `حالي: ${car.primaryDamage}` : 'سليم'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                        {viewMode === 'list' && (
                          <div className="flex-1 flex flex-wrap items-center gap-4 sm:gap-8 px-2">
                            <ListCarTimer car={car} />
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden xl:block">
                              Lot: #{car.lotNumber}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:w-auto mt-3 sm:mt-0">
                          <button
                            onClick={() => navigate(`/car-details/${car.id}`)}
                            className="flex-1 sm:w-32 py-3 bg-slate-950 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                          >
                            {t('home.carCard.details')}
                          </button>

                          {/* ── Status-aware action button ── */}
                          {car.status === 'live' && (
                            <button
                              onClick={() => handleBidClick(car)}
                              className="flex-1 sm:w-40 py-3 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 animate-pulse"
                            >
                              <Gavel className="w-4 h-4" />
                              {t('home.carCard.bidNow')}
                            </button>
                          )}

                          {car.status === 'offer_market' && (
                            <button
                              onClick={() => navigate(`/car-details/${car.id}`)}
                              className="flex-1 sm:w-40 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs hover:bg-purple-700 transition-all active:scale-95 shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2"
                            >
                              <Handshake className="w-4 h-4" />
                              {t('home.carCard.makeOffer')}
                            </button>
                          )}

                          {car.status === 'closed' && (
                            <div className="flex-1 sm:w-40 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs border border-slate-200 flex items-center justify-center gap-2 cursor-default">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              {t('home.carCard.sold')}
                            </div>
                          )}

                          {(car.status === 'upcoming' || car.status === 'pending_approval') && (
                            <button
                              onClick={() => navigate(`/car-details/${car.id}`)}
                              className="flex-1 sm:w-40 py-3 bg-orange-500 text-white rounded-2xl font-black text-xs hover:bg-orange-600 transition-all active:scale-95 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                            >
                              <Gavel className="w-4 h-4" />
                              {t('home.carCard.preBid')}
                            </button>
                          )}

                          {car.status !== 'live' && car.status !== 'offer_market' && car.status !== 'upcoming' && car.status !== 'pending_approval' && car.status !== 'closed' && (
                            <button
                              onClick={() => navigate(`/car-details/${car.id}`)}
                              className="flex-1 sm:w-40 py-3 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-300 transition-all active:scale-95"
                            >
                              {t('home.carCard.viewDetails')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        {
          currentUser && (
            <aside className="w-full lg:w-80 flex flex-col gap-6 sticky top-40">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8">
                <div className="flex items-center justify-between mb-8 text-right">
                  <h3 className="font-black text-slate-900">{t('home.rightSidebar.bidsStatus')}</h3>
                  <Settings className="w-4 h-4 text-slate-300 cursor-pointer hover:text-orange-500" />
                </div>

                <div className="space-y-6">
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 mb-0.5 leading-none">{t('home.rightSidebar.buyingPower')}</div>
                        <div className="text-lg font-black text-slate-900 font-mono leading-none">${currentUser.buyingPower?.toLocaleString()}</div>
                      </div>
                    </div>
                    <button title="إضافة رصيد" aria-label="إضافة رصيد إلى القوة الشرائية" onClick={() => navigate('/dashboard/user?view=wallet')} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-emerald-500 transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 text-right">{t('home.rightSidebar.activeAuctions')} (2)</h4>
                    <div className="space-y-3">
                      {[
                        { make: 'BMW', model: 'X5', bid: 15400, leading: true },
                        { make: 'Lexus', model: 'ES350', bid: 9200, leading: false },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.leading ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                            <div>
                              <div className="text-xs font-black text-slate-900 leading-none mb-1">{item.make} {item.model}</div>
                              <div className="text-[9px] font-bold text-slate-400 leading-none">${item.bid.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${item.leading ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {item.leading ? t('home.rightSidebar.youAreWinning') : t('home.rightSidebar.outbid')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate('/dashboard/user?view=bids')} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
                  {t('home.rightSidebar.viewAllBids')}
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>

              <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-500/20 text-right">
                <h3 className="text-xl font-black mb-2">{t('home.rightSidebar.needHelp')}</h3>
                <p className="text-orange-100 text-xs font-bold mb-6">{t('home.rightSidebar.supportTeam')}</p>
                <button className="w-full bg-white text-orange-600 py-3 rounded-2xl font-black text-xs hover:bg-orange-50 transition-all active:scale-95">{t('home.rightSidebar.talkToAgent')}</button>
              </div>
            </aside>
          )
        }
      </div>
    </div>
  );
};
