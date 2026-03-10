import React, { useState, useEffect } from 'react';
import { Car } from '../types';
import { Gavel, Users, Clock, AlertCircle, CheckCircle2, ArrowUp, DollarSign, Calculator as CalcIcon, Info, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { calculateTotalCost, MOCK_LOCATIONS } from '../services/calculatorService';
import { VehicleType } from '../types/calculator';

interface LiveAuctionProps {
  car: Car;
  onBack: () => void;
}

export const LiveAuction: React.FC<LiveAuctionProps> = ({ car, onBack }) => {
  const { socket, currentUser, placeBid, showAlert } = useStore();
  const [currentBid, setCurrentBid] = useState(car.currentBid);
  const [bidders, setBidders] = useState(12);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showAntiSniping, setShowAntiSniping] = useState(false);
  const [maxBid, setMaxBid] = useState<number | ''>('');
  const [isProxySet, setIsProxySet] = useState(false);
  const [ultimoEndTime, setUltimoEndTime] = useState<string | null>(null);
  const [isUltimo, setIsUltimo] = useState(car.status === 'ultimo');
  const [bidHistory, setBidHistory] = useState<{ amount: number, user: string, time: string, country?: string }[]>([
    { amount: car.currentBid, user: 'UAE_Dealer_88', time: 'الآن', country: 'UAE' },
  ]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllBids, setShowAllBids] = useState(false);

  const getFlagEmoji = (country?: string) => {
    if (!country) return '🏁';
    const flags: Record<string, string> = {
      'UAE': '🇦🇪', 'الإمارات': '🇦🇪', '🇸🇦': '🇸🇦', 'السعودية': '🇸🇦', 'Saudi Arabia': '🇸🇦',
      'Kuwait': '🇰🇼', 'الكويت': '🇰🇼', 'Qatar': '🇶🇦', 'قطر': '🇶🇦', 'Oman': '🇴🇲', 'عمان': '🇴🇲',
      'Jordan': '🇯🇴', 'الأردن': '🇯🇴', 'Egypt': '🇪🇬', 'مصر': '🇪🇬', 'USA': '🇺🇸', 'أمريكا': '🇺🇸',
      'Germany': '🇩🇪', 'ألمانيا': '🇩🇪', 'Japan': '🇯🇵', 'اليابان': '🇯🇵', 'العراق': '🇮🇶', 'Iraq': '🇮🇶'
    };
    return flags[country] || '🏁';
  };

  const playBidSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => { }); // Ignore autoplay blocks
  };

  // Automatic Image Slider for Live Auction
  useEffect(() => {
    if (!car.images || car.images.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImageIndex((current) => (current + 1) % car.images.length);
    }, 4000); // Cycle every 4 seconds in live view

    return () => clearInterval(interval);
  }, [car.images]);

  // Listen for live updates
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_auction', car.id);

    // Sync Timer from server
    socket.on('timer_update', (data) => {
      if (data.carId === car.id) {
        if (data.timeLeft > timeLeft + 10) {
          setShowAntiSniping(true);
          setTimeout(() => setShowAntiSniping(false), 3000);
        }
        setTimeLeft(data.timeLeft);
      }
    });

    socket.on('bid_updated', (data) => {
      if (data.carId === car.id) {
        setCurrentBid(data.currentBid);
        setBidHistory(prev => [
          {
            amount: data.currentBid,
            user: data.userId === currentUser?.id ? 'أنت (You)' : `مزايد_${data.userId.slice(-4)}`,
            time: 'الآن',
            country: data.country
          },
          ...prev
        ]);

        // Play sound if someone else bids
        if (data.userId !== currentUser?.id) {
          playBidSound();
        }
      }
    });

    socket.on('auction_closed', (data) => {
      if (data.carId === car.id) {
        setTimeLeft(0);
        showAlert('انتهى المزاد!', 'info');
      }
    });

    socket.on('proxy_bid_set', (data) => {
      if (data.carId === car.id) {
        setIsProxySet(true);
        showAlert(`تم ضبط المزايد الآلي عند $${data.maxAmount}`, 'success');
      }
    });

    socket.on('ultimo_started', (data) => {
      if (data.carId === car.id) {
        setIsUltimo(true);
        setUltimoEndTime(data.ultimoEndTime);
        showAlert(data.winnerId === currentUser?.id ? 'لقد دخلت نافذة Ultimo! أمامك 5 دقائق لإنهاء الصفقة.' : 'المزاد دخل مرحلة التفاوض النهائي مع أعلى مزايد.', 'info');
      }
    });

    return () => {
      socket.off('timer_update');
      socket.off('bid_updated');
      socket.off('auction_closed');
    };
  }, [socket, car.id, currentUser?.id, showAlert]);

  const nextBidAmount = currentBid + 100;

  /* ── bidding eligibility ── */
  const canBid = !!currentUser && (currentUser.buyingPower ?? 0) >= nextBidAmount;
  const bidBlockReason = !currentUser
    ? 'يجب تسجيل الدخول لتتمكن من المزايدة'
    : (currentUser.buyingPower ?? 0) < nextBidAmount
      ? `قوتك الشرائية (${(currentUser.buyingPower ?? 0).toLocaleString()} $) لا تكفي للمزايدة بـ ${nextBidAmount.toLocaleString()} $`
      : null;

  const handleBid = () => {
    if (!canBid) {
      showAlert(bidBlockReason || 'غير مؤهل للمزايدة', 'error');
      return;
    }
    placeBid(car.id, nextBidAmount, currentUser!.id);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white pt-20 pb-12 selection:bg-accent-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button onClick={onBack} className="text-slate-400 hover:text-white mb-2 flex items-center gap-2 transition-colors">
              &rarr; العودة للقائمة
            </button>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></span>
              مزاد مباشر: {car.year} {car.make} {car.model}
            </h1>
          </div>
          <div className="glass-dark px-6 py-3 rounded-2xl flex items-center gap-6 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-bold font-mono">{bidders}</span> مزايد
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-5 h-5 text-orange-400" />
              Lot: <span className="font-mono">{car.lotNumber}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main View - Video/Image & Controls */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Image/Video Area */}
            <div className="bg-slate-900 rounded-[2.5rem] aspect-video relative overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
              {/* Background Image Slider */}
              <div className="absolute inset-0">
                <img
                  src={car.images[selectedImageIndex] || car.images[0]}
                  alt={car.model}
                  className="w-full h-full object-cover transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              </div>

              {/* Gallery Indicator */}
              <div className="absolute top-6 right-6 flex gap-1">
                {car.images.slice(0, 10).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${idx === selectedImageIndex ? 'w-6 bg-accent-500' : 'w-2 bg-white/20'}`}
                  ></div>
                ))}
              </div>

              {/* Price Barometer */}
              <div className="absolute bottom-6 right-6 left-6 glass-dark p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مؤشر القرب من السعر الاحتياطي (Price Barometer)</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${currentBid >= (car.reservePrice || 0) ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                    currentBid >= (car.reservePrice || 0) * 0.9 ? 'bg-orange-500 text-white animate-pulse' :
                      currentBid >= (car.reservePrice || 0) * 0.7 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {currentBid >= (car.reservePrice || 0) ? 'تم الوصول للسعر ✅' :
                      currentBid >= (car.reservePrice || 0) * 0.9 ? 'ساخن (Hot) 🔥' :
                        currentBid >= (car.reservePrice || 0) * 0.7 ? 'دافيء (Warm) 🌤️' : 'بارد (Cold) ❄️'}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${currentBid >= (car.reservePrice || 0) ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 via-orange-500 to-red-500'
                      }`}
                    ref={(el) => { if (el) el.style.width = `${Math.min(100, (currentBid / Math.max(car.reservePrice || 1, 1)) * 100)}%`; }}
                  ></div>
                </div>
              </div>

              {/* Overlay HUD */}
              <div className="absolute top-6 left-6 glass-dark px-5 py-3 rounded-2xl border border-white/10 shadow-2xl animate-float">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">الوقت المتبقي</div>
                <div className={`text-4xl font-black font-mono tracking-tighter ${timeLeft <= 5 && !isUltimo ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {isUltimo ? (
                    (() => {
                      const diff = Math.max(0, Math.floor((new Date(ultimoEndTime || '').getTime() - Date.now()) / 1000));
                      const m = Math.floor(diff / 60);
                      const s = diff % 60;
                      return `${m}:${s.toString().padStart(2, '0')}`;
                    })()
                  ) : `00:${timeLeft.toString().padStart(2, '0')}`}
                </div>
                {showAntiSniping && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-orange-500 text-white text-[10px] font-bold py-1 px-3 rounded-full text-center animate-bounce shadow-lg shadow-orange-500/40">
                    تم تمديد الوقت (Anti-Sniping) 🛡️
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">حالة التشغيل: المحرك يعمل</span>
              </div>
            </div>

            {/* Bidding Controls */}
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 blur-[100px] -mr-32 -mt-32"></div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="text-slate-400 mb-1">أعلى مزايدة حالية</div>
                  <div className="text-5xl font-bold text-green-400 font-mono tracking-tight">
                    ${currentBid.toLocaleString()}
                  </div>
                </div>

                {/* Total Fee Calculator (Basic Version) */}
                <div className="text-right glass-dark p-3 rounded-xl border border-white/5 min-w-[200px]">
                  <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-tighter">التكلفة النهائية التقديرية</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">مزايدتك:</span>
                      <span className="font-mono">${(currentBid + 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-4 font-black text-orange-400 border-t border-white/5 pt-1 mt-1">
                      <span>الإجمالي + الرسوم:</span>
                      <span className="font-mono">${((currentBid + 100) * 1.115).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Bid block banner ── */}
              {bidBlockReason && (
                <div className="mb-4 flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                  <p className="text-yellow-300 text-sm font-bold">{bidBlockReason}</p>
                  {!currentUser && (
                    <a href="/auth" className="mr-auto shrink-0 bg-orange-500 hover:bg-orange-400 text-white text-xs font-black px-4 py-1.5 rounded-lg transition-colors">
                      سجّل الآن
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={handleBid}
                  disabled={!canBid || (isUltimo && currentUser?.id !== car.winnerId)}
                  className={`col-span-2 md:col-span-3 py-4 rounded-xl font-bold text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${!canBid || (isUltimo && currentUser?.id !== car.winnerId)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-70'
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20 active:scale-95'
                    }`}
                >
                  <Gavel className="w-6 h-6" />
                  {isUltimo ? 'إنهاء الصفقة بسعر الاحتياطي' : `زايد بـ $${nextBidAmount.toLocaleString()}`}
                </button>
                <div className="col-span-2 md:col-span-1 bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col gap-2">
                  <input
                    type="number"
                    value={maxBid}
                    onChange={(e) => setMaxBid(Number(e.target.value))}
                    placeholder="الحد الأقصى"
                    className="bg-transparent text-white text-center font-mono text-sm outline-none w-full"
                  />
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        showAlert('يرجى تسجيل الدخول لتعيين مزايدة آلية', 'error');
                        return;
                      }
                      if (maxBid && maxBid > currentBid) {
                        socket?.emit('set_proxy_bid', { carId: car.id, userId: currentUser?.id, maxAmount: maxBid });
                      } else {
                        showAlert('يجب أن يكون الحد الأقصى أعلى من المزايدة الحالية', 'error');
                      }
                    }}
                    className={`text-[10px] font-bold py-1 px-2 rounded-md transition-all ${isProxySet ? 'bg-accent-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    {isProxySet ? 'تحديث المزايد الآلي' : 'تفعيل المزايد الآلي'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - History & Info */}
          <div className="flex flex-col gap-6">

            {/* Bid History */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex-grow flex flex-col">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-slate-400" />
                سجل المزايدات
              </h3>

              <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-2 max-h-[400px]">
                {bidHistory.slice(0, showAllBids ? bidHistory.length : 5).map((bid, idx) => (
                  <div key={idx} className={`p-3 rounded-lg flex justify-between items-center ${idx === 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-700/50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl" title={bid.country}>{getFlagEmoji(bid.country)}</span>
                      <div>
                        <div className={`font-bold ${idx === 0 ? 'text-green-400' : 'text-slate-200'}`}>
                          {bid.user}
                        </div>
                        <div className="text-xs text-slate-400">{bid.time}</div>
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-lg ${idx === 0 ? 'text-green-400' : 'text-white'}`}>
                      ${bid.amount.toLocaleString()}
                    </div>
                  </div>
                ))}

                {bidHistory.length > 5 && (
                  <button
                    onClick={() => setShowAllBids(!showAllBids)}
                    className="w-full py-3 mt-2 rounded-xl bg-slate-700/30 border border-white/5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all flex items-center justify-center gap-2"
                  >
                    {showAllBids ? (
                      <>إخفاء السجل الإضافي</>
                    ) : (
                      <>عرض {bidHistory.length - 5} مزايدات إضافية</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Specs */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4">معلومات سريعة</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                      <CalcIcon className="w-4 h-4 text-orange-500" />
                      حاسبة الرسوم الشفافة
                    </h3>
                    <div className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">رسوم دقيقة</div>
                  </div>

                  {(() => {
                    const minIncrement = car.currentBid < 1000 ? 50 : car.currentBid < 5000 ? 100 : 250;
                    const nextBid = car.currentBid + minIncrement;
                    // Find location mapping (fallback to first if unknown)
                    const loc = MOCK_LOCATIONS.find(l => car.location.includes(l.state)) || MOCK_LOCATIONS[0];
                    const result = calculateTotalCost(
                      nextBid,
                      VehicleType.SEDAN, // Default for now
                      loc,
                      'LIBYA',
                      'KHOMS',
                      10
                    );

                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">قيمة المزايدة (التي تحددها)</span>
                          <span className="font-mono font-bold">${nextBid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">رسوم المشتري (Copart/IAAI)</span>
                          <span className="font-mono font-bold">${result.auctionFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">الشحن واللوجستيات</span>
                          <span className="font-mono font-bold">${(result.inlandFreight + result.oceanFreight).toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                          <span className="text-sm font-black text-white">التكلفة الإجمالية الواصلة</span>
                          <span className="text-lg font-black font-mono text-orange-500">${result.total.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 italic mt-2">
                          <MapPin className="w-3 h-3" />
                          <span>الشحن من {loc.name} إلى ميناء الخمس (1,200$ تقديري)</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">الضرر</span>
                  <span className="font-medium text-orange-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {car.primaryDamage}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">العداد</span>
                  <span className="font-mono font-medium">{car.odometer.toLocaleString()} mi</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">الوثيقة</span>
                  <span className="font-medium">{car.titleType}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">الموقع</span>
                  <span className="font-medium">{car.location}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
