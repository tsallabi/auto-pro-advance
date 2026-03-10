import React from 'react';
import { Car } from '../types';
import { Clock, MapPin, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CarCardProps {
  car: Car;
  onClick: (car: Car) => void;
  onJoinLive?: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onClick, onJoinLive }) => {
  const { watchlist, toggleWatchlist } = useStore();
  const isLive = car.status === 'live';
  const isFavorite = watchlist.some((w) => w.carId === car.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(car.id);
  };

  return (
    <div
      onClick={() => onClick(car)}
      className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-100 cursor-pointer group flex flex-col hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={car.images[0]}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* === HOVER OVERLAY BUTTONS (ACV Style) === */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end items-center pb-4 px-4 gap-2 z-10">
          {car.status === 'live' ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onJoinLive?.(car); }}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm"
              >
                زايد ${(car.currentBid ? car.currentBid + 100 : 0).toLocaleString()} (Bid)
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClick(car); }}
                className="w-full bg-[#D14900] hover:bg-[#b03d00] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 text-sm"
              >
                مزايدة آلية (Set Proxy)
              </button>
            </>
          ) : (car.status === 'offer_market' || car.status === 'closed') ? (
            <button
              onClick={(e) => { e.stopPropagation(); onClick(car); }}
              className="w-full bg-[#D14900] hover:bg-[#b03d00] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 text-sm"
            >
              قدم عرضاً (Make Offer)
            </button>
          ) : null}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          {car.status === 'live' && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              مزاد مباشر
            </div>
          )}
          {car.status === 'offer_market' && (
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              سوق العروض
            </div>
          )}
          {car.status === 'upcoming' && (
            <div className="glass-dark text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-2 shadow-lg">
              <Clock className="w-3 h-3 text-accent-500" />
              قريباً
            </div>
          )}

          <button
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md ${isFavorite
              ? 'bg-red-500 text-white shadow-red-500/40'
              : 'bg-white/90 text-slate-400 hover:text-red-500 shadow-slate-900/10'
              }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Lot Number */}
        <div className="absolute bottom-3 left-3 glass-dark text-white/90 px-3 py-1 rounded-lg text-[10px] font-mono tracking-tighter border border-white/5 z-20">
          #{car.lotNumber}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
          {car.year} {car.make} {car.model}
        </h3>

        <div className="flex items-center gap-2 text-slate-400 text-[13px] mb-4">
          <MapPin className="w-3.5 h-3.5 text-accent-500" />
          <span className="font-medium">{car.location}</span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1 font-bold">الضرر</span>
            <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              {car.primaryDamage}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1 font-bold">اللقب</span>
            <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs text-green-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              {car.titleType}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1 font-bold">العداد</span>
            <span className="font-bold text-slate-700 font-mono text-sm">{car.odometer.toLocaleString()} <small className="text-[10px]">MI</small></span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1 font-bold">المحرك</span>
            <span className="font-bold text-slate-700 text-xs">{car.engine}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
          <div>
            <span className="text-slate-400 block text-xs mb-1">
              {car.status === 'offer_market' ? 'آخر سعر (Last Bid)' : 'المزايدة الحالية'}
            </span>
            <div className={`text-2xl font-bold font-mono ${car.status === 'offer_market' ? 'text-blue-600' : 'text-slate-900'}`}>
              ${(car.currentBid || 0).toLocaleString()}
            </div>
          </div>
          <button className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${car.status === 'live'
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : car.status === 'offer_market'
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}>
            {car.status === 'live' ? 'زايد الآن' :
              car.status === 'offer_market' ? 'قدم عرضاً' : 'عرض التفاصيل'}
          </button>
        </div>
      </div>
    </div>
  );
};
