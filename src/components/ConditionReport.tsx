import React, { useState } from 'react';
import {
    ClipboardList, AlertTriangle, CheckCircle2, Car, Camera,
    ChevronDown, ChevronUp, Save, Printer, Search, Info,
    Gauge, Zap, Wind, Droplets, Wrench, Shield
} from 'lucide-react';

/* ─── Types ─── */
export interface ConditionReport {
    carId: string;
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    damageLevel: 'none' | 'minor' | 'partial' | 'major' | 'total_loss';
    odometer: number;
    odometerUnit: 'km' | 'mi';
    runsDrives: 'yes' | 'no' | 'unknown';
    keys: 'yes' | 'no' | 'partial';
    sections: {
        exterior: SectionGrade;
        interior: SectionGrade;
        mechanical: SectionGrade;
        tires: SectionGrade;
        glass: SectionGrade;
        frame: SectionGrade;
    };
    notes: string;
    inspectorName: string;
    inspectedAt: string;
}

interface SectionGrade {
    rating: 1 | 2 | 3 | 4 | 5;
    damage: string;
    notes: string;
}

/* ─── Constants ─── */
const DAMAGE_LEVELS = [
    { value: 'none', label: 'بدون ضرر', color: 'bg-green-500', textColor: 'text-green-700', bg: 'bg-green-50' },
    { value: 'minor', label: 'ضرر طفيف', color: 'bg-yellow-400', textColor: 'text-yellow-700', bg: 'bg-yellow-50' },
    { value: 'partial', label: 'ضرر جزئي', color: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-50' },
    { value: 'major', label: 'ضرر كبير', color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50' },
    { value: 'total_loss', label: 'خسارة كلية', color: 'bg-slate-900', textColor: 'text-slate-700', bg: 'bg-slate-100' },
];

const GRADES: { value: 'A' | 'B' | 'C' | 'D' | 'F'; label: string; color: string }[] = [
    { value: 'A', label: 'ممتاز', color: 'bg-green-500' },
    { value: 'B', label: 'جيد جداً', color: 'bg-blue-500' },
    { value: 'C', label: 'جيد', color: 'bg-yellow-500' },
    { value: 'D', label: 'مقبول', color: 'bg-orange-500' },
    { value: 'F', label: 'سيئ', color: 'bg-red-600' },
];

const SECTIONS = [
    { key: 'exterior', label: 'الهيكل الخارجي', icon: Car },
    { key: 'interior', label: 'الداخلية', icon: Shield },
    { key: 'mechanical', label: 'الميكانيك', icon: Wrench },
    { key: 'tires', label: 'الإطارات', icon: Gauge },
    { key: 'glass', label: 'الزجاج', icon: Wind },
    { key: 'frame', label: 'الهيكل الصلب', icon: Zap },
] as const;

const DEFAULT_REPORT: ConditionReport = {
    carId: '',
    overallGrade: 'B',
    damageLevel: 'none',
    odometer: 0, odometerUnit: 'km',
    runsDrives: 'yes', keys: 'yes',
    sections: {
        exterior: { rating: 4, damage: '', notes: '' },
        interior: { rating: 4, damage: '', notes: '' },
        mechanical: { rating: 4, damage: '', notes: '' },
        tires: { rating: 3, damage: '', notes: '' },
        glass: { rating: 5, damage: '', notes: '' },
        frame: { rating: 4, damage: '', notes: '' },
    },
    notes: '',
    inspectorName: '',
    inspectedAt: new Date().toISOString().split('T')[0],
};

/* ─── VIN Decoder ─── */
const VIN_ORIGINS: Record<string, string> = {
    '1': '🇺🇸 الولايات المتحدة', '2': '🇨🇦 كندا', '3': '🇲🇽 المكسيك',
    'J': '🇯🇵 اليابان', 'K': '🇰🇷 كوريا', 'L': '🇨🇳 الصين',
    'S': '🇬🇧 بريطانيا', 'W': '🇩🇪 ألمانيا', 'V': '🇫🇷 فرنسا/إسبانيا/السويد',
    'Z': '🇮🇹 إيطاليا', 'Y': '🇸🇪 السويد/فنلندا',
};
// VIN year codes cycle: 1980–2009 and 2010–2039 use the same chars.
// Using an array instead of an object avoids duplicate-key TS errors.
const VIN_YEAR_CHARS = 'ABCDEFGHJKLMNPRSTUVWXY123456789';
const VIN_BASE_YEAR = 1980;
const getVinYear = (ch: string): number | null => {
    const idx = VIN_YEAR_CHARS.indexOf(ch);
    if (idx < 0) return null;
    // 30-char cycle: 1980–2009 → idx 0–29; 2010–2039 → idx 0–29 again
    // We pick the more modern year if both cycles produce past years
    const y1 = VIN_BASE_YEAR + idx;
    const y2 = y1 + 30;
    const now = new Date().getFullYear();
    return (y2 <= now + 1) ? y2 : y1;
};


interface VinResult {
    vin: string; origin: string; year: number | null;
    wmi: string; vds: string; vis: string;
    isValid: boolean;
}
const decodeVin = (vin: string): VinResult => {
    const v = vin.trim().toUpperCase();
    const isValid = /^[A-HJ-NPR-Z0-9]{17}$/.test(v);
    return {
        vin: v, isValid,
        wmi: v.slice(0, 3), vds: v.slice(3, 9), vis: v.slice(9),
        origin: VIN_ORIGINS[v[0]] || '🌍 غير محدد',
        year: getVinYear(v[9]),
    };
};

/* ─── Star Rating ─── */
const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <button key={star} aria-label={`تقييم ${star} نجوم`} title={`${star} نجوم`} type="button" onClick={() => onChange(star)}
                className={`text-2xl transition-transform hover:scale-110 ${star <= value ? 'text-yellow-400' : 'text-slate-200'}`}>★</button>
        ))}
    </div>
);

