import React from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

// ============================================================
// IbanUpdateCard - Update seller's IBAN for withdrawals
// ============================================================
export const IbanUpdateCard: React.FC<{ currentUser: any; showAlert: any }> = ({ currentUser, showAlert }) => {
    const [iban, setIban] = React.useState(currentUser?.iban || '');
    const [bankName, setBankName] = React.useState(currentUser?.bankName || '');
    const [saving, setSaving] = React.useState(false);

    const handleSave = async () => {
        if (!iban.trim()) { showAlert('الرجاء إدخال رقم IBAN', 'danger'); return; }
        setSaving(true);
        try {
            const res = await fetch(`/api/seller/wallet/${currentUser?.id}/iban`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ iban: iban.trim(), bankName: bankName.trim() })
            });
            if (res.ok) {
                showAlert('✅ تم حفظ بيانات الحساب البنكي بنجاح', 'success');
            } else {
                const err = await res.json();
                showAlert(err.error || 'فشل حفظ البيانات', 'danger');
            }
        } catch { showAlert('خطأ في الاتصال'); }
        finally { setSaving(false); }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                بيانات الحساب البنكي (IBAN)
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-6 bg-amber-50 border border-amber-100 rounded-xl p-3">
                ⚠️ يجب إدخال IBAN صحيح قبل طلب سحب الأرباح. تأكد من صحة البيانات لتجنب تأخير التحويل.
            </p>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">رقم IBAN</label>
                    <input
                        type="text" value={iban}
                        onChange={e => setIban(e.target.value)}
                        placeholder="LY00 0000 0000 0000 0000 0000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono font-bold text-slate-800 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">اسم البنك</label>
                    <input
                        type="text" value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        placeholder="مثال: بنك التجارة والتنمية"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    />
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60">
                    {saving ? '⏳ جاري الحفظ...' : '💾 حفظ البيانات البنكية'}
                </button>
            </div>
        </div>
    );
};

// ============================================================
// KycUploadCard - Upload KYC verification documents
// ============================================================
export const KycUploadCard: React.FC<{ currentUser: any; showAlert: any }> = ({ currentUser, showAlert }) => {
    const [uploading, setUploading] = React.useState(false);
    const [uploadedDocs, setUploadedDocs] = React.useState<string[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowed.includes(file.type)) { showAlert('يُسمح فقط بملفات JPG، PNG، PDF', 'danger'); return; }
        if (file.size > 5 * 1024 * 1024) { showAlert('حجم الملف يجب أن يكون أقل من 5MB', 'danger'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('userId', currentUser?.id || '');
            formData.append('docType', 'kyc');
            const res = await fetch('/api/upload/document', { method: 'POST', body: formData });
            if (res.ok) {
                setUploadedDocs(prev => [...prev, file.name]);
                showAlert(`✅ تم رفع "${file.name}" بنجاح! سيراجعه الفريق قريباً.`, 'success');
            } else {
                const err = await res.json();
                showAlert(err.error || 'فشل رفع الملف', 'danger');
            }
        } catch { showAlert('خطأ في رفع الملف'); }
        finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const docs = [
        { label: 'جواز سفر / بطاقة هوية', icon: '🪪', note: 'صورة واضحة للوجهين' },
        { label: 'إثبات العنوان (فاتورة)', icon: '🏠', note: 'لا يتجاوز تاريخها 3 أشهر' },
        { label: 'رخصة تجارية (للشركات)', icon: '🏢', note: 'اختياري للأفراد' },
    ];

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <h3 className="font-black text-xl text-slate-800 mb-2">📋 رفع وثائق التوثيق (KYC)</h3>
            <p className="text-sm text-slate-500 mb-6">لتفعيل سحب الأرباح، نحتاج التحقق من هويتك. يُرجى رفع الوثائق التالية:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {docs.map((doc, i) => (
                    <div key={i} className={`p-4 rounded-2xl border-2 transition-all ${uploadedDocs.length > i ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="text-2xl mb-2">{doc.icon}</div>
                        <div className="font-black text-sm text-slate-800 mb-1">{doc.label}</div>
                        <div className="text-xs text-slate-400">{doc.note}</div>
                        {uploadedDocs.length > i && <div className="mt-2 text-xs font-black text-emerald-600">✅ تم الرفع</div>}
                    </div>
                ))}
            </div>
            <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${uploading ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-orange-400 hover:bg-orange-50/50'}`}
            >
                <input id="kyc-file-upload" aria-label="رفع وثيقة" ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleUpload} className="hidden" title="رفع وثيقة" placeholder="رفع وثيقة" />
                {uploading ? (
                    <div className="space-y-2">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="font-black text-orange-600">جاري الرفع...</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <UploadCloud className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="font-black text-slate-700">اضغط لاختيار ملف</p>
                        <p className="text-xs text-slate-400">JPG، PNG، PDF — حتى 5MB</p>
                    </div>
                )}
            </div>
            {uploadedDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                    {uploadedDocs.map((name, i) => (
                        <div key={i} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold">
                            <CheckCircle2 className="w-4 h-4" /> {name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
