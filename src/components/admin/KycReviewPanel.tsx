import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, UserX, Clock, MapPin, Phone, Mail, Building, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface KycReviewPanelProps {
  kycUsers: any[];
  setKycUsers: (users: any[]) => void;
  showAlert: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const KycReviewPanel: React.FC<KycReviewPanelProps> = ({ kycUsers, setKycUsers, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/kyc-pending')
      .then(res => res.json())
      .then(data => {
        setKycUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [refresh, setKycUsers]);

  const handleKycAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        showAlert(action === 'approve' ? 'تم توثيق الحساب بنجاح' : 'تم رفض طلب التوثيق', 'success');
        setRefresh(r => r + 1);
      } else {
        showAlert('فشلت العملية', 'error');
      }
    } catch (e) {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-violet-500" />
            مراجعة طلبات التوثيق (KYC Center)
          </h2>
          <p className="text-slate-500 font-bold text-sm mt-1">التحقق من الهوية، السجل التجاري، وعضوية التجار الجدد</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-violet-50 text-violet-600 px-6 py-3 rounded-2xl font-black text-sm border border-violet-100 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            بانتظار المراجعة: {kycUsers.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {kycUsers.length === 0 && (
          <div className="col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-400 italic">لا توجد طلبات توثيق معلقة حالياً</h3>
            <p className="text-slate-400 text-sm mt-2">سيظهر المشترون والتجار الجدد هنا بمجرد رفع مستنداتهم.</p>
          </div>
        )}

        {kycUsers.map((user: any) => (
          <div key={user.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-violet-300 transition-all overflow-hidden flex flex-col group">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl font-black text-violet-500 shadow-inner border-2 border-slate-100">
                     {user.firstName[0]}
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-800 tracking-tighter">{user.firstName} {user.lastName}</h3>
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                        <MapPin className="w-3 h-3" /> {user.country} | {user.office}
                     </div>
                   </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black text-slate-500 uppercase">
                  #{user.id.slice(-6)}
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 rounded-lg"><Phone className="w-4 h-4 text-slate-500" /></div>
                     <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">رقم الهاتف</div>
                        <div className="text-sm font-black text-slate-700">{user.phone}</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 rounded-lg"><Mail className="w-4 h-4 text-slate-500" /></div>
                     <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">البريد الإلكتروني</div>
                        <div className="text-sm font-black text-slate-700">{user.email}</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-100 rounded-lg"><Building className="w-4 h-4 text-slate-500" /></div>
                     <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">الشركة / الدور</div>
                        <div className="text-sm font-black text-slate-700">{user.companyName} | <span className="text-violet-600">{user.role}</span></div>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
                  <h4 className="text-xs font-black text-slate-400 mb-4 flex items-center gap-2">
                     <FileText className="w-4 h-4 text-violet-400" />
                     مستندات الهوية المرفوعة
                  </h4>
                  <div className="space-y-3">
                     <button className="w-full bg-white/5 hover:bg-white/10 p-3 rounded-2xl flex items-center justify-between transition-all border border-white/5">
                        <span className="text-[10px] font-bold">Passport / National ID</span>
                        <Download className="w-4 h-4 text-slate-500" />
                     </button>
                     <button className="w-full bg-white/5 hover:bg-white/10 p-3 rounded-2xl flex items-center justify-between transition-all border border-white/5">
                        <span className="text-[10px] font-bold">Trade License</span>
                        <Download className="w-4 h-4 text-slate-500" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="p-8 mt-auto bg-slate-50/50 border-t border-slate-100 flex gap-4">
               <button onClick={() => handleKycAction(user.id, 'approve')} className="flex-grow bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  اعتماد وتفعيل الحساب
               </button>
               <button onClick={() => handleKycAction(user.id, 'reject')} className="px-8 bg-white text-rose-600 font-black py-4 rounded-2xl border border-rose-100 hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                  <UserX className="w-5 h-5" />
                  رفض الطلب
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
