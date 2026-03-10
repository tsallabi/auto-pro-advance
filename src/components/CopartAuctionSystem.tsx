import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Search, Filter, RefreshCw, ChevronRight, Car as CarIcon, Calendar, Gauge, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export const CopartAuctionSystem = () => {
  const { csvData, setCsvData, showAlert } = useStore();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  // Dynamic headers for filtering
  const headers = useMemo(() => {
    if (csvData.length === 0) return [];
    const importantHeaders = ['Make', 'Model', 'Year', 'Damage Description', 'Document Type', 'Location city'];
    return importantHeaders.filter(h => csvData[0].hasOwnProperty(h));
  }, [csvData]);

  // Unique values for each filter dropdown
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    headers.forEach(header => {
      const uniqueValues = Array.from(new Set(csvData.map(item => item[header]).filter(Boolean)));
      options[header] = uniqueValues.sort() as string[];
    });
    return options;
  }, [csvData, headers]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true, // Use worker for large files
      complete: (results) => {
        setCsvData(results.data);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        setIsLoading(false);
        showAlert('حدث خطأ أثناء تحميل الملف. يرجى التأكد من أنه ملف CSV صالح.');
      }
    });
  };

  const filteredData = useMemo(() => {
    return csvData.filter(item => {
      const matchesSearch = !searchTerm || 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key] === value;
      });

      return matchesSearch && matchesFilters;
    });
  }, [csvData, searchTerm, filters]);

  // Infinite scroll logic
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < filteredData.length) {
        setVisibleCount(prev => prev + 20);
      }
    });

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }
  }, [visibleCount, filteredData.length]);

  const displayedData = useMemo(() => filteredData.slice(0, visibleCount), [filteredData, visibleCount]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Sync */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">نظام مزادات كوبارت (Copart System)</h2>
          <p className="text-slate-500 text-sm mt-1">إدارة ومزامنة بيانات السيارات من ملفات CSV الضخمة</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'جاري المزامنة...' : 'مزامنة البيانات (Sync)'}
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={isLoading} />
          </label>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="البحث عن سيارة (ماركة، موديل، VIN...)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {headers.map(header => (
            <div key={header} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">{header}</label>
              <select aria-label="تحديد" title="تحديد"  
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-orange-500 transition-all"
                value={filters[header] || ''}
                onChange={e => setFilters(prev => ({ ...prev, [header]: e.target.value }))}
              >
                <option value="">الكل</option>
                {filterOptions[header]?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Car List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedData.map((car, index) => (
          <div 
            key={index}
            ref={index === displayedData.length - 1 ? lastElementRef : null}
            onClick={() => navigate(`/car-details/${index}`, { state: { car } })}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={car['Image Thumbnail'] || (car['Image URL'] ? String(car['Image URL']).split(/[,;\s\n]/).filter(Boolean)[0] : '') || 'https://picsum.photos/seed/car/400/300'} 
                alt={car.Make}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/car/400/300';
                }}
              />
              <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                {car['Sale Title State'] || 'AVAILABLE'}
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800 line-clamp-1">
                  {car.Year} {car.Make} {car['Model Group']}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-orange-500" />
                  <span>{car.Odometer} mi</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  <span className="truncate">{car['Location city']}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="text-xs font-bold text-slate-400">Est. Retail Value</div>
                <div className="text-lg font-black text-orange-600">${Number(car['Est. Retail Value'] || 0).toLocaleString()}</div>
              </div>

              <button className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-orange-500 transition-colors">
                عرض التفاصيل
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}

      {!isLoading && filteredData.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CarIcon className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">لا توجد سيارات مطابقة</h3>
          <p className="text-slate-500 text-sm">يرجى تغيير الفلاتر أو تحميل ملف بيانات جديد</p>
        </div>
      )}
    </div>
  );
};
