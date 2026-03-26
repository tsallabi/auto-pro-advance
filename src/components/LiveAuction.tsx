import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../types';
import { Gavel, Users, Clock, AlertCircle, CheckCircle2, ArrowUp, DollarSign, Calculator as CalcIcon, Info, MapPin, X, FileText, Gauge, MonitorPlay } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { calculateTotalCost, MOCK_LOCATIONS } from '../services/calculatorService';
import { VehicleType } from '../types/calculator';

import { useTranslation } from 'react-i18next';

import { UpcomingCarsQueue } from './UpcomingCarsQueue';

interface LiveAuctionProps {
  car: Car;
  upcomingCars: Car[];
  onBack: () => void;
}

export const LiveAuction: React.FC<LiveAuctionProps> = ({ car, upcomingCars, onBack }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { socket, currentUser, placeBid, showAlert, exchangeRate } = useStore();
  const [currentBid, setCurrentBid] = useState(car.currentBid || 0);
  const [bidders, setBidders] = useState(12);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showAntiSniping, setShowAntiSniping] = useState(false);
  const [maxBid, setMaxBid] = useState<number | ''>('');
  const [isProxySet, setIsProxySet] = useState(false);
  const [ultimoEndTime, setUltimoEndTime] = useState<string | null>(null);
  const [isUltimo, setIsUltimo] = useState(car.status === 'ultimo');
  const [bidHistory, setBidHistory] = useState<{ amount: number, user: string, time: string, country?: string }[]>([
    { amount: car.currentBid || 0, user: 'UAE_Dealer_88', time: t('liveAuction.now'), country: 'UAE' },
  ]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllBids, setShowAllBids] = useState(false);
  const [quickViewCar, setQuickViewCar] = useState<Car | null>(null);
  const [leadingUserId, setLeadingUserId] = useState<string | null>(null);
  const [outbidFlash, setOutbidFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTvMode, setIsTvMode] = useState(false);

  const toggleTvMode = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Error toggling fullscreen', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsTvMode(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  const playVoice = React.useCallback((type: 'bid' | 'win' | 'outbid' | 'tick') => {
    const audios = {
      bid: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', // Cashing
      win: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', // Win/Success
      outbid: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Buzzer/Loss
      tick: 'https://assets.mixkit.co/active_storage/sfx/2816/2816-preview.mp3' // Tick Tock
    };
    const audio = new Audio(audios[type]);
    audio.volume = type === 'tick' ? 0.3 : 0.6;
    audio.play().catch(() => { }); // Ignore autoplay blocks
    return audio;
  }, []);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    try {
      let videoId = '';
      if (url.includes('youtube.com/watch')) {
        videoId = new URL(url).searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch (e) {
      return url;
    }
  };

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

  // Audio effects removed in favor of SpeechSynthesis.

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

    // We no longer rely on 'timer_update'. State is driven locally below via car.auctionEndDate.

    socket.on('bid_updated', (data) => {
      if (data.carId === car.id) {
        setCurrentBid(data.currentBid);
        setBidHistory(prev => [
          {
            amount: data.currentBid,
            user: data.userId === currentUser?.id ? t('liveAuction.you') : `${t('liveAuction.bidder')}${data.userId.slice(-4)}`,
            time: t('liveAuction.now'),
            country: data.country
          },
          ...prev
        ]);

        setLeadingUserId((prevLeader) => {
          if (data.userId === currentUser?.id) {
            // I just became the highest bidder
            playVoice('win');
          } else {
            if (prevLeader === currentUser?.id) {
              // I was the highest bidder and just lost it
              playVoice('outbid');
              setOutbidFlash(true);
              setTimeout(() => setOutbidFlash(false), 800);
            } else {
              playVoice('bid'); // Neutral bid placed by someone else
            }
          }
          return data.userId;
        });
      }
    });
    socket.on('auction_closed', (data) => {
      if (data.carId === car.id) {
        setTimeLeft(0);
        showAlert(t('liveAuction.auctionEnded'), 'info');
      }
    });

    socket.on('proxy_bid_set', (data) => {
      if (data.carId === car.id) {
        setIsProxySet(true);
        showAlert(`${t('liveAuction.proxySet')}${data.maxAmount}`, 'success');
      }
    });

    socket.on('ultimo_started', (data) => {
      if (data.carId === car.id) {
        setIsUltimo(true);
        setUltimoEndTime(data.ultimoEndTime);
        showAlert(data.winnerId === currentUser?.id ? t('liveAuction.ultimoWinnerMsg') : t('liveAuction.ultimoOthersMsg'), 'info');
      }
    });

    return () => {
      socket.off('bid_updated');
      socket.off('auction_closed');
    };
  }, [socket, car.id, currentUser?.id, showAlert]);

  // Unified Local Ticker explicitly tied strictly to the absolute UTC target set on the backend
  useEffect(() => {
    if (car.status !== 'live' || !car.auctionEndDate) {
      if (car.status === 'closed' || car.status === 'offer_market') {
        setTimeLeft(0);
      }
      return;
    }

    const validateTime = () => {
      const targetTime = new Date(car.auctionEndDate!).getTime();
      const remainingSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));

      setTimeLeft(prev => {
        // Detect if time extended (anti-sniping via chronological shifts backwards)
        if (remainingSeconds > prev + 5 && prev !== 0) {
          setShowAntiSniping(true);
          setTimeout(() => setShowAntiSniping(false), 3000);
        }
        return remainingSeconds;
      });
    };

    validateTime(); // initial run
    const interval = setInterval(validateTime, 1000);
    return () => clearInterval(interval);
  }, [car.auctionEndDate, car.status]);

  const nextBidAmount = (currentBid || 0) + 100;

  /* ── bidding eligibility ── */
  const canBid = !!currentUser && (currentUser.buyingPower ?? 0) >= nextBidAmount;
  const bidBlockReason = !currentUser
    ? t('liveAuction.loginToBid')
    : (currentUser.buyingPower ?? 0) < nextBidAmount
      ? t('liveAuction.insufficientPower', { power: (currentUser.buyingPower ?? 0).toLocaleString(), amount: nextBidAmount.toLocaleString() })
      : null;

  const handleBid = () => {
    if (!canBid) {
      showAlert(bidBlockReason || t('liveAuction.notEligible'), 'error');
      return;
    }
    placeBid(car.id, nextBidAmount, currentUser!.id);
  };

  return (
    <div
      ref={containerRef}
      className={`bg-slate-950 min-h-screen text-white selection:bg-accent-500/30 transition-all duration-300 ${outbidFlash ? 'shadow-[inset_0_0_150px_rgba(239,68,68,0.3)] bg-slate-900 border-x-4 border-red-500' : ''} ${isTvMode ? 'p-6 fixed inset-0 z-[9999] overflow-hidden flex flex-col' : 'pt-20 pb-12'}`}
      dir="rtl"
    >
      <div className={`mx-auto w-full ${isTvMode ? 'max-w-[1920px] h-full flex flex-col' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>

        {/* Header */}
        <div className={`flex items-start justify-between mb-6 ${isTvMode ? 'animate-in slide-in-from-top' : ''}`}>
          <div className="flex flex-col gap-4">
            {/* Row 1: Back button */}
            {!isTvMode && (
              <button aria-label={t('liveAuction.backToList')} title={t('liveAuction.backToList')} onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors w-fit">
                &rarr; {t('liveAuction.backToList')}
              </button>
            )}

            {/* Row 2: Bidders & Lot Pill */}
            <div className={`glass-dark px-6 py-3 rounded-2xl flex items-center justify-between md:justify-start gap-4 md:gap-6 border border-white/5 shadow-2xl w-full ${isTvMode ? '' : 'md:w-max'}`}>
              <div className="flex items-center gap-2 text-slate-300 text-sm md:text-base">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                <span className="font-bold font-mono">{bidders}</span> {t('liveAuction.biddersCount')}
              </div>
              <div className="w-px h-6 bg-slate-700"></div>
              <div className="flex items-center gap-2 text-slate-300 text-sm md:text-base">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                <span className="font-mono">{car.lotNumber}</span> {t('liveAuction.lot')}
              </div>
            </div>

            {/* Row 3: Title */}
            <h1 className={`${isTvMode ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-4xl'} font-bold flex items-start flex-col gap-1 mt-2 leading-tight`}>
              <span className={`text-orange-500 ${isTvMode ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'} font-black mb-1 flex items-center gap-3`}>
                <span className={`bg-red-500 rounded-full animate-pulse shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.8)] ${isTvMode ? 'w-5 h-5' : 'w-3 h-3 md:w-4 md:h-4'}`}></span>
                {t('liveAuction.liveAuctionLabel')}
              </span>
              <span className="text-white">
                {car.year} {car.make} {car.model}
              </span>
            </h1>
          </div>

          {/* TV Toggle Button */}
          <button
            onClick={toggleTvMode}
            className={`glass-dark border border-white/10 px-6 py-4 rounded-2xl hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-2 group shadow-2xl shrink-0 ${isTvMode ? 'opacity-30 hover:opacity-100 absolute top-6 left-6 z-50' : ''}`}
          >
            <MonitorPlay className={`w-8 h-8 transition-colors ${isTvMode ? 'text-orange-500' : 'text-slate-400 group-hover:text-white'}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
              {isTvMode ? 'إنهاء العرض' : 'عرض تلفزيوني'}
            </span>
          </button>
        </div>

        <div className={`grid gap-6 ${isTvMode ? 'grid-cols-1 lg:grid-cols-4 h-full flex-grow pb-4' : 'lg:grid-cols-3'}`}>

          {/* Main View - Video/Image & Controls */}
          <div className={`flex flex-col gap-6 ${isTvMode ? 'lg:col-span-3 h-full' : 'lg:col-span-2'}`}>
            {/* Image/Video Area */}
            <div className={`bg-slate-900 rounded-[2.5rem] relative overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] group ${isTvMode ? 'h-full min-h-[60vh] flex-grow' : 'aspect-[16/9] lg:aspect-video max-h-[50vh] 2xl:max-h-[45vh]'}`}>
              {/* Background Image Slider */}
              <div className="absolute inset-0">
                <img
                  src={(car.images && car.images.length > 0) ? (car.images[selectedImageIndex] || car.images[0]) : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'}
                  alt={car.model}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800' }}
                  className="w-full h-full object-cover transition-opacity duration-1000 text-transparent"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              </div>

              {/* Gallery Indicator */}
              <div className="absolute top-6 right-6 flex gap-1">
                {(car.images || []).slice(0, 10).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${idx === selectedImageIndex ? 'w-6 bg-accent-500' : 'w-2 bg-white/20'}`}
                  ></div>
                ))}
              </div>

              {/* Price Barometer */}
              <div className="absolute bottom-6 right-6 left-6 glass-dark p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('liveAuction.priceBarometer')}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${currentBid >= (car.reservePrice || 0) ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                    currentBid >= (car.reservePrice || 0) * 0.9 ? 'bg-orange-500 text-white animate-pulse' :
                      currentBid >= (car.reservePrice || 0) * 0.7 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {currentBid >= (car.reservePrice || 0) ? t('liveAuction.priceMet') :
                      currentBid >= (car.reservePrice || 0) * 0.9 ? t('liveAuction.hot') :
                        currentBid >= (car.reservePrice || 0) * 0.7 ? t('liveAuction.warm') : t('liveAuction.cold')}
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
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">{t('liveAuction.timeLeft')}</div>
                <div className={`text-4xl font-black font-mono tracking-tighter ${timeLeft <= 5 && !isUltimo ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {isUltimo ? (
                    (() => {
                      const diff = Math.max(0, Math.floor((new Date(ultimoEndTime || '').getTime() - Date.now()) / 1000));
                      const m = Math.floor(diff / 60);
                      const s = diff % 60;
                      return `${m}:${s.toString().padStart(2, '0')}`;
                    })()
                  ) : (() => {
                    const h = Math.floor(timeLeft / 3600);
                    const m = Math.floor((timeLeft % 3600) / 60);
                    const s = timeLeft % 60;
                    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                  })()}
                </div>
                {showAntiSniping && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-orange-500 text-white text-[10px] font-bold py-1 px-3 rounded-full text-center animate-bounce shadow-lg shadow-orange-500/40">
                    {t('liveAuction.antiSniping')}
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{t('liveAuction.engineRuns')}</span>
              </div>
            </div>

            {/* Bidding Controls */}
            {!isTvMode ? (
              <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 blur-[100px] -mr-32 -mt-32"></div>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <div className="text-slate-400 mb-1">{t('liveAuction.highestBid')}</div>
                    <div className="text-5xl font-bold text-green-400 font-mono tracking-tight">
                      ${(currentBid || 0).toLocaleString()}
                      <span className="text-lg text-slate-500 block mt-1 tracking-normal font-sans">≈ {Math.round((currentBid || 0) * (exchangeRate || 7)).toLocaleString('en-US')} د.ل</span>
                    </div>
                  </div>

                  {/* Total Fee Calculator (Basic Version) */}
                  <div className="text-right glass-dark p-3 rounded-xl border border-white/5 min-w-[200px]">
                    <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-tighter">{t('liveAuction.estFinalCost')}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">{t('liveAuction.yourBid')}</span>
                        <span className="font-mono">${((currentBid || 0) + 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between gap-4 font-black text-orange-400 border-t border-white/5 pt-1 mt-1">
                        <span>{t('liveAuction.totalPlusFees')}</span>
                        <span className="font-mono">${(((currentBid || 0) + 100) * 1.115).toLocaleString()}</span>
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
                      <a href="/auth" aria-label={t('liveAuction.registerNow')} title={t('liveAuction.registerNow')} className="mr-auto shrink-0 bg-orange-500 hover:bg-orange-400 text-white text-xs font-black px-4 py-1.5 rounded-lg transition-colors">
                        {t('liveAuction.registerNow')}
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
                    {isUltimo ? t('liveAuction.closeDealReserve') : `${t('liveAuction.bidWith')}${nextBidAmount.toLocaleString()}`}
                  </button>
                  <div className="col-span-2 md:col-span-1 bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col gap-2">
                    <input
                      type="number"
                      value={maxBid}
                      onChange={(e) => setMaxBid(Number(e.target.value))}
                      placeholder={t('liveAuction.maxLimit')}
                      className="bg-transparent text-white text-center font-mono text-sm outline-none w-full"
                    />
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          showAlert(t('liveAuction.loginProxy'), 'error');
                          return;
                        }
                        if (maxBid && maxBid > currentBid) {
                          socket?.emit('set_proxy_bid', { carId: car.id, userId: currentUser?.id, maxAmount: maxBid });
                        } else {
                          showAlert(t('liveAuction.maxHigherThanCurrent'), 'error');
                        }
                      }}
                      className={`text-[10px] font-bold py-1 px-2 rounded-md transition-all ${isProxySet ? 'bg-accent-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {isProxySet ? t('liveAuction.updateProxy') : t('liveAuction.activateProxy')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 flex items-center justify-between shadow-2xl mt-auto">
                <div className="text-slate-400 text-2xl font-black uppercase tracking-widest">{t('liveAuction.highestBid')}</div>
                <div className="text-6xl md:text-7xl lg:text-8xl font-black text-green-400 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] flex flex-col items-end">
                  ${(currentBid || 0).toLocaleString()}
                  <span className="text-2xl md:text-3xl text-slate-500 tracking-normal font-sans drop-shadow-none">≈ {Math.round((currentBid || 0) * (exchangeRate || 7)).toLocaleString('en-US')} د.ل</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - History & Info */}
          <div className="flex flex-col gap-6">

            {/* Bid History */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex-grow flex flex-col">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-slate-400" />
                {t('liveAuction.bidHistory')}
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
                      <>{t('liveAuction.hideExtraHistory')}</>
                    ) : (
                      <>{t('liveAuction.showExtraBids', { count: bidHistory.length - 5 })}</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Specs */}
            {!isTvMode && (
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-4">{t('liveAuction.quickSpecs')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                        <CalcIcon className="w-4 h-4 text-orange-500" />
                        {t('liveAuction.transparentFeeCalc')}
                      </h3>
                      <div className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">{t('liveAuction.exactFees')}</div>
                    </div>

                    {(() => {
                      const minIncrement = (car.currentBid || 0) < 1000 ? 50 : (car.currentBid || 0) < 5000 ? 100 : 250;
                      const nextBid = (car.currentBid || 0) + minIncrement;
                      // Find location mapping (fallback to first if unknown)
                      const loc = MOCK_LOCATIONS.find(l => (car.location || '').includes(l.state)) || MOCK_LOCATIONS[0];
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
                            <span className="text-slate-500">{t('liveAuction.bidValue')}</span>
                            <span className="font-mono font-bold">${nextBid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">{t('liveAuction.buyerFee')}</span>
                            <span className="font-mono font-bold">${result.auctionFee.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">{t('liveAuction.shippingLogistics')}</span>
                            <span className="font-mono font-bold">${(result.inlandFreight + result.oceanFreight).toLocaleString()}</span>
                          </div>
                          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                            <span className="text-sm font-black text-white">{t('liveAuction.totalCostLanded')}</span>
                            <span className="text-lg font-black font-mono text-orange-500">${result.total.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 italic mt-2">
                            <MapPin className="w-3 h-3" />
                            <span>{t('liveAuction.shippingFromTo', { from: loc.name })}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">{t('liveAuction.damage')}</span>
                    <span className="font-medium text-orange-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {car.primaryDamage}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">{t('liveAuction.odometer')}</span>
                    <span className="font-mono font-medium">{(car.odometer || 0).toLocaleString()} mi</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">{t('liveAuction.document')}</span>
                    <span className="font-medium">{car.titleType}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">{t('liveAuction.location')}</span>
                    <span className="font-medium">{car.location}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Media & Inspection */}
          {(car.youtubeVideoUrl || car.engineSoundUrl || car.inspectionReportUrl) && (
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" /> {t('liveAuction.mediaAndInspection', 'الوسائط والفحص')}
              </h3>
              <div className="space-y-4">
                {car.youtubeVideoUrl && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                    <iframe
                      title="فيديو السيارة"
                      src={getYoutubeEmbedUrl(car.youtubeVideoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                {car.engineSoundUrl && (
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-orange-500" /> صوت المحرك
                    </div>
                    <audio controls className="w-full h-8 outline-none" src={car.engineSoundUrl} />
                  </div>
                )}
                {car.inspectionReportUrl && (
                  <a
                    href={car.inspectionReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 bg-slate-700/50 hover:bg-orange-500/20 text-orange-400 rounded-xl text-sm font-bold border border-white/5 hover:border-orange-500/30 transition-all"
                  >
                    عرض تقرير الفحص (PDF)
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Cars Queue */}
        {!isTvMode && (
          <UpcomingCarsQueue
            cars={upcomingCars}
            currentAuctionTimeLeft={timeLeft}
            onCarSelect={setQuickViewCar}
          />
        )}
      </div>

      {/* Quick View Side Panel for Upcoming Cars */}
      {quickViewCar && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[201]" onClick={() => setQuickViewCar(null)}></div>
          <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-slate-900 border-l border-white/10 shadow-2xl z-[202] transform transition-transform animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl">
              <h3 className="font-bold text-lg text-white">{t('liveAuction.specsDetails')}</h3>
              <button title="إغلاق" onClick={() => setQuickViewCar(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-2xl">
                <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold font-mono text-white tracking-widest">
                  LOT {quickViewCar.lotNumber}
                </div>
                <img src={(quickViewCar.images && quickViewCar.images.length > 0) ? quickViewCar.images[0] : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'} alt={quickViewCar.model} className="w-full h-full object-cover" />
              </div>

              <div className="flex justify-between items-start mb-8 w-full">
                <div className="flex-1 overflow-hidden pr-4">
                  <div className="text-2xl font-black text-white truncate" title={quickViewCar.make}>{quickViewCar.make}</div>
                  <div className="text-slate-400 text-base font-bold truncate leading-tight mt-1" title={quickViewCar.model}>{quickViewCar.model}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-mono font-black text-white">${(quickViewCar.currentBid || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">MSRP / Est. Retail</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-slate-800 p-4 rounded-xl border border-white/5 text-center hover:bg-slate-700 transition-colors">
                  <div className="text-lg font-black text-white mb-1 font-mono">{quickViewCar.engine || '3.5L'}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('liveAuction.engine')}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-white/5 text-center hover:bg-slate-700 transition-colors">
                  <div className="text-lg font-black text-white mb-1 font-mono">{quickViewCar.titleType || 'Clean'}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('liveAuction.titleDoc')}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-white/5 text-center hover:bg-slate-700 transition-colors">
                  <div className="text-lg font-black text-white mb-1 font-mono">{(quickViewCar.odometer || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('liveAuction.miles')}</div>
                </div>
              </div>

              {quickViewCar.images && quickViewCar.images.length > 1 && (
                <div className="flex gap-3 mb-8 overflow-x-auto custom-scrollbar pb-2">
                  {quickViewCar.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} alt="" className="w-20 h-14 rounded-lg object-cover border border-white/10 shrink-0 hover:border-orange-500 transition-colors cursor-pointer" />
                  ))}
                </div>
              )}

              <button aria-label={t('liveAuction.viewDetails')} title={t('liveAuction.viewDetails')} className="w-full py-4 bg-transparent border border-orange-500/50 hover:bg-orange-500/10 text-orange-400 rounded-xl font-black text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg" onClick={() => {
                navigate(`/car-details/${quickViewCar.id}`);
              }}>
                {t('liveAuction.viewDetails')}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
