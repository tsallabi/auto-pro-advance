import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Store, Plus, TrendingUp, Package, RefreshCw, Car, DollarSign,
  Activity, Gavel, Handshake, FileText, Truck, MessageSquare,
  CreditCard, UploadCloud, Target, CheckCircle2, Clock, X, Info,
  LineChart as LineChartIcon, Send
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../context/StoreContext';
import { IbanUpdateCard, KycUploadCard } from '../components/SellerKycComponents';

export const SellerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'overview';
  const { currentUser, showAlert, cars } = useStore();

  const [offerMarketCars, setOfferMarketCars] = useState<any[]>([]);
  const [sellerCars, setSellerCars] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);

  // ✅ PHASE 4: Real Seller Wallet State
  const [wallet, setWallet] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawIban, setWithdrawIban] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [stats, setStats] = useState({
    totalSales: 145000,
    activeCars: 12,
    pendingPayments: 34500,
    availableBalance: 12500
  });

  // Modal States
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [carImages, setCarImages] = useState<{ file?: File; preview: string; uploaded?: boolean; serverUrl?: string }[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [newCarStep, setNewCarStep] = useState(1);
  const [newCar, setNewCar] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    mileage: '',
    mileageUnit: 'mi',
    engineSize: '',
    horsepower: '',
    transmission: 'automatic',
    drivetrain: 'FWD',
    fuelType: 'gasoline',
    exteriorColor: '',
    interiorColor: '',
    primaryDamage: '',
    secondaryDamage: '',
    titleType: 'Clean',
    keys: 'yes',
    runsDrives: 'yes',
    location: '',
    startingPrice: 0,
    reservePrice: 0,
    minOfferPercent: 85,
    buyItNowPrice: 0,
    notes: '',
  });

  const updateNewCar = (field: string, value: any) => {
    setNewCar(prev => ({ ...prev, [field]: value }));
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = 20 - carImages.length;
    const selectedFiles = Array.from(files).slice(0, remaining);

    // Show local previews immediately for UX
    const previews = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      serverUrl: ''
    }));
    setCarImages(prev => [...prev, ...previews]);

    // Upload to server
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('images', file));

      const res = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      // Replace local previews with server URLs
      setCarImages(prev => {
        const updated = [...prev];
        // The last `selectedFiles.length` items are the ones we just added
        const startIdx = updated.length - selectedFiles.length;
        data.urls.forEach((url: string, i: number) => {
          if (updated[startIdx + i]) {
            URL.revokeObjectURL(updated[startIdx + i].preview);
            updated[startIdx + i] = {
              ...updated[startIdx + i],
              preview: url,
              uploaded: true,
              serverUrl: url
            };
          }
        });
        return updated;
      });
      setUploadProgress(100);
      showAlert(`✅ تم رفع ${data.count} صورة بنجاح على الخادم`, 'success');
    } catch (err) {
      showAlert('فشل رفع الصور. يرجى المحاولة مجدداً.', 'error');
      // Remove the failed previews
      setCarImages(prev => prev.filter(img => img.uploaded !== false || img.file === undefined));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setCarImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  useEffect(() => {
    // Fetch seller's specific cars
    const filteredCars = cars.filter(c => c.sellerId === currentUser?.id || true); // Default true for demo
    setSellerCars(filteredCars);

    if (view === 'offer_market') {
      fetch(`/api/admin/offer-market-cars?userId=${currentUser?.id}&userRole=${currentUser?.role}`)
        .then(res => res.json())
        .then(data => setOfferMarketCars(Array.isArray(data) ? data : []))
        .catch(err => console.error('Failed to fetch offer market cars:', err));
    }

    if (view === 'logistics') {
      fetch(`/api/shipments/seller/${currentUser?.id}`)
        .then(res => res.json())
        .then(setShipments)
        .catch(err => console.error('Failed to fetch seller shipments:', err));
    }

    // ✅ PHASE 4: Fetch real seller wallet data
    if (view === 'financials' && currentUser?.id) {
      fetch(`/api/seller/wallet/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          setWallet(data);
          setWithdrawIban(data.iban || '');
          setStats(prev => ({
            ...prev,
            availableBalance: data.availableBalance || 0,
            pendingPayments: data.pendingBalance || 0,
            totalSales: data.totalEarned || 0,
            activeCars: data.totalSoldCars || 0
          }));
        })
        .catch(err => console.error('Failed to fetch wallet:', err));

      fetch(`/api/seller/transactions/${currentUser.id}`)
        .then(res => res.json())
        .then(data => setLedger(Array.isArray(data) ? data : []))
        .catch(err => console.error('Failed to fetch ledger:', err));
    }
  }, [view, currentUser, cars]);

  // ✅ PHASE 4: Handle withdrawal request
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 100) {
      showAlert('الحد الأدنى للسحب هو $100', 'error');
      return;
    }
    if (!withdrawIban) {
      showAlert('يرجى إدخال رقم الـ IBAN', 'error');
      return;
    }
    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/seller/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: currentUser?.id,
          amount,
          iban: withdrawIban,
          bankName: withdrawBank
        })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert(data.message || 'تم إرسال طلب السحب!', 'success');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        // Refresh wallet
        fetch(`/api/seller/wallet/${currentUser?.id}`)
          .then(r => r.json())
          .then(setWallet);
      } else {
        showAlert(data.error || 'فشل طلب السحب', 'error');
      }
    } catch {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };


  const handleCreateCar = async () => {
    if (!newCar.make || !newCar.model || !newCar.vin) {
      showAlert('يرجى ملء البيانات الأساسية (الشركة، الموديل، VIN)', 'error');
      return;
    }
    if (!newCar.reservePrice || newCar.reservePrice <= 0) {
      showAlert('يرجى تحديد السعر الاحتياطي', 'error');
      return;
    }

    try {
      // Use already-uploaded server URLs (from handleImageUpload)
      const uploadedUrls = carImages
        .filter(img => img.serverUrl)
        .map(img => img.serverUrl);

      // If some images weren't uploaded yet (edge case), upload them now
      const pendingFiles = carImages.filter(img => !img.serverUrl && img.file);
      let allUrls = [...uploadedUrls];

      if (pendingFiles.length > 0) {
        const formData = new FormData();
        pendingFiles.forEach(img => {
          if (img.file) formData.append('images', img.file);
        });
        const uploadRes = await fetch('/api/upload/images', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          allUrls = [...allUrls, ...uploadData.urls];
        }
      }

      const carData = {
        ...newCar,
        sellerId: currentUser?.id,
        images: allUrls,   // ✅ Real server paths, not Object URLs
        status: 'pending_approval',
        lotNumber: `LT-${Math.floor(100000 + Math.random() * 900000)}`,
        currentBid: 0,
        auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save car');
      }

      showAlert(`تم إضافة السيارة بنجاح، بانتظار موافقة الإدارة!`, 'success');
      setShowAddCarModal(false);
      setNewCarStep(1);

      // Cleanup image previews
      carImages.forEach(img => URL.revokeObjectURL(img.preview));
      setCarImages([]);

      setNewCar({
        vin: '', make: '', model: '', year: new Date().getFullYear(), trim: '',
        mileage: '', mileageUnit: 'mi', engineSize: '', horsepower: '',
        transmission: 'automatic', drivetrain: 'FWD', fuelType: 'gasoline',
        exteriorColor: '', interiorColor: '', primaryDamage: '', secondaryDamage: '',
        titleType: 'Clean', keys: 'yes', runsDrives: 'yes', location: '',
        startingPrice: 0, reservePrice: 0, minOfferPercent: 85, buyItNowPrice: 0, notes: '',
      });

      // Refresh seller cars
      fetch(`/api/cars?sellerId=${currentUser?.id}`)
        .then(res => res.json())
        .then(data => setSellerCars(Array.isArray(data) ? data : []));

    } catch (err: any) {
      showAlert(err.message || 'حدث خطأ أثناء حفظ السيارة', 'error');
    }
  };

  const handleAcceptOffer = async (carId: string) => {
    try {
      const res = await fetch(`/api/offers/${carId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, userRole: currentUser?.role })
      });
      if (res.ok) {
        showAlert('تم قبول العرض والبيع بنجاح! تم إصدار فاتورة للمشتري.', 'success');
        setOfferMarketCars(prev => prev.filter(c => c.id !== carId));
      } else {
        showAlert('فشل قبول العرض. يرجى المحاولة لاحقاً', 'error');
      }
    } catch (e) {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleRejectOffer = async (carId: string) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا العرض؟ سيتم حذف العرض الحالي.')) return;
    try {
      const res = await fetch(`/api/offers/${carId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, userRole: currentUser?.role })
      });
      if (res.ok) {
        showAlert('تم رفض العرض بنجاح.', 'info');
        fetch(`/api/admin/offer-market-cars?userId=${currentUser?.id}&userRole=${currentUser?.role}`)
          .then(res => res.json())
          .then(data => setOfferMarketCars(Array.isArray(data) ? data : []));
      } else {
        showAlert('فشل رفض العرض.', 'error');
      }
    } catch (e) {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'inventory':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">مخزون السيارات (Inventory)</h2>
                <p className="text-slate-500 text-sm mt-1">إدارة سياراتك، إضافة مخزون جديد، ومتابعة حالات القبول والمزاد.</p>
              </div>
              <button
                onClick={() => setShowAddCarModal(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-1"
              >
                <Plus className="w-5 h-5" />
                إضافة سيارة جديدة
              </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex gap-2 overflow-x-auto bg-slate-50/50">
                <button className="px-4 py-2 bg-white text-slate-900 font-bold text-sm rounded-xl border border-slate-200 shadow-sm">الكل</button>
                <button className="px-4 py-2 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-100">بانتظار الموافقة</button>
                <button className="px-4 py-2 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-100 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> في المزاد
                </button>
                <button className="px-4 py-2 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-100">مُباعة</button>
                <button className="px-4 py-2 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-100">لم تُباع (Unsold)</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-white text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-6 font-black">السيارة</th>
                      <th className="p-6 font-black">رقم الحساب (VIN)</th>
                      <th className="p-6 font-black">السعر المطلوب (Reserve)</th>
                      <th className="p-6 font-black">الحالة الفنية</th>
                      <th className="p-6 font-black">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sellerCars.slice(0, 5).map((car, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                              {car.images?.[0] ? <img src={car.images[0]} alt="صورة" className="w-full h-full object-cover" /> : <Car className="w-full h-full p-3 text-slate-300" />}
                            </div>
                            <div>
                              <div className="font-black text-slate-900">{car.year} {car.make} {car.model}</div>
                              <div className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                                <Target className="w-3 h-3" /> Lot: {car.lotNumber || `LT-${1000 + idx}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 font-mono text-sm font-bold text-slate-500">{car.vin || '1XP4A39X...'}</td>
                        <td className="p-6 font-black text-emerald-600">${car.buyItNow || car.currentBid || 15000}</td>
                        <td className="p-6">
                          {idx === 0 ? (
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black">بانتظار الموافقة</span>
                          ) : idx === 1 ? (
                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-black flex items-center w-fit gap-1 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> مزاد حي</span>
                          ) : (
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black">متاحة</span>
                          )}
                        </td>
                        <td className="p-6">
                          <button className="text-sm font-bold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">تفاصيل</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'live_auctions':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  شاشة المراقبة الحية (Live Monitor)
                </h2>
                <p className="text-slate-500 text-sm mt-1">راقب سياراتك التي تباع الآن في المزاد المباشر لحظة بلحظة.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Auction Card */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Live Now
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">الوقت المتبقي</div>
                      <div className="text-3xl font-black text-white font-mono">00:15<span className="text-red-500 animate-pulse">.4</span></div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black mb-2">2023 Mercedes-Benz S-Class</h3>
                  <p className="text-slate-400 text-sm font-mono mb-8">VIN: WDD223... • Lot: MT-2938</p>

                  <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">أعلى مزايدة حالية</div>
                        <div className="text-4xl font-black text-emerald-400 font-mono">$84,500</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">سعرك المطلوب</div>
                        <div className="text-lg font-black text-slate-300 font-mono line-through opacity-50">$82,000</div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-3 mb-2 overflow-hidden border border-slate-700">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full w-[100%] shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                    </div>
                    <div className="text-xs text-emerald-400 font-bold text-center">تم تجاوز السعر المطلوب - السيارة بيعت! 🎉</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'offer_market':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">سوق العروض (Make Offer)</h2>
                <p className="text-slate-500 text-sm mt-1">راجع العروض المقدمة من المشترين للسيارات التي لم تصل للسعر المطلوب في المزاد.</p>
              </div>
              <button
                onClick={() => {
                  fetch(`/api/admin/offer-market-cars?userId=${currentUser?.id}&userRole=${currentUser?.role}`)
                    .then(res => res.json())
                    .then(data => setOfferMarketCars(Array.isArray(data) ? data : []));
                }}
                className="bg-white text-slate-500 border border-slate-200 px-4 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                تحديث
              </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="p-6 font-black">السيارة</th>
                      <th className="p-6 font-black">تسعيرك (الاحتياطي)</th>
                      <th className="p-6 font-black">أعلى عرض متوفر</th>
                      <th className="p-6 font-black">الوقت المتبقي للعرض</th>
                      <th className="p-6 font-black text-center">الإجراءات (القرار)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {offerMarketCars.length > 0 ? offerMarketCars.map(car => (
                      <tr key={car.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <img src={car.images?.[0] || ''} alt="صورة" className="w-16 h-12 rounded-lg object-cover border border-slate-200" />
                            <div>
                              <div className="font-black text-slate-900">{car.year} {car.make} {car.model}</div>
                              <div className="text-xs text-slate-400 font-bold mt-1">ID: {car.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 font-black text-slate-400 line-through decoration-red-500/50 decoration-2">${(car.reservePrice || 0).toLocaleString()}</td>
                        <td className="p-6">
                          <div className="font-black text-xl text-emerald-600">${(car.currentBid || 0).toLocaleString()}</div>
                          <div className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">أعلى عرض مقدّم</div>
                        </td>
                        <td className="p-6 text-sm text-amber-600 font-bold flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {car.offerMarketEndTime ? new Date(car.offerMarketEndTime).toLocaleString('ar-EG') : 'تنتهي قريباً'}
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleAcceptOffer(car.id)}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                            >
                              قبول البيع
                            </button>
                            <button
                              onClick={() => showAlert('ميزة العرض المضاد ستتوفر قريباً', 'info')}
                              className="px-3 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-xs font-black hover:bg-orange-100 transition-colors"
                            >
                              إرسال عرض مضاد
                            </button>
                            <button
                              onClick={() => handleRejectOffer(car.id)}
                              className="px-3 py-2 bg-white text-rose-500 border border-rose-100 rounded-xl text-xs font-black hover:bg-rose-50 transition-colors"
                            >
                              رفض نهائي
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Handshake className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                          <h3 className="text-xl font-black text-slate-400">سوق العروض فارغ حالياً</h3>
                          <p className="text-sm text-slate-400 mt-2">السيارات التي لا تباع في المزاد ستظهر هنا لمدة 48 ساعة</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'financials':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">المحفظة والحسابات (Ledger)</h2>
                <p className="text-slate-500 text-sm mt-1">
                  كشف حساب مفصّل، الأرباح المتاحة للسحب، والعمولات المخصومة.
                  {wallet && <span className="text-slate-400"> | عمولة المنصة: {wallet.commissionRate}%</span>}
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={!wallet || wallet.availableBalance < 100}
                className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5" />
                طلب سحب رصيد
              </button>
            </div>

            {/* Live Wallet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="md:col-span-2 bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">الرصيد المتاح للسحب</div>
                  <div className="text-5xl font-black text-emerald-400 font-mono">
                    ${(wallet?.availableBalance ?? stats.availableBalance).toLocaleString()}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    بعد خصم عمولات المنصة
                  </div>
                  {wallet && (
                    <div className="mt-2 text-xs text-slate-500">
                      إجمالي المسحوب: <span className="font-mono text-slate-400">${wallet.totalWithdrawn.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-xl -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">أرصدة معلقة</div>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    ${(wallet?.pendingBalance ?? stats.pendingPayments).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-500 font-bold mt-1">قيد التسوية مع المشترين</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-xl -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">إجمالي الأرباح</div>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    ${(wallet?.totalEarned ?? stats.totalSales).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-blue-500 font-bold mt-1">{wallet?.totalSoldCars ?? 0} سيارة مُباعة</div>
                </div>
              </div>
            </div>

            {/* Real Transaction Ledger */}
            <div className="bg-white rounded-[2rem] text-slate-800 border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-lg">كشف الحساب التفصيلي (Ledger)</h3>
                <span className="text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-full">{ledger.length} معاملة</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4 font-black">رقم العملية</th>
                      <th className="p-4 font-black">التفاصيل</th>
                      <th className="p-4 font-black">سعر البيع</th>
                      <th className="p-4 font-black text-rose-500">عمولة المنصة</th>
                      <th className="p-4 font-black text-emerald-600">الصافي لك</th>
                      <th className="p-4 font-black">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ledger.length > 0 ? ledger.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-sm text-slate-500">{tx.id.slice(0, 10)}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800 text-sm">{tx.description}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(tx.timestamp).toLocaleDateString('ar-EG')}
                            {tx.lotNumber && ` • Lot: ${tx.lotNumber}`}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold">
                          {tx.type === 'withdrawal' ? '—' : `$${(tx.amount || 0).toLocaleString()}`}
                        </td>
                        <td className="p-4 font-mono font-bold text-rose-500">
                          {tx.commission > 0 ? `-$${tx.commission.toLocaleString()}` : '—'}
                        </td>
                        <td className={`p-4 font-mono font-black ${tx.type === 'withdrawal' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {tx.type === 'withdrawal'
                            ? `-$${(tx.netAmount || 0).toLocaleString()}`
                            : `$${(tx.netAmount || 0).toLocaleString()}`}
                        </td>
                        <td className="p-4">
                          {tx.status === 'available' && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">جاهز للسحب ✅</span>}
                          {tx.status === 'pending' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">معلق ⏳</span>}
                          {tx.status === 'completed' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">مكتمل ✓</span>}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 font-bold italic">
                          لا توجد معاملات بعد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">طلب سحب رصيد</h3>
                  <p className="text-slate-500 text-sm mb-6">سيتم مراجعة الطلب خلال 1-3 أيام عمل</p>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6">
                    <div className="text-xs text-emerald-600 font-bold uppercase mb-1">الرصيد المتاح</div>
                    <div className="text-3xl font-black text-emerald-600 font-mono">
                      ${(wallet?.availableBalance || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">مبلغ السحب (USD) *</label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        min={100}
                        max={wallet?.availableBalance || 0}
                        step={100}
                        placeholder="الحد الأدنى $100"
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-xl focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">رقم الـ IBAN *</label>
                      <input
                        type="text"
                        value={withdrawIban}
                        onChange={e => setWithdrawIban(e.target.value)}
                        placeholder="LY00 0000 0000 0000 0000 00"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">اسم البنك</label>
                      <input
                        type="text"
                        value={withdrawBank}
                        onChange={e => setWithdrawBank(e.target.value)}
                        placeholder="مثال: مصرف الجمهورية"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleWithdraw}
                      disabled={isWithdrawing}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                      {isWithdrawing ? 'جاري الإرسال...' : '💳 إرسال طلب السحب'}
                    </button>
                    <button
                      onClick={() => setShowWithdrawModal(false)}
                      className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'logistics':

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8 text-right" dir="rtl">
              <div>
                <h2 className="text-3xl font-black text-slate-800">اللوجستيات والتسليم 🚚</h2>
                <p className="text-slate-500 text-sm mt-1">تتبع السيارات المباعة، ارفع أوراق الشحن (Title)، وسلّم السيارات للمشتري.</p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden" dir="rtl">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">السيارة / رقم اللوت</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">المشتري</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {shipments.map((ship: any) => (
                    <tr key={ship.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {ship.images?.[0] ? (
                            <img src={ship.images[0]} className="w-12 h-12 rounded-xl object-cover" alt="صورة" />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                              <Car className="w-6 h-6 text-slate-300" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{ship.year} {ship.make} {ship.model}</div>
                            <div className="text-[10px] font-black text-slate-400">LOT: #{ship.lotNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-700">{ship.firstName} {ship.lastName}</div>
                        <div className="text-[10px] text-slate-400">{ship.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ship.status === 'delivered' ? 'bg-green-100 text-green-600' :
                          ship.status === 'shipping_requested' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                          {ship.status === 'shipping_requested' ? 'طلب شحن 🚚' : ship.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-700 font-black text-xs flex items-center gap-1">
                          <UploadCloud className="w-4 h-4" /> رفع المستندات (Title)
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shipments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic font-bold">
                        لا توجد سيارات بانتظار التسليم حالياً
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">مركز المراسلات</h2>
                <p className="text-slate-500 text-sm mt-1">تواصل مباشرة مع إدارة اوتو برو بخصوص الموافقات، المدفوعات واللوجستيات.</p>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-12 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-orange-500" />
              </div>
              <p className="text-lg font-black text-slate-800 mb-2">صندوق الوارد فارغ</p>
              <p className="text-sm text-slate-500">سيتم عرض جميع الإشعارات والرسائل المتبادلة مع الإدارة هنا.</p>
            </div>
          </div>
        );

      case 'market_insights':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">رؤى السوق (Market Insights)</h2>
                <p className="text-slate-500 text-sm mt-1">حلل أسعار السوق للسيارات المشابهة لسياراتك قبل تسعيرها.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                <LineChartIcon className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">متوسط أسعار تويوتا كامري 2021</h3>
                <p className="text-2xl font-black text-emerald-600 mt-2">$13,500 - $15,200</p>
                <p className="text-xs text-slate-400 mt-2">بناءً على 14 مزاد في آخر 30 يوم</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                <LineChartIcon className="w-12 h-12 text-teal-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">متوسط أسعار هيونداي النترا 2022</h3>
                <p className="text-2xl font-black text-emerald-600 mt-2">$11,000 - $12,800</p>
                <p className="text-xs text-slate-400 mt-2">بناءً على 8 مزادات في آخر شهرين</p>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-800">الملف الشخصي والتوثيق (KYC)</h2>
              <p className="text-slate-500 text-sm mt-1">حدّث بياناتك الشخصية وارفع وثائق التوثيق لتفعيل سحب الأرباح.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seller Info Card */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
                <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                  بيانات البائع
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-slate-50">
                    <span className="text-slate-500 text-sm font-bold">الاسم</span>
                    <span className="font-black text-slate-800">{currentUser?.firstName} {currentUser?.lastName}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-50">
                    <span className="text-slate-500 text-sm font-bold">البريد الإلكتروني</span>
                    <span className="font-mono text-slate-700 text-sm">{currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-50">
                    <span className="text-slate-500 text-sm font-bold">الهاتف</span>
                    <span className="font-mono text-slate-700 text-sm">{currentUser?.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-50">
                    <span className="text-slate-500 text-sm font-bold">نسبة العمولة</span>
                    <span className="font-black text-orange-500">{currentUser?.commission || 2}%</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-500 text-sm font-bold">حالة التوثيق</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${currentUser?.kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      currentUser?.kycStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {currentUser?.kycStatus === 'approved' ? '✅ موثّق' :
                        currentUser?.kycStatus === 'rejected' ? '❌ مرفوض' : '⏳ قيد المراجعة'}
                    </span>
                  </div>
                </div>
              </div>

              {/* IBAN Update Card */}
              <IbanUpdateCard currentUser={currentUser} showAlert={showAlert} />
            </div>

            {/* KYC Document Upload */}
            <KycUploadCard currentUser={currentUser} showAlert={showAlert} />
          </div>
        );

      default:

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">الرئيسية (Seller Dashboard)</h2>
                <p className="text-slate-500 text-sm mt-1">مرحباً بك في وكالتك الافتراضية، تابع مبيعاتك وأرباحك.</p>
              </div>
              <button
                onClick={() => setShowAddCarModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1"
              >
                <Plus className="w-5 h-5" />
                إضافة سيارة للمزاد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:border-slate-200 transition-all group">
                <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Store className="w-7 h-7" />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">المخزون المعروض</div>
                <div className="text-3xl font-black text-slate-900">{stats.activeCars}</div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:border-slate-200 transition-all group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">صافي الأرباح</div>
                <div className="text-3xl font-black text-emerald-600 font-mono">${stats.availableBalance.toLocaleString()}</div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:border-slate-200 transition-all group">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Gavel className="w-7 h-7" />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">مزايدات نشطة اليوم</div>
                <div className="text-3xl font-black text-amber-600">24</div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:border-slate-200 transition-all group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Truck className="w-7 h-7" />
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">بانتظار الشحن/التسليم</div>
                <div className="text-3xl font-black text-blue-600">3</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-50 p-6">
                <h3 className="font-black text-lg text-slate-800 mb-6">أداء المبيعات (هذا الشهر)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{ n: 'أسبوع 1', v: 20000 }, { n: 'أسبوع 2', v: 15000 }, { n: 'أسبوع 3', v: 35000 }, { n: 'أسبوع 4', v: 28000 }]}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-6">
                <h3 className="font-black text-lg text-slate-800 mb-6">النشاط الأخير</h3>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">تم بيع سيارة كامري 2021</p>
                      <p className="text-xs text-slate-500 mt-1">منذ 2 ساعة • تمت الموافقة</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                      <Gavel className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">مزايدة جديدة ($14,500)</p>
                      <p className="text-xs text-slate-500 mt-1">منذ 5 ساعات • على Lot: 49281</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">رسالة إدارية جديدة</p>
                      <p className="text-xs text-slate-500 mt-1">منذ يوم • بخصوص الدفع المسبق</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', icon: Store, label: 'الرئيسية' },
          { id: 'inventory', icon: Car, label: 'مخزون السيارات' },
          { id: 'live_auctions', icon: Activity, label: 'شاشة المزادات الحية' },
          { id: 'offer_market', icon: Handshake, label: 'سوق العروض' },
          { id: 'financials', icon: DollarSign, label: 'الحسابات (Ledger)' },
          { id: 'logistics', icon: Truck, label: 'الشحن والتسليم' },
          { id: 'messages', icon: MessageSquare, label: 'صندوق البريد' },
          { id: 'market_insights', icon: LineChartIcon, label: 'رؤى السوق' },
          { id: 'profile', icon: CreditCard, label: 'الملف الشخصي / KYC' }

        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ view: tab.id })}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${view === tab.id
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
              : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-slate-200'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'logistics' && shipments.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse transition-all">
                {shipments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {renderContent()}

      {/* Add Car Wizard Modal */}
      {showAddCarModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-start justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl p-10 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                إدراج سيارة جديدة للمزاد
              </h3>
              <button aria-label="زر" title="زر" onClick={() => setShowAddCarModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stepper */}
            <div className="flex gap-2 mb-2">
              {[
                { step: 1, label: 'البيانات الأساسية' },
                { step: 2, label: 'الصور والحالة' },
                { step: 3, label: 'التسعير والموقع' }
              ].map(s => (
                <div key={s.step} className="flex-1 text-center">
                  <div className={`h-2 rounded-full transition-colors mb-1 ${newCarStep >= s.step ? 'bg-orange-500' : 'bg-slate-100'}`}></div>
                  <span className={`text-[10px] font-bold ${newCarStep >= s.step ? 'text-orange-600' : 'text-slate-300'}`}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* ============ STEP 1: Basic Info ============ */}
            {newCarStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 mt-6">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-bold flex items-start gap-3">
                  <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>أدخل رقم الشاصي (VIN) والبيانات الأساسية للسيارة: الشركة، الموديل، السنة، المسافة المقطوعة، والمحرك.</p>
                </div>

                {/* VIN */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">رقم الشاصي (VIN) *</label>
                  <input type="text" value={newCar.vin} onChange={e => updateNewCar('vin', e.target.value.toUpperCase())} maxLength={17} placeholder="مثال: 1HGBH41JXMN109186" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono uppercase focus:border-orange-500 outline-none text-lg tracking-wider" />
                </div>

                {/* Make / Model / Year / Trim */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الشركة (Make) *</label>
                    <input type="text" value={newCar.make} onChange={e => updateNewCar('make', e.target.value)} placeholder="Toyota" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الموديل (Model) *</label>
                    <input type="text" value={newCar.model} onChange={e => updateNewCar('model', e.target.value)} placeholder="Camry" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">السنة (Year) *</label>
                    <input aria-label="مدخل" title="مدخل" placeholder="تحديد" type="number" value={newCar.year} onChange={e => updateNewCar('year', parseInt(e.target.value))} min={1990} max={2027} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الفئة (Trim)</label>
                    <input type="text" value={newCar.trim} onChange={e => updateNewCar('trim', e.target.value)} placeholder="SE, Limited, Sport..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                  </div>
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">المسافة المقطوعة (Odometer) *</label>
                  <div className="flex gap-2">
                    <input type="number" value={newCar.mileage} onChange={e => updateNewCar('mileage', e.target.value)} placeholder="45000" className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-mono text-lg" />
                    <select aria-label="تحديد" title="تحديد" value={newCar.mileageUnit} onChange={e => updateNewCar('mileageUnit', e.target.value)} className="bg-slate-50 border border-slate-200 px-4 rounded-xl font-bold text-sm focus:border-orange-500 outline-none">
                      <option value="mi">ميل (MI)</option>
                      <option value="km">كيلومتر (KM)</option>
                    </select>
                  </div>
                </div>

                {/* Engine / HP / Transmission / Drivetrain / Fuel */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">سعة المحرك (Engine)</label>
                    <input type="text" value={newCar.engineSize} onChange={e => updateNewCar('engineSize', e.target.value)} placeholder="2.5L, 3.5L V6..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">قوة المحرك (HP)</label>
                    <input type="number" value={newCar.horsepower} onChange={e => updateNewCar('horsepower', e.target.value)} placeholder="203" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ناقل الحركة</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.transmission} onChange={e => updateNewCar('transmission', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-bold">
                      <option value="automatic">أوتوماتيك (Automatic)</option>
                      <option value="manual">عادي (Manual)</option>
                      <option value="cvt">CVT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">نظام الدفع (Drivetrain)</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.drivetrain} onChange={e => updateNewCar('drivetrain', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-bold">
                      <option value="FWD">أمامي (FWD)</option>
                      <option value="RWD">خلفي (RWD)</option>
                      <option value="AWD">رباعي (AWD)</option>
                      <option value="4WD">دفع رباعي (4WD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">نوع الوقود (Fuel)</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.fuelType} onChange={e => updateNewCar('fuelType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-bold">
                      <option value="gasoline">بنزين (Gasoline)</option>
                      <option value="diesel">ديزل (Diesel)</option>
                      <option value="electric">كهربائي (Electric)</option>
                      <option value="hybrid">هايبرد (Hybrid)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-6 mt-4 border-t border-slate-50">
                  <button onClick={() => setNewCarStep(2)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black hover:bg-slate-800 transition-colors">التالي: صور وحالة السيارة ←</button>
                </div>
              </div>
            )}

            {/* ============ STEP 2: Photos & Condition ============ */}
            {newCarStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 mt-6">
                {/* Photo Upload */}
                <input aria-label="مدخل" title="مدخل" placeholder="تحديد"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={e => handleImageUpload(e.target.files)}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-orange-400', 'bg-orange-50'); }}
                  onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50'); }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-orange-400', 'bg-orange-50'); handleImageUpload(e.dataTransfer.files); }}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-orange-300 transition-colors cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-slate-800 text-lg mb-1">رفع صور السيارة</h4>
                  <p className="text-sm text-slate-400">اسحب الصور وأفلتها هنا، أو اضغط للاستعراض</p>
                  <div className="mt-4 text-xs font-bold text-slate-300 bg-slate-50 px-3 py-1 rounded-full">تم رفع {carImages.length} / 20 صورة • JPG, PNG, WebP</div>
                </div>

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-bold text-orange-700 mb-1">
                        <span>جاري رفع الصور على الخادم...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-orange-500 rounded-full transition-all duration-300"
                          ref={(el) => { if (el) el.style.width = `${uploadProgress || 60}%`; }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Preview Grid */}
                {carImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-3">
                    {carImages.map((img, idx) => (
                      <div key={idx} className="relative group/img aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={img.preview} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                        {/* Upload status overlay */}
                        {!img.serverUrl && (
                          <div className="absolute inset-0 bg-orange-500/40 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {img.serverUrl && (
                          <div className="absolute top-1 left-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px] font-black">✓</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-xs font-bold shadow-lg hover:bg-red-600"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 inset-x-0 bg-orange-500 text-white text-[9px] font-bold text-center py-0.5">الصورة الرئيسية</div>
                        )}
                      </div>
                    ))}
                    {carImages.length < 20 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      >
                        <Plus className="w-6 h-6 text-slate-300" />
                        <span className="text-[10px] text-slate-300 font-bold mt-1">إضافة</span>
                      </div>
                    )}
                  </div>
                )}


                {/* Condition Fields */}
                <h4 className="font-black text-slate-700 text-sm border-b border-slate-100 pb-2">حالة السيارة والضرر</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الضرر الأساسي (Primary Damage)</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.primaryDamage} onChange={e => updateNewCar('primaryDamage', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-bold">
                      <option value="">-- اختر --</option>
                      <option value="Front End">أمامي (Front End)</option>
                      <option value="Rear End">خلفي (Rear End)</option>
                      <option value="Side">جانبي (Side)</option>
                      <option value="Rollover">انقلاب (Rollover)</option>
                      <option value="Hail">بَرَد (Hail)</option>
                      <option value="Flood">غمر مياه (Flood)</option>
                      <option value="Mechanical">ميكانيكي (Mechanical)</option>
                      <option value="Minor Dents">خدوش طفيفة (Minor Dents)</option>
                      <option value="None">لا يوجد ضرر (None)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ضرر ثانوي (Secondary)</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.secondaryDamage} onChange={e => updateNewCar('secondaryDamage', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-bold">
                      <option value="">-- لا يوجد --</option>
                      <option value="Front End">أمامي</option>
                      <option value="Rear End">خلفي</option>
                      <option value="Side">جانبي</option>
                      <option value="Undercarriage">أسفل السيارة</option>
                      <option value="Minor Dents">خدوش طفيفة</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">نوع اللقب (Title Type)</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.titleType} onChange={e => updateNewCar('titleType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-bold">
                      <option value="Clean">نظيف (Clean Title)</option>
                      <option value="Salvage">سالفج (Salvage)</option>
                      <option value="Rebuilt">معاد البناء (Rebuilt)</option>
                      <option value="Certificate of Destruction">شهادة إتلاف</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">المفاتيح (Keys)</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.keys} onChange={e => updateNewCar('keys', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-bold">
                      <option value="yes">✅ نعم - متوفرة</option>
                      <option value="no">❌ لا - غير متوفرة</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">تعمل وتسير؟</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.runsDrives} onChange={e => updateNewCar('runsDrives', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none font-bold">
                      <option value="yes">✅ نعم</option>
                      <option value="no">❌ لا</option>
                      <option value="unknown">❓ غير معروف</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">اللون الخارجي</label>
                    <input type="text" value={newCar.exteriorColor} onChange={e => updateNewCar('exteriorColor', e.target.value)} placeholder="أسود، أبيض، فضي..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">اللون الداخلي</label>
                    <input type="text" value={newCar.interiorColor} onChange={e => updateNewCar('interiorColor', e.target.value)} placeholder="جلد بيج، قماش رمادي..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                  </div>
                </div>

                <div className="flex justify-between pt-6 mt-4 border-t border-slate-50">
                  <button onClick={() => setNewCarStep(1)} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-black hover:bg-slate-200 transition-colors">→ العودة</button>
                  <button onClick={() => setNewCarStep(3)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black hover:bg-slate-800 transition-colors">التالي: التسعير ←</button>
                </div>
              </div>
            )}

            {/* ============ STEP 3: Pricing & Location ============ */}
            {newCarStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 mt-6">
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <h4 className="font-black text-amber-800 mb-2">💡 استراتيجية التسعير</h4>
                  <p className="text-sm text-amber-700/80">تحديد سعر احتياطي واقعي يزيد من فرص بيع سيارتك من أول مزاد بنسبة 70%. السعر الاحتياطي مخفي عن المشترين.</p>
                </div>

                {/* Row 1: Starting Price + Reserve Price */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">سعر بداية المزاد (Starting Price) *</label>
                    <div className="relative">
                      <input type="number" value={newCar.startingPrice || ''} onChange={e => updateNewCar('startingPrice', parseInt(e.target.value) || 0)} placeholder="السعر الذي يبدأ منه المزاد..." className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl text-lg font-black text-slate-900 focus:border-orange-500 outline-none" />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">$</span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-2">السعر الذي سيبدأ منه المزايدون. يُفضل أن يكون أقل من السعر الاحتياطي.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">السعر الاحتياطي (Reserve Price) *</label>
                    <div className="relative">
                      <input type="number" value={newCar.reservePrice || ''} onChange={e => updateNewCar('reservePrice', parseInt(e.target.value) || 0)} placeholder="أقل سعر تقبل البيع به..." className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl text-lg font-black text-slate-900 focus:border-orange-500 outline-none" />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">$</span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-2">* مخفي عن المشترين، إذا لم يصله المزاد ستنتقل السيارة لسوق العروض.</p>
                  </div>
                </div>

                {/* Row 2: Min Offer % + Buy-It-Now */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">أقل نسبة عرض مقبول من الاحتياطي</label>
                    <select aria-label="تحديد" title="تحديد" value={newCar.minOfferPercent} onChange={e => updateNewCar('minOfferPercent', parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-900 focus:border-orange-500 outline-none">
                      <option value={100}>100% - لا يُقبل أقل من السعر الاحتياطي</option>
                      <option value={95}>95% - خصم 5% كحد أقصى</option>
                      <option value={90}>90% - خصم 10% كحد أقصى</option>
                      <option value={85}>85% - خصم 15% كحد أقصى (موصى به)</option>
                      <option value={80}>80% - خصم 20% كحد أقصى</option>
                      <option value={75}>75% - خصم 25% كحد أقصى</option>
                    </select>
                    {newCar.reservePrice > 0 && (
                      <div className="mt-2 bg-blue-50 text-blue-800 p-3 rounded-xl text-sm font-bold flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>الحد الأدنى للعرض: <strong className="text-blue-900">${Math.ceil(newCar.reservePrice * newCar.minOfferPercent / 100).toLocaleString()}</strong> — لن يستطيع المشتري تقديم عرض أقل من هذا المبلغ.</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">سعر الشراء الفوري (Buy-It-Now)</label>
                    <div className="relative">
                      <input type="number" value={newCar.buyItNowPrice || ''} onChange={e => updateNewCar('buyItNowPrice', parseInt(e.target.value) || 0)} placeholder="اختياري..." className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl text-lg font-black text-slate-900 focus:border-orange-500 outline-none" />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">$</span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-2">إذا عرض المشتري هذا المبلغ تُباع فوراً بدون انتظار المزاد.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الموقع (Location) *</label>
                  <input type="text" value={newCar.location} onChange={e => updateNewCar('location', e.target.value)} placeholder="طرابلس، ليبيا أو Houston, TX..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ملاحظات إضافية (Notes)</label>
                  <textarea value={newCar.notes} onChange={e => updateNewCar('notes', e.target.value)} rows={3} placeholder="أي معلومات إضافية عن السيارة تساعد المشتري..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-orange-500 outline-none resize-none"></textarea>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h4 className="font-black text-slate-700 text-sm mb-3">📋 ملخص السيارة</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-slate-400">السيارة:</span>
                    <span className="font-bold text-slate-800">{newCar.year} {newCar.make} {newCar.model} {newCar.trim}</span>
                    <span className="text-slate-400">VIN:</span>
                    <span className="font-mono font-bold text-slate-800">{newCar.vin || '---'}</span>
                    <span className="text-slate-400">المسافة:</span>
                    <span className="font-bold text-slate-800">{newCar.mileage ? `${Number(newCar.mileage).toLocaleString()} ${newCar.mileageUnit === 'mi' ? 'ميل' : 'كم'}` : '---'}</span>
                    <span className="text-slate-400">المحرك:</span>
                    <span className="font-bold text-slate-800">{newCar.engineSize || '---'} {newCar.horsepower ? `• ${newCar.horsepower}HP` : ''}</span>
                    <span className="text-slate-400">ناقل الحركة:</span>
                    <span className="font-bold text-slate-800">{newCar.transmission === 'automatic' ? 'أوتوماتيك' : newCar.transmission === 'manual' ? 'عادي' : 'CVT'}</span>
                    <span className="text-slate-400">بداية المزاد:</span>
                    <span className="font-bold text-blue-600">{newCar.startingPrice ? `$${newCar.startingPrice.toLocaleString()}` : '---'}</span>
                    <span className="text-slate-400">السعر الاحتياطي:</span>
                    <span className="font-bold text-emerald-600">{newCar.reservePrice ? `$${newCar.reservePrice.toLocaleString()}` : '---'}</span>
                    <span className="text-slate-400">أقل عرض مقبول:</span>
                    <span className="font-bold text-orange-600">{newCar.reservePrice ? `$${Math.ceil(newCar.reservePrice * newCar.minOfferPercent / 100).toLocaleString()} (${newCar.minOfferPercent}%)` : '---'}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-6 mt-4 border-t border-slate-50">
                  <button onClick={() => setNewCarStep(2)} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-black hover:bg-slate-200 transition-colors">→ العودة</button>
                  <button onClick={handleCreateCar} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    اعتماد وإدراج السيارة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
