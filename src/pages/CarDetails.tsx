import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Calendar, Gauge, MapPin, Shield, Info, FileText,
  Hash, Calculator as CalcIcon, Gavel, Clock, Tag, AlertTriangle
} from 'lucide-react';
import { calculateTotalCost, MOCK_LOCATIONS } from '../services/calculatorService';
import { VehicleType } from '../types/calculator';
import { LiveAuction } from '../components/LiveAuction';
import { useStore } from '../context/StoreContext';

export const CarDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { cars, currentUser } = useStore();

  // Try to get car from location.state first (fast), then from global store
  const carFromState = location.state?.car;
  const carFromStore = cars.find(c => c.id === id);
  const car = carFromState || carFromStore;

  // Extract images from car data (handles arrays from server or strings from CSV)
  const allImages = React.useMemo(() => {
    if (!car) return [];
    if (Array.isArray(car.images)) return car.images.slice(0, 20);
    const imageUrls = car['Image URL'] || car.images || '';
    const images = String(imageUrls).split(/[,;\s\n]/).map((url: string) => url.trim()).filter(Boolean);
    if (images.length === 0 && car['Image Thumbnail']) images.push(car['Image Thumbnail']);
    return images.slice(0, 20);
  }, [car]);

  const [mainImage, setMainImage] = React.useState(allImages[0] || 'https://picsum.photos/seed/car/800/600');

  React.useEffect(() => {
    if (allImages.length > 0) setMainImage(allImages[0]);
  }, [allImages]);

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <h2 className="text-2xl font-bold mb-4">البيانات غير متوفرة</h2>
        <button onClick={() => navigate(-1)} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold">
          العودة للخلف
        </button>
      </div>
    );
  }

  const isLive = car.status === 'live' || car.status === 'ultimo';
  const isOfferMarket = car.status === 'offer_market';

  const specs = [
    { label: 'السنة', value: car.year || car.Year, icon: Calendar },
    { label: 'الماركة', value: car.make || car.Make, icon: Shield },
    { label: 'الموديل', value: car.model || car['Model Group'], icon: Info },
    { label: 'العداد', value: `${(car.odometer || car.Odometer || 0).toLocaleString()} mi`, icon: Gauge },
    { label: 'الموقع', value: car.location || `${car['Location city']}, ${car['Location state']}`, icon: MapPin },
    { label: 'VIN', value: car.vin || car.VIN, icon: Hash },
  ];

  // ============================================================
  // 🔴 IF LIVE / ULTIMO → Show Full Live Auction Widget
  // ============================================================
  if (isLive) {
    return (
      <LiveAuction
        car={car}
        onBack={() => navigate(-1)}
      />
    );
  }

  // ============================================================
  // 📋 STATIC VIEW: upcoming / offer_market / closed
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors font-bold"
      >
        <ChevronLeft className="w-5 h-5" />
        العودة للقائمة
      </button>

      {/* Status Banner */}
      {car.status === 'upcoming' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div>
            <div className="font-black text-blue-800">المزاد قادم قريباً</div>
            <div className="text-blue-600 text-sm font-medium">
              يبدأ في: {car.auctionEndDate ? new Date(car.auctionEndDate).toLocaleString('ar-EG') : 'قريباً'}
            </div>
          </div>
        </div>
      )}

      {isOfferMarket && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4 flex items-center gap-3">
          <Tag className="w-6 h-6 text-orange-500 flex-shrink-0" />
          <div>
            <div className="font-black text-orange-800">سوق العروض - قدّم عرضك!</div>
            <div className="text-orange-600 text-sm font-medium">
              ينتهي في: {car.offerMarketEndTime ? new Date(car.offerMarketEndTime).toLocaleString('ar-EG') : 'قريباً'}
            </div>
          </div>
        </div>
      )}

      {car.status === 'closed' && (
        <div className={`rounded-2xl px-6 py-4 flex items-center gap-3 ${car.winnerId === currentUser?.id
          ? 'bg-green-50 border border-green-100'
          : 'bg-slate-50 border border-slate-100'
          }`}>
          <Shield className={`w-6 h-6 flex-shrink-0 ${car.winnerId === currentUser?.id ? 'text-green-500' : 'text-slate-400'}`} />
          <div>
            <div className={`font-black ${car.winnerId === currentUser?.id ? 'text-green-800' : 'text-slate-700'}`}>
              {car.winnerId === currentUser?.id ? '🏆 لقد فزت بهذا المزاد!' : 'المزاد منتهٍ'}
            </div>
            <div className="text-sm font-medium text-slate-500">
              سعر البيع النهائي: ${(car.currentBid || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white aspect-[4/3]">
            <img
              src={mainImage}
              alt={car.make || car.Make}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/car/800/600';
              }}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {allImages.map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => setMainImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 ${mainImage === img ? 'border-orange-500 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
              >
                <img
                  src={img}
                  alt="صورة"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/car${i}/200/200`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-widest mb-2">
              <Shield className="w-4 h-4" />
              {car.titleType || car['Sale Title State'] || 'Clean Title'}
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">
              {car.year || car.Year} {car.make || car.Make} {car.model || car['Model Group']}
            </h1>
            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {car.location || `${car['Location city']}, ${car['Location state']}`}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                Lot: {car.lotNumber || car['Lot number'] || 'N/A'}
              </span>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {specs.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase">
                    <Icon className="w-3 h-3" />
                    {spec.label}
                  </div>
                  <div className="text-slate-800 font-bold truncate">{spec.value}</div>
                </div>
              );
            })}
          </div>

          {/* Damage Info */}
          {(car.primaryDamage && car.primaryDamage !== 'None') && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-800 text-sm">تقرير الضرر</div>
                <div className="text-amber-700 text-sm">
                  الضرر الأساسي: <strong>{car.primaryDamage}</strong>
                  {car.secondaryDamage && <span> | ثانوي: <strong>{car.secondaryDamage}</strong></span>}
                </div>
              </div>
            </div>
          )}

          {/* Bid / Offer CTA */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                  {isOfferMarket ? 'أعلى عرض حالي' : 'آخر سعر مزايدة'}
                </div>
                <div className="text-5xl font-black font-mono text-green-400">
                  ${(car.currentBid || car.reservePrice || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">السعر الاحتياطي</div>
                <div className="text-2xl font-black font-mono text-slate-400 line-through decoration-red-500/50">
                  ${(car.reservePrice || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            {car.status === 'upcoming' && (
              <button
                disabled
                className="w-full py-4 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-2xl font-black flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Clock className="w-5 h-5" />
                المزاد لم يبدأ بعد - تابع الصفحة عند البدء
              </button>
            )}

            {isOfferMarket && currentUser && (
              <MakeOfferPanel car={car} currentUser={currentUser} />
            )}

            {car.status === 'closed' && (
              <div className="w-full py-4 bg-slate-800 text-slate-500 rounded-2xl font-black text-center">
                المزاد منتهٍ
              </div>
            )}

            {/* Mini Cost Calculator */}
            {car.currentBid && car.currentBid > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                  <CalcIcon className="w-4 h-4 text-orange-500" />
                  تقدير التكلفة الكاملة (حتى ليبيا)
                </div>
                {(() => {
                  const locState = car.location || '';
                  const loc = MOCK_LOCATIONS.find(l => locState.includes(l.state)) || MOCK_LOCATIONS[0];
                  const result = calculateTotalCost(car.currentBid, VehicleType.SEDAN, loc, 'LIBYA', 'KHOMS', 10);
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">رسوم المزاد</span>
                        <span className="font-mono">${result.auctionFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">الشحن واللوجستيات</span>
                        <span className="font-mono">${(result.inlandFreight + result.oceanFreight).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/10 font-black">
                        <span className="text-orange-400">الإجمالي الواصل (الخمس)</span>
                        <span className="font-mono text-orange-400">${result.total.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Full Details Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-slate-800">تفاصيل إضافية</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {[
                ['الموديل الكامل', car.model || car['Model Group']],
                ['ناقل الحركة', car.transmission || 'غير محدد'],
                ['الوقود', car.fuelType || 'غير محدد'],
                ['الدفع', car.drivetrain || car.drive || 'غير محدد'],
                ['اللون الخارجي', car.exteriorColor || 'غير محدد'],
                ['المحرك', car.engine || car.engineSize || 'غير محدد'],
                ['نوع الوثيقة', car.titleType || 'Clean'],
                ['يعمل؟', car.runsDrives === 'yes' ? 'نعم ✅' : car.runsDrives || 'غير محدد'],
              ].filter(([, v]) => v).map(([key, value], i) => (
                <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors border-b border-slate-50">
                  <span className="text-sm text-slate-500 font-medium">{key}</span>
                  <span className="text-sm text-slate-800 font-bold">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Inline Offer Panel for Offer Market cars
// ============================================================
const MakeOfferPanel: React.FC<{ car: any; currentUser: any }> = ({ car, currentUser }) => {
  const [offerAmount, setOfferAmount] = React.useState(car.currentBid || car.reservePrice * 0.9 || 0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { showAlert } = useStore();

  const minOffer = Math.ceil((car.reservePrice || 0) * 0.9);

  const handleSubmitOffer = async () => {
    if (offerAmount < minOffer) {
      showAlert(`الحد الأدنى للعرض هو $${minOffer.toLocaleString()} (90% من السعر الاحتياطي)`, 'error');
      return;
    }
    if (offerAmount > currentUser.buyingPower) {
      showAlert('القوة الشرائية غير كافية لهذا العرض', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cars/${car.id}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, amount: offerAmount })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert(data.message || 'تم تقديم العرض بنجاح!', 'success');
      } else {
        showAlert(data.error || 'فشل تقديم العرض', 'error');
      }
    } catch {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-widest">
          مبلغ عرضك (الحد الأدنى: ${minOffer.toLocaleString()})
        </div>
        <div className="flex gap-3">
          <input aria-label="مدخل" title="مدخل" placeholder="تحديد" 
            type="number"
            value={offerAmount}
            onChange={e => setOfferAmount(Number(e.target.value))}
            min={minOffer}
            step={100}
            className="flex-1 bg-transparent text-white text-2xl font-black font-mono outline-none border-b border-white/20 pb-1"
          />
          <span className="text-slate-400 self-end pb-1 font-bold">USD</span>
        </div>
      </div>
      <button
        onClick={handleSubmitOffer}
        disabled={isSubmitting}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-orange-500/20 disabled:opacity-50"
      >
        <Gavel className="w-5 h-5" />
        {isSubmitting ? 'جاري الإرسال...' : 'تقديم العرض الآن'}
      </button>
      <div className="text-[10px] text-slate-500 text-center">
        سيبلغ البائع بعرضك ويمكنه القبول أو الرفض خلال 48 ساعة
      </div>
    </div>
  );
};
