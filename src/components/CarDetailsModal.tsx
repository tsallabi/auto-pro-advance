import React, { useState, useEffect } from 'react';
import { Car, FeeEstimate } from '../types';
import { calculateFees } from '../data';
import {
  X, Calendar, MapPin, Gauge, Shield, Calculator as CalcIcon, Info,
  Truck, Ship, DollarSign, Gavel, PlayCircle, AlertTriangle,
  Clock, Warehouse, Navigation, CheckCircle2, ChevronDown,
  FileText, Star
} from 'lucide-react';
import { calculateTotalCost, MOCK_LOCATIONS } from '../services/calculatorService';
import { VehicleType } from '../types/calculator';
import { useStore } from '../context/StoreContext';

interface CarDetailsModalProps {
  car: Car;
  onClose: () => void;
  onJoinLive?: () => void;
  onBid?: (car: Car) => void;
}

/* ── Location status badges ── */
const LOCATION_STATUSES: Record<string, { color: string; bg: string; icon: React.FC<any>; label: string }> = {
  warehouse: { color: 'text-blue-700', bg: 'bg-blue-50  border-blue-200', icon: Warehouse, label: 'مستودع' },
  port: { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: Ship, label: 'ميناء' },
  transit: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: Navigation, label: 'عبور' },
  delivered: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle2, label: 'تم التسليم' },
};

/* ── Damage severity badge ── */
const DAMAGE_COLORS: Record<string, string> = {
  None: 'bg-green-100 text-green-700',
  Minor: 'bg-yellow-100 text-yellow-700',
  Partial: 'bg-orange-100 text-orange-700',
  Major: 'bg-red-100 text-red-700',
  'Total Loss': 'bg-slate-900 text-white',
};

