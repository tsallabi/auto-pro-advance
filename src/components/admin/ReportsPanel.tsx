import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, DollarSign, Database, RefreshCw, BarChart, 
  Plus, Edit, Trash2, Filter, Search, Globe, Calculator, Zap
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportsPanelProps {
  reportsAnalytics: any;
  setReportsAnalytics: (val: any) => void;
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ reportsAnalytics, setReportsAnalytics }) => {
  const [libyanMarketPrices, setLibyanMarketPrices] = useState<any[]>([]);
  const [showLibyanModal, setShowLibyanModal] = useState(false);
  const [libyanModalForm, setLibyanModalForm] = useState({
    id: '', condition: 'جديد', make: '', makeEn: '', model: '', modelEn: '', year: 2024, transmission: 'اوتوماتيك', fuel: 'بنزين', mileage: '0', priceLYD: ''
  });
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/reports-analytics')
      .then(res => res.json())
      .then(data => setReportsAnalytics(data))
      .catch(e => console.error(e));

    fetch('/api/libyan-market')
      .then(res => res.json())
      .then(data => {
        setLibyanMarketPrices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [refresh, setReportsAnalytics]);

  const handleSaveLibyanMarket = async () => {
    const method = libyanModalForm.id ? 'PUT' : 'POST';
    const url = libyanModalForm.id ? `/api/libyan-market/${libyanModalForm.id}` : '/api/libyan-market';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(libyanModalForm)
      });
      if (res.ok) {
        setShowLibyanModal(false);
        setRefresh(r => r + 1);
        setLibyanModalForm({ id: '', condition: 'جديد', make: '', makeEn: '', model: '', modelEn: '', year: 2024, transmission: 'اوتوماتيك', fuel: 'بنزين', mileage: '0', priceLYD: '' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السعر؟')) return;
    try {
      const res = await fetch(`/api/libyan-market/${id}`, { method: 'DELETE' });
      if (res.ok) setRefresh(r => r + 1);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header Stats */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">التقارير التحليلية والذكاء التسويقي 📈</h2>
          <p className="text-slate-500 text-sm mt-1">نظرة شاملة لأداء المنصة ومؤشرات السوق</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setRefresh(r => r + 1)} title="تحديث البيانات" aria-label="تحديث البيانات" className="bg-slate-50 text-slate-600 p-3 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'المستخدمين النشطين', value: reportsAnalytics?.activeUsers || 0, color: 'blue', icon: Users },
          { label: 'إجمالي المزايدات', value: reportsAnalytics?.totalBids || 0, color: 'amber', icon: Zap },
          { label: 'حجم المبيعات (D)', value: `$${Number(reportsAnalytics?.salesVol || 0).toLocaleString()}`, color: 'emerald', icon: DollarSign },
          { label: 'دقة البيانات (Realtime)', value: '99.8%', color: 'purple', icon: Globe }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
            </div>
            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-500 rounded-3xl group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[120px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-black text-white flex items-center gap-3 italic">
                <BarChart className="w-6 h-6 text-orange-500" />
                توزع المبيعات حسب الدولة (النشاط الجغرافي)
              </h3>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={reportsAnalytics?.geoSalesRaw || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="country" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#fb923c', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Libyan Market Control */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">مؤشر السوق المحلي</h3>
              <p className="text-slate-400 text-[10px] font-bold mt-1">إضافة وتحديث أسعار السوق الليبي للمقارنة</p>
            </div>
            <button onClick={() => { setLibyanModalForm({ id: '', condition: 'جديد', make: '', makeEn: '', model: '', modelEn: '', year: 2024, transmission: 'اوتوماتيك', fuel: 'بنزين', mileage: '0', priceLYD: '' }); setShowLibyanModal(true); }} title="إضافة سعر جديد" aria-label="إضافة سعر جديد" className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg hover:scale-105 transition-all">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto max-h-[300px] space-y-3 no-scrollbar pr-1">
            {libyanMarketPrices.slice(0, 10).map((row, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-orange-200 transition-all">
                <div>
                  <div className="font-black text-slate-700 text-sm">{row.make} {row.model} ({row.year})</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">السعر: <span className="text-emerald-500">{Number(row.priceLYD).toLocaleString()} LYD</span></div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { setLibyanModalForm(row); setShowLibyanModal(true); }} title="تعديل" aria-label="تعديل" className="p-1.5 text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                   <button onClick={() => handleDelete(row.id)} title="حذف" aria-label="حذف" className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
             <button onClick={() => setRefresh(r => r + 1)} className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm uppercase">
               عرض كافة بيانات السوق
               <TrendingUp className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden mt-8">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tighter">قاعدة بيانات أسعار السوق الليبي</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">إجمالي الإدخالات النشطة: {libyanMarketPrices.length}</p>
              </div>
           </div>
           <div className="relative">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="بحث في الموديلات..." className="bg-white border border-slate-200 rounded-2xl py-2.5 pr-11 pl-4 text-xs font-bold w-64 focus:border-orange-500 outline-none transition-all shadow-sm" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="p-6">المركبة والموديل</th>
                <th className="p-6">الحالة</th>
                <th className="p-6">سنة الصنع</th>
                <th className="p-6">نظام الحركة</th>
                <th className="p-6">المسافة</th>
                <th className="p-6">السعر التقديري (LYD)</th>
                <th className="p-6 text-center">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {libyanMarketPrices.map((row) => (
                <tr key={row.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-slate-900 leading-none">{row.make} {row.model}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">{row.makeEn} {row.modelEn}</div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black border border-slate-200">{row.condition}</span>
                  </td>
                  <td className="p-6 font-mono font-bold text-slate-500">{row.year}</td>
                  <td className="p-6">
                    <div className="text-xs font-bold text-slate-700">{row.transmission}</div>
                    <div className="text-[10px] text-slate-400">{row.fuel}</div>
                  </td>
                  <td className="p-6 font-mono text-slate-500 text-xs">{row.mileage} KM</td>
                  <td className="p-6">
                    <div className="text-lg font-black text-emerald-600">{Number(row.priceLYD).toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">ليبيا - {row.city || 'طرابلس'}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setLibyanModalForm(row); setShowLibyanModal(true); }} title="تعديل التسعيرة" aria-label="تعديل التسعيرة" className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(row.id)} title="حذف التسعيرة" aria-label="حذف التسعيرة" className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {libyanMarketPrices.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">لا توجد تسعيرات متوفرة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model for adding/editing */}
      {showLibyanModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                      <Database className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{libyanModalForm.id ? 'تحديث بيانات السوق' : 'إضافة سعر جديد للسوق'}</h3>
                     <p className="text-slate-500 text-xs font-bold mt-1">أدخل بيانات المركبة بدقة لتحديث مؤشر الأسعار</p>
                   </div>
                </div>
                <button onClick={() => setShowLibyanModal(false)} title="إغلاق" aria-label="إغلاق" className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                  <Edit className="w-6 h-6 text-slate-400 rotate-45" />
                </button>
              </div>

              <div className="p-10 grid grid-cols-2 gap-6">
                 <div>
                   <label htmlFor="make-input" className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">نوع المركبة (براند)</label>
                   <input id="make-input" type="text" title="نوع المركبة" placeholder="مثال: تويوتا" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-orange-500" value={libyanModalForm.make} onChange={e => setLibyanModalForm({...libyanModalForm, make: e.target.value})} />
                 </div>
                 <div>
                   <label htmlFor="model-input" className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Model Name</label>
                   <input id="model-input" type="text" title="الموديل" placeholder="Example: Camry" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-orange-500 text-left" dir="ltr" value={libyanModalForm.model} onChange={e => setLibyanModalForm({...libyanModalForm, model: e.target.value})} />
                 </div>
                 <div>
                   <label htmlFor="year-input" className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">سنة الصنع</label>
                   <input id="year-input" type="number" title="السنة" placeholder="2024" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-orange-500" value={libyanModalForm.year} onChange={e => setLibyanModalForm({...libyanModalForm, year: parseInt(e.target.value)})} />
                 </div>
                 <div>
                   <label htmlFor="price-input" className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">السعر المستهدف (LYD)</label>
                   <input id="price-input" type="number" title="السعر" placeholder="0.00" className="w-full bg-slate-50 border-2 border-orange-100 rounded-2xl p-4 text-xl font-black text-orange-600 outline-none focus:border-orange-500" value={libyanModalForm.priceLYD} onChange={e => setLibyanModalForm({...libyanModalForm, priceLYD: e.target.value})} />
                 </div>
                 <div className="col-span-2 grid grid-cols-3 gap-4">
                    <select aria-label="حالة المركبة" title="حالة المركبة" className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black" value={libyanModalForm.condition} onChange={e => setLibyanModalForm({...libyanModalForm, condition: e.target.value})}>
                       <option value="جديد">جديد / صفر</option>
                       <option value="مستعمل">مستعمل (خالي صدمة)</option>
                       <option value="وارد أمريكا (حادث)">وارد أمريكا (حادث)</option>
                    </select>
                    <select aria-label="ناقل الحركة" title="ناقل الحركة" className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black" value={libyanModalForm.transmission} onChange={e => setLibyanModalForm({...libyanModalForm, transmission: e.target.value})}>
                       <option value="اوتوماتيك">اوتوماتيك</option>
                       <option value="عادي">عادي</option>
                    </select>
                    <input type="text" aria-label="المسافة المقطوعة" title="المسافة المقطوعة" placeholder="المسافة المقطوعة..." className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black" value={libyanModalForm.mileage} onChange={e => setLibyanModalForm({...libyanModalForm, mileage: e.target.value})} />
                 </div>
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                 <button onClick={handleSaveLibyanMarket} className="flex-grow bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-orange-500 transition-all active:scale-95">حفظ البيانات للسيارة</button>
                 <button onClick={() => setShowLibyanModal(false)} className="px-10 bg-white text-slate-500 font-bold py-5 rounded-3xl border border-slate-200 hover:bg-slate-100 transition-all">إلغاء</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