/* ─── Main Component ─── */
export const ConditionReportForm: React.FC<{
    carId?: string; initialReport?: Partial<ConditionReport>;
    onSave?: (r: ConditionReport) => void; readOnly?: boolean;
}> = ({ carId, initialReport, onSave, readOnly = false }) => {
    const [report, setReport] = useState<ConditionReport>({ ...DEFAULT_REPORT, ...initialReport, carId: carId || '' });
    const [saved, setSaved] = useState(false);
    const [openSection, setOpenSection] = useState<string | null>('exterior');

    const handleSave = () => {
        onSave?.(report);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const updateSection = (key: keyof ConditionReport['sections'], field: keyof SectionGrade, val: any) =>
        setReport(r => ({ ...r, sections: { ...r.sections, [key]: { ...r.sections[key], [field]: val } } }));

    const inp = 'w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none focus:border-orange-500 transition-all';

    const currentDamage = DAMAGE_LEVELS.find(d => d.value === report.damageLevel)!;
    const currentGrade = GRADES.find(g => g.value === report.overallGrade)!;

    return (
        <div dir="rtl" className="space-y-6 font-cairo">
            {/* ─ Header ─ */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <ClipboardList className="w-7 h-7 text-orange-500" /> تقرير حالة السيارة
                    </h2>
                    {carId && <p className="text-slate-400 text-xs font-bold mt-1">الرقم: <span className="font-mono text-orange-500">{carId}</span></p>}
                </div>
                {!readOnly && (
                    <div className="flex gap-2">
                        <button aria-label="طباعة التقرير" title="طباعة" onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors">
                            <Printer className="w-4 h-4" /> طباعة
                        </button>
                        <button aria-label="حفظ التقرير" title="حفظ" onClick={handleSave}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all shadow-lg ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20'}`}>
                            <Save className="w-4 h-4" /> {saved ? 'تم الحفظ ✅' : 'حفظ التقرير'}
                        </button>
                    </div>
                )}
            </div>

            {/* ─ Overall Grade + Damage Level ─ */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Grade */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="font-black text-slate-700 text-sm mb-3">التقييم الإجمالي</p>
                    <div className="flex gap-2 flex-wrap">
                        {GRADES.map(g => (
                            <button key={g.value} aria-label={`تقييم إجمالي ${g.label}`} title={g.label} disabled={readOnly} onClick={() => setReport(r => ({ ...r, overallGrade: g.value }))}
                                className={`w-12 h-12 rounded-xl font-black text-lg transition-all ${report.overallGrade === g.value ? `${g.color} text-white shadow-lg scale-110` : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                {g.value}
                            </button>
                        ))}
                    </div>
                    <div className={`mt-3 inline-block px-3 py-1 rounded-lg text-sm font-black ${currentGrade.color} text-white`}>
                        {currentGrade.label}
                    </div>
                </div>

                {/* Damage Level */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <p className="font-black text-slate-700 text-sm mb-3">مستوى الضرر</p>
                    <div className="flex gap-2 flex-wrap">
                        {DAMAGE_LEVELS.map(d => (
                            <button key={d.value} aria-label={`مستوى الضرر ${d.label}`} title={d.label} disabled={readOnly} onClick={() => setReport(r => ({ ...r, damageLevel: d.value as any }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${report.damageLevel === d.value ? `${d.color} text-white border-transparent shadow-lg` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                                {d.label}
                            </button>
                        ))}
                    </div>
                    <div className={`mt-3 flex items-center gap-2 ${currentDamage.textColor}`}>
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-black">{currentDamage.label}</span>
                    </div>
                </div>
            </div>

            {/* ─ Quick Fields ─ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="font-black text-slate-700 text-sm mb-4">بيانات أساسية</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">عداد المسافة</label>
                        <div className="flex gap-1">
                            <input type="number" aria-label="عداد المسافة" disabled={readOnly} className={`${inp} rounded-r-none`} value={report.odometer}
                                onChange={e => setReport(r => ({ ...r, odometer: +e.target.value }))} title="عداد المسافة" placeholder="عداد المسافة" />
                            <select disabled={readOnly} className={`${inp} rounded-l-none w-16`} value={report.odometerUnit}
                                onChange={e => setReport(r => ({ ...r, odometerUnit: e.target.value as any }))} title="وحدة القياس" aria-label="وحدة القياس">
                                <option value="km">km</option>
                                <option value="mi">mi</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">يعمل / يتحرك</label>
                        <select disabled={readOnly} className={inp} value={report.runsDrives}
                            onChange={e => setReport(r => ({ ...r, runsDrives: e.target.value as any }))} title="يعمل / يتحرك" aria-label="يعمل / يتحرك">
                            <option value="yes">نعم ✅</option>
                            <option value="no">لا ❌</option>
                            <option value="unknown">غير معروف</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">المفاتيح</label>
                        <select disabled={readOnly} className={inp} value={report.keys}
                            onChange={e => setReport(r => ({ ...r, keys: e.target.value as any }))} title="حالة المفاتيح" aria-label="حالة المفاتيح">
                            <option value="yes">كاملة ✅</option>
                            <option value="partial">ناقصة ⚠️</option>
                            <option value="no">لا يوجد ❌</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">اسم المفتش</label>
                        <input aria-label="اسم المفتش" title="اسم المفتش" type="text" disabled={readOnly} className={inp} placeholder="اسم المفتش"
                            value={report.inspectorName}
                            onChange={e => setReport(r => ({ ...r, inspectorName: e.target.value }))} />
                    </div>
                </div>
            </div>

            {/* ─ Sections ─ */}
            <div className="space-y-2">
                <p className="font-black text-slate-700 text-sm">تقييم الأقسام</p>
                {SECTIONS.map(({ key, label, icon: Icon }) => {
                    const sec = report.sections[key];
                    return (
                        <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <button aria-label={openSection === key ? 'طي القسم' : 'توسيع القسم'} title={label} onClick={() => setOpenSection(openSection === key ? null : key)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <span className="font-black text-slate-800">{label}</span>
                                    <div className="flex text-sm">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span key={s} className={s <= sec.rating ? 'text-yellow-400' : 'text-slate-200'}>★</span>
                                        ))}
                                    </div>
                                </div>
                                {openSection === key ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            {openSection === key && (
                                <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
                                    <div className="pt-3">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">التقييم</label>
                                        {!readOnly
                                            ? <StarRating value={sec.rating} onChange={v => updateSection(key, 'rating', v)} />
                                            : <div className="flex text-xl">{[1, 2, 3, 4, 5].map(s => <span key={s} className={s <= sec.rating ? 'text-yellow-400' : 'text-slate-200'}>★</span>)}</div>
                                        }
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">نوع الضرر</label>
                                        <input aria-label="نوع الضرر" title="نوع الضرر" type="text" disabled={readOnly} className={inp} placeholder="مثال: خدش على الركن الأمامي..."
                                            value={sec.damage} onChange={e => updateSection(key, 'damage', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">ملاحظات</label>
                                        <textarea disabled={readOnly} rows={2} className={`${inp} resize-none`} placeholder="تفاصيل إضافية..."
                                            value={sec.notes} onChange={e => updateSection(key, 'notes', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ─ General Notes ─ */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <label className="block font-black text-slate-700 text-sm mb-3">ملاحظات عامة</label>
                <textarea disabled={readOnly} rows={4} className={`${inp} resize-none`} placeholder="أي ملاحظات إضافية على حالة السيارة..."
                    value={report.notes} onChange={e => setReport(r => ({ ...r, notes: e.target.value }))} />
            </div>
        </div>
    );
};

/* ─── VIN Decoder Component ─── */
export const VinDecoder: React.FC = () => {
    const [vin, setVin] = useState('');
    const [result, setResult] = useState<VinResult | null>(null);

    const decode = () => {
        if (vin.length >= 3) setResult(decodeVin(vin));
    };

    const inp = 'bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono font-black text-lg uppercase outline-none focus:border-orange-500 transition-all w-full tracking-widest';

    return (
        <div dir="rtl" className="space-y-5 font-cairo">
            <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">
                    <Search className="w-6 h-6 text-orange-500" /> فك شفرة رقم الهيكل (VIN Decoder)
                </h3>
                <div className="flex gap-3">
                    <input aria-label="رقم الهيكل" title="رقم الهيكل" type="text" className={inp} maxLength={17} placeholder="أدخل رقم الهيكل — 17 حرف"
                        value={vin} onChange={e => setVin(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && decode()} />
                    <button onClick={decode}
                        className="px-6 py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black shrink-0 shadow-lg shadow-orange-500/20 transition-all">
                        كشف
                    </button>
                </div>
                <div className="flex gap-1 mt-2">
                    {Array.from({ length: 17 }).map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i < vin.length ? 'bg-orange-500' : 'bg-slate-200'}`} />
                    ))}
                </div>
                <p className="text-xs text-slate-400 font-bold mt-1">{vin.length}/17 {vin.length === 17 ? '✅ طول صحيح' : ''}</p>
            </div>

            {result && (
                <div className={`rounded-2xl border-2 p-5 space-y-4 ${result.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                        {result.isValid
                            ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                            : <AlertTriangle className="w-5 h-5 text-red-500" />}
                        <span className={`font-black ${result.isValid ? 'text-green-700' : 'text-red-600'}`}>
                            {result.isValid ? 'رقم هيكل صحيح ✅' : '⚠️ رقم هيكل غير صالح'}
                        </span>
                    </div>

                    {result.isValid && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { label: 'بلد المنشأ', val: result.origin },
                                { label: 'سنة التصنيع', val: result.year ? `${result.year}` : 'غير محدد' },
                                { label: 'رمز الصانع (WMI)', val: result.wmi },
                                { label: 'رمز السيارة (VDS)', val: result.vds },
                                { label: 'الرقم التسلسلي (VIS)', val: result.vis },
                                { label: 'رقم الهيكل الكامل', val: result.vin },
                            ].map(r => (
                                <div key={r.label} className="bg-white rounded-xl p-3 border border-green-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{r.label}</p>
                                    <p className="font-black text-slate-800 font-mono text-sm mt-1">{r.val}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 font-bold">
                            للحصول على تاريخ كامل للسيارة (حوادث، ملكية، صيانة) يُنصح بالاستعلام من خدمات مثل CARFAX أو AutoCheck باستخدام رقم الهيكل.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