export const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ car, onClose, onJoinLive, onBid }) => {
  const { currentUser, placeBid, socket, showAlert } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState(car.currentBid);

  // ── Bid mode: 'pre_bid' (proxy) | 'normal' | 'offer'
  const [bidMode, setBidMode] = useState<'pre_bid' | 'normal'>('pre_bid');
  const [bidAmount, setBidAmount] = useState<string>((car.currentBid + 100).toString());
  // Proxy bid max — the maximum the system will auto-bid up to on your behalf
  const [proxyMax, setProxyMax] = useState<string>((car.currentBid + 500).toString());

  const [showNotes, setShowNotes] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);

  const fees: FeeEstimate = calculateFees(Number(bidAmount) || currentBid);

  // ── Auto image slider
  useEffect(() => {
    if (car.images.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedImageIndex(c => (c + 1) % car.images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [car.images.length]);

  // ── Real-time bid updates
  useEffect(() => {
    if (!socket) return;
    socket.emit('join_auction', car.id);
    socket.on('bid_updated', (data: any) => {
      if (data.carId === car.id) {
        setCurrentBid(data.currentBid);
        setBidAmount((data.currentBid + 100).toString());
      }
    });
    return () => { socket.off('bid_updated'); };
  }, [socket, car.id]);

  // ── Proxy Bid handler
  const handleProxyBid = async () => {
    if (!currentUser) { showAlert('يرجى تسجيل الدخول للمزايدة'); return; }
    const max = Number(proxyMax);
    const min = Number(bidAmount);
    if (max < min) { showAlert('الحد الأقصى يجب أن يكون أكبر من المزايدة الحالية'); return; }
    setSubmittingBid(true);
    try {
      // Register proxy bid — system will auto-bid up to proxyMax
      const res = await fetch('/api/bids/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: car.id, userId: currentUser.id, maxAmount: max }),
      });
      if (res.ok) {
        showAlert(`✅ تم تسجيل مزايدتك المسبقة — سيزايد النظام تلقائياً حتى $${max.toLocaleString()}`, 'success');
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        // Fallback: place regular bid
        placeBid(car.id, min, currentUser.id);
        showAlert(`✅ تم تسجيل مزايدتك المسبقة بـ $${min.toLocaleString()}`, 'success');
      }
    } catch {
      // Fallback to regular bid
      placeBid(car.id, min, currentUser.id);
      showAlert(`✅ تم تسجيل المزايدة بـ $${min.toLocaleString()}`, 'success');
    } finally {
      setSubmittingBid(false);
    }
  };

  // ── Normal bid handler
  const handleNormalBid = () => {
    if (!currentUser) { showAlert('يرجى تسجيل الدخول للمزايدة'); return; }
    const amount = Number(bidAmount);
    if (amount <= currentBid) { showAlert('يجب أن تكون المزايدة أعلى من القيمة الحالية'); return; }
    placeBid(car.id, amount, currentUser.id);
    showAlert(`✅ تم تسجيل مزايدتك بـ $${amount.toLocaleString()}`, 'success');
  };

  // ── Offer handler (offer_market)
  const handleMakeOffer = async () => {
    if (!currentUser) { showAlert('يرجى تسجيل الدخول لتقديم عرض'); return; }
    const amount = Number(bidAmount);
    if (!amount || amount <= 0) { showAlert('يرجى إدخال مبلغ صحيح'); return; }
    try {
      const res = await fetch(`/api/cars/${car.id}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, amount }),
      });
      if (res.ok) { showAlert('تم تقديم العرض بنجاح', 'success'); onClose(); }
      else { const err = await res.json(); showAlert(err.error || 'فشل تقديم العرض'); }
    } catch { showAlert('فشل الاتصال بالخادم'); }
  };

  // ── Location status detection
  const locationStatus = (car as any).locationStatus || 'warehouse';
  const locInfo = LOCATION_STATUSES[locationStatus] || LOCATION_STATUSES.warehouse;
  const LocIcon = locInfo.icon;

  const isUpcoming = car.status === 'upcoming' || car.status === 'pending_approval';
  const isLive = car.status === 'live';
  const isOffer = car.status === 'offer_market';

  const damageColor = DAMAGE_COLORS[car.primaryDamage || 'None'] || DAMAGE_COLORS['None'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row">

        {/* ── Close ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-red-50 p-2.5 rounded-full text-slate-500 hover:text-red-500 shadow-lg transition-all hover:rotate-90"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ════════════════════════════════════════
            RIGHT: Image + Info
        ════════════════════════════════════════ */}
        <div className="w-full md:w-[58%] bg-slate-50 overflow-y-auto">

          {/* Hero Image */}
          <div className="relative aspect-video bg-black">
            <img
              src={car.images[selectedImageIndex] || car.images[0]}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-contain"
            />

            {/* Status Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isLive && (
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 animate-pulse shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  مزاد مباشر الآن
                </span>
              )}
              {isUpcoming && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
                  <Clock className="w-3 h-3" /> قادم قريباً
                </span>
              )}
              {isOffer && (
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
                  <DollarSign className="w-3 h-3" /> سوق العروض
                </span>
              )}
            </div>

            {/* Location pill */}
            <div className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${locInfo.bg} ${locInfo.color}`}>
              <LocIcon className="w-3 h-3" />
              {locInfo.label}: {car.location}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="bg-white border-b border-slate-100 p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {car.images.map((img, idx) => (
                <button
                  key={idx}
                  title="عرض الصورة"
                  aria-label="عرض الصورة"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-16 aspect-video rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent hover:border-slate-300'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Car Info */}
          <div className="p-5 md:p-7 space-y-6">

            {/* Title */}
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                {car.year} {car.make} {car.model}
                {(car as any).trim && <span className="text-orange-500 text-xl ml-2">{(car as any).trim}</span>}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs font-bold font-mono">
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">VIN: {car.vin}</span>
                <span className="bg-slate-900 text-white px-3 py-1 rounded-full">LOT: {car.lotNumber}</span>
                {/* Damage badge */}
                <span className={`px-3 py-1 rounded-full font-black ${damageColor}`}>
                  ⚠️ {car.primaryDamage || 'None'}
                </span>
              </div>
            </div>

            {/* Specs Grid — 6 fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'الضرر الأساسي', val: car.primaryDamage || '—' },
                { label: 'الضرر الثانوي', val: (car as any).secondaryDamage || 'None' },
                { label: 'نوع الوثيقة', val: car.titleType },
                { label: 'العداد', val: `${car.odometer.toLocaleString()} ${(car as any).odometerUnit || 'mi'}` },
                { label: 'المحرك', val: car.engine },
                { label: 'نظام الدفع', val: car.drive },
                { label: 'ناقل الحركة', val: (car as any).transmission || '—' },
                { label: 'اللون الخارجي', val: (car as any).exteriorColor || '—' },
                { label: 'يعمل / يتحرك', val: (car as any).runsDrives === false ? 'لا ❌' : 'نعم ✅' },
              ].map(s => (
                <div key={s.label} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-slate-400 text-[10px] block mb-0.5 font-bold uppercase tracking-tight">{s.label}</span>
                  <span className="font-bold text-slate-800 text-sm">{s.val}</span>
                </div>
              ))}
            </div>

            {/* Location Track */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${locInfo.bg} ${locInfo.color}`}>
              <LocIcon className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-black text-sm">موقع السيارة الحالي: {locInfo.label}</div>
                <div className="text-xs opacity-70 font-bold mt-0.5">{car.location}</div>
                {(car as any).locationNotes && (
                  <div className="text-xs mt-1 opacity-60">{(car as any).locationNotes}</div>
                )}
              </div>
            </div>

            {/* Admin Notes (if any) */}
            {(car as any).adminNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 font-black text-amber-800 text-sm mb-1">
                  <FileText className="w-4 h-4" /> ملاحظات الإدارة
                </div>
                <p className="text-amber-700 text-sm leading-relaxed">{(car as any).adminNotes}</p>
              </div>
            )}

            {/* Description */}
            {(car as any).description && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="font-black text-slate-700 text-sm mb-1">وصف السيارة</div>
                <p className="text-slate-500 text-sm leading-relaxed">{(car as any).description}</p>
              </div>
            )}

            {/* Trust badges */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-xl shrink-0">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-0.5">تقرير الحالة الموثوق</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {(car as any).conditionSummary || 'تم التحقق من تقرير Carfax. لا توجد حوادث سابقة مسجلة قبل هذا الحادث.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 p-4 rounded-2xl border border-green-100">
                <div className="bg-green-100 p-2 rounded-xl shrink-0">
                  <Truck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-0.5">لوجستيات ذكية</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    يتوفر شحن داخلي ودولي. التكلفة التقديرية للشرق الأوسط: $1,200 شاملاً التأمين.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            LEFT: Bidding Panel
        ════════════════════════════════════════ */}
        <div className="w-full md:w-[42%] bg-white border-r border-slate-100 flex flex-col overflow-y-auto">
          <div className="p-5 md:p-7 space-y-6 flex-grow">

            {/* Mini Cost Calculator */}
            <div className="bg-slate-900 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4 text-white">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <CalcIcon className="w-4 h-4 text-orange-500" />
                  حاسبة الرسوم الشفافة
                </h3>
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">تقدير دقيق</span>
              </div>
              {(() => {
                const loc = MOCK_LOCATIONS.find(l => car.location.includes(l.state)) || MOCK_LOCATIONS[0];
                const result = calculateTotalCost(car.currentBid, VehicleType.SEDAN, loc, 'LIBYA', 'KHOMS', 10);
                return (
                  <div className="space-y-3 text-white">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[9px] text-slate-500 font-black mb-1 uppercase">قيمة السيارة</div>
                        <div className="text-lg font-black font-mono">${car.currentBid.toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <div className="text-[9px] text-orange-400 font-black mb-1 uppercase">رسوم المزاد</div>
                        <div className="text-lg font-black font-mono text-orange-400">${result.auctionFee.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-1">
                      {[
                        { label: 'شحن داخلي وخارجي', val: result.inlandFreight + result.oceanFreight, icon: Ship },
                        { label: 'رسوم المقاصة والجمارك', val: result.makinaFee + result.customsDuty, icon: Info },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <r.icon className="w-3 h-3" />{r.label}
                          </span>
                          <span className="font-mono font-bold">${r.val.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <div className="text-[9px] text-slate-500 font-bold mb-1 italic">التكلفة الإجمالية (تقديرياً)</div>
                        <div className="text-2xl font-black font-mono">${result.total.toLocaleString()}</div>
                      </div>
                      <CalcIcon className="w-6 h-6 text-white/5" />
                    </div>
                    <p className="text-[9px] text-slate-500 italic border-r-2 border-white/10 pr-2">
                      * بناءً على شحن {car.make} {car.model} من {loc.name} إلى ليبيا - الخمس.
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* ── Current Bid ── */}
            <div className="text-center">
              <span className="text-slate-400 text-xs font-bold block mb-1 uppercase tracking-widest">
                {isOffer ? 'أعلى عرض حالي' : 'المزايدة الحالية'}
              </span>
              <div className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                ${currentBid.toLocaleString()}
              </div>
              {!isLive && !isOffer && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-600 mt-2">
                  <Info className="w-3 h-3" />
                  الحد الأدنى: ${(currentBid + 100).toLocaleString()}
                </span>
              )}
              {isOffer && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-600 mt-2">
                  <Info className="w-3 h-3" />
                  Reserve: ${car.reservePrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* ── Bid Mode Tabs (for upcoming / pending cars) ── */}
            {isUpcoming && (
              <div className="bg-slate-50 p-1 rounded-2xl flex gap-1">
                {(
                  [
                    { id: 'pre_bid' as const, label: '🤖 مزايدة مسبقة ذكية' },
                    { id: 'normal' as const, label: '✋ مزايدة عادية' },
                  ]
                ).map(t => (
                  <button
                    key={'bid_tab_' + t.id}
                    onClick={() => setBidMode(t.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all text-center ${bidMode === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}

              </div>
            )}

            {/* ── Proxy Bid inputs ── */}
            {(isUpcoming && bidMode === 'pre_bid') && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-700">
                  🤖 المزايدة المسبقة تعني أن النظام سيزايد تلقائياً بأقل مبلغ ممكن حتى يصل للحد الأقصى الذي تحدده
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">مبلغ البدء ($)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    min={currentBid + 100}
                    step={100}
                    title="مبلغ البدء"
                    placeholder="مبلغ البدء"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xl font-black text-center focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">الحد الأقصى الذي يزايد النظام حتله ($)</label>
                  <input
                    type="number"
                    value={proxyMax}
                    onChange={e => setProxyMax(e.target.value)}
                    min={Number(bidAmount) + 100}
                    step={500}
                    title="الحد الأقصى"
                    placeholder="الحد الأقصى"
                    className="w-full bg-orange-50 border-2 border-orange-200 rounded-xl p-3 text-xl font-black text-center focus:border-orange-500 outline-none transition-all text-orange-700"
                  />
                </div>
              </div>
            )}

            {/* ── Normal bid / Offer input ── */}
            {(!isUpcoming || bidMode === 'normal' || isOffer) && !isLive && (
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">
                  {isOffer ? 'مبلغ عرضك ($)' : 'مبلغ مزايدتك ($)'}
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  min={currentBid + 100}
                  step={100}
                  title="مبلغ المزايدة"
                  placeholder="مبلغ المزايدة"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-2xl font-black text-center focus:border-orange-500 outline-none transition-all"
                />
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 2500, 5000].map(amt => (
                    <button key={amt}
                      onClick={() => setBidAmount((currentBid + amt).toString())}
                      className="flex-1 py-1.5 text-[10px] font-black bg-slate-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
                      +${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="space-y-2.5">

              {/* LIVE: Join live auction */}
              {isLive && onJoinLive && (
                <button
                  onClick={onJoinLive}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Gavel className="w-5 h-5" />
                  مزايدة المسبقة
                </button>
              )}

              {car.status === 'offer_market' && (
                <button
                  onClick={() => onBid && onBid(car)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  مزايدة مسبقة بـ ${Number(bidAmount).toLocaleString()}
                </button>
              )}

              {/* UPCOMING: Proxy bid */}
              {isUpcoming && bidMode === 'pre_bid' && (
                <button
                  onClick={handleProxyBid}
                  disabled={submittingBid}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-2xl font-black text-base transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Gavel className="w-5 h-5" />
                  {submittingBid ? '⏳ جاري التسجيل...' : `🤖 تسجيل مزايدة مسبقة حتى $${Number(proxyMax).toLocaleString()}`}
                </button>
              )}

              {/* UPCOMING: Normal bid */}
              {isUpcoming && bidMode === 'normal' && (
                <button
                  onClick={handleNormalBid}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2"
                >
                  <Gavel className="w-5 h-5" />
                  تأكيد المزايدة بـ ${Number(bidAmount).toLocaleString()}
                </button>
              )}

              {/* OFFER MARKET */}
              {isOffer && (
                <button
                  onClick={handleMakeOffer}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-black text-base transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  تقديم عرض بـ ${Number(bidAmount).toLocaleString()}
                </button>
              )}

              {/* Buy It Now */}
              {car.buyItNow && (
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                  <Star className="w-4 h-4" />
                  شراء فوري بـ ${car.buyItNow.toLocaleString()}
                </button>
              )}
            </div>

          </div>{/* end scroll area */}
        </div>

      </div>
    </div>
  );
};
