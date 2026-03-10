import React, { useState } from 'react';
import { Search, Filter, Calculator as CalcIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [brand, setBrand] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (brand !== 'all') params.append('make', brand);
    navigate(`/marketplace?${params.toString()}`);
  };

  return (
    <div className="relative bg-slate-900 pt-16 pb-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Cars"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-float">
          المستقبل في شراء <span className="text-gradient font-extrabold italic">السيارات المصدومة</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          وداعاً للرسوم المخفية والتعقيدات. نوفر لك وصولاً مباشراً لمزادات كوبارت و IAAI بشفافية تامة، وتجربة مستخدم لا مثيل لها.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link
            to="/calculator"
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-xl transition-all shadow-xl shadow-orange-500/30 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <CalcIcon className="w-6 h-6" />
            الآلة الحاسبة
          </Link>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl font-black text-xl transition-all backdrop-blur-md border border-white/10"
          >
            ابدأ المزايدة
          </button>
        </div>

        {/* Search Box */}
        <div className="glass-dark p-6 rounded-3xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 border border-white/10">
          <div className="flex-1 flex items-center bg-slate-100/10 rounded-xl px-4 py-3 border border-white/10 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="ابحث برقم اللوت، رقم الشاصي (VIN)، أو نوع السيارة..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-slate-400 focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="flex gap-2">
            <select
              aria-label="اختر ماركة السيارة"
              className="bg-slate-800/50 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500 cursor-pointer backdrop-blur-md"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="all">كل الماركات</option>
              <option value="toyota">تويوتا</option>
              <option value="lexus">لكزس</option>
              <option value="mercedes">مرسيدس</option>
              <option value="bmw">بي ام دبليو</option>
            </select>

            <button
              aria-label="تصفية النتائج"
              className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-colors flex items-center justify-center border border-white/10"
              onClick={handleSearch}
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/30"
            >
              بحث
            </button>
          </div>
        </div>
        ...

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>+300,000 سيارة متاحة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>رسوم شفافة 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>شحن دولي متكامل</span>
          </div>
        </div>
      </div>
    </div>
  );
};
