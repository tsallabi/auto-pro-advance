import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Truck, Ship, Package, DollarSign, Clock, MapPin,
    CheckCircle2, ChevronDown, ChevronUp, Phone, Mail,
    Globe, Shield, Zap, ArrowRight, Info, Calculator
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

/* ─────────────────────────────────────────────
   ShippingSettings interface (managed by Admin)
───────────────────────────────────────────── */
interface ShippingSettings {
    domesticRate: number;       // $/km for local transport
    seaFreightBase: number;     // base sea freight per vehicle ($)
    customsDuty: number;        // % of car value
    agencyFee: number;          // flat agency/clearance fee ($)
    portHandling: number;       // port handling fee ($)
    commissionRate: number;     // our commission % on total
    deliveryDays: { domestic: number; sea: number; customs: number };
    notes: string;
    routes: { from: string; to: string; price: number; days: number }[];
}

const DEFAULT_SETTINGS: ShippingSettings = {
    domesticRate: 0.8,
    seaFreightBase: 1200,
    customsDuty: 5,
    agencyFee: 350,
    portHandling: 180,
    commissionRate: 3,
    deliveryDays: { domestic: 7, sea: 45, customs: 10 },
    notes: '',
    routes: [
        { from: 'USA – Houston', to: 'ليبيا – طرابلس', price: 1800, days: 40 },
        { from: 'USA – Los Angeles', to: 'ليبيا – طرابلس', price: 2100, days: 45 },
        { from: 'UAE – دبي', to: 'ليبيا – طرابلس', price: 900, days: 20 },
        { from: 'Germany – Bremen', to: 'ليبيا – طرابلس', price: 1100, days: 25 },
    ],
};

const STORAGE_KEY = 'autopro_shipping_settings';

/* ─── Helper: load settings from localStorage ─── */
function loadSettings(): ShippingSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return DEFAULT_SETTINGS;
}

/* ─────────────────────────────────────────────
   Public Shipping Page
───────────────────────────────────────────── */
export const ShippingPage = () => {
    const { currentUser } = useStore();
    const [settings, setSettings] = useState<ShippingSettings>(loadSettings);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Reload whenever admin saves
    useEffect(() => {
        const handler = () => setSettings(loadSettings());
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    const steps = [
        { icon: Package, label: 'شراء السيارة', desc: 'تفوز بالمزاد وتسجل السيارة باسمك' },
        { icon: Truck, label: 'النقل الداخلي', desc: `النقل من موقع المزاد للميناء (${settings.deliveryDays.domestic} أيام تقريباً)` },
        { icon: Ship, label: 'الشحن البحري', desc: `شحن بحري حتى ميناء طرابلس (${settings.deliveryDays.sea} يوم تقريباً)` },
        { icon: Globe, label: 'الجمارك', desc: `تخليص جمركي وتسجيل (${settings.deliveryDays.customs} أيام تقريباً)` },
        { icon: CheckCircle2, label: 'الاستلام', desc: 'استلام سيارتك من المستودع أو التوصيل' },
    ];

    const faqs = [
        { q: 'هل يمكن تتبع شحنتي؟', a: 'نعم، بعد تأكيد الشحن تتلقى رقم تتبع وتستطيع متابعة السفينة عبر لوحة تحكمك.' },
        { q: 'ما المدة الإجمالية من المزاد حتى الاستلام؟', a: `المدة الإجمالية تتراوح بين ${settings.deliveryDays.domestic + settings.deliveryDays.sea + settings.deliveryDays.customs} إلى 75 يوماً حسب الميناء والجمارك.` },
        { q: 'هل الرسوم الجمركية شاملة في السعر؟', a: `نعم، نحصي ضريبة الجمارك (${settings.customsDuty}%) + رسوم المعالجة (${settings.agencyFee.toLocaleString()} $) في الحساب الأولي.` },
        { q: 'هل يمكن شحن أكثر من سيارة معاً؟', a: 'نعم، شحن أكثر من سيارة في نفس الحاوية يوفر 15-20% من تكلفة الشحن. تواصل معنا للحصول على عرض مجمّع.' },
        { q: 'ماذا لو أُتلفت السيارة أثناء الشحن؟', a: 'جميع السيارات مؤمنة خلال رحلة الشحن. في حالة أي تلف، يتم تعويضك وفق قيمة التأمين.' },
    ];

    return (
        <div dir="rtl" className="font-cairo bg-slate-50 min-h-screen">

            {/* ── Hero ── */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-32 pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10 bg-carbon-pattern" />
                </div>
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-black px-5 py-2 rounded-full mb-6 uppercase tracking-widest">
                        <Truck className="w-4 h-4" /> خدمات الشحن الدولي
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                        شحن سيارتك من<br />
                        <span className="text-orange-500">أمريكا وأوروبا</span> إلى ليبيا
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        نتولى كل خطوات الشحن نيابةً عنك — من الاستلام من الميناء الأمريكي حتى تسليم السيارة لباب منزلك.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-10">
                        <Link to="/marketplace" className="bg-orange-500 hover:bg-orange-400 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 shadow-2xl shadow-orange-500/30">
                            <ArrowRight className="w-5 h-5" /> ابدأ الآن — تصفح المزادات
                        </Link>
                        <a href="#calculator" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all">
                            <Calculator className="w-5 h-5" /> احسب تكلفة الشحن
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Stats bar ── */}
            <div className="bg-orange-500 text-white">
                <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {[
                        { val: '+500', label: 'سيارة شُحنت' },
                        { val: '4', label: 'موانئ أمريكية' },
                        { val: settings.deliveryDays.sea + settings.deliveryDays.domestic, label: 'يوم متوسط التسليم' },
                        { val: '24/7', label: 'دعم فني' },
                    ].map(s => (
                        <div key={s.label}>
                            <div className="text-3xl font-black">{s.val}</div>
                            <div className="text-orange-100 text-sm font-bold">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── How it works ── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-12">كيف يعمل الشحن؟</h2>
                <div className="flex flex-col md:flex-row items-start gap-0">
                    {steps.map((step, i) => (
                        <React.Fragment key={i}>
                            <div className="flex-1 flex flex-col items-center text-center px-4">
                                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20 mb-4">
                                    <step.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">الخطوة {i + 1}</div>
                                <div className="font-black text-slate-900 mb-2">{step.label}</div>
                                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="hidden md:block w-8 mt-7 flex-shrink-0">
                                    <div className="h-px bg-gradient-to-r from-orange-400/50 to-slate-300/20 w-full mt-6" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* ── Routes & Prices ── */}
            <section className="bg-slate-900 text-white py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl font-black text-center mb-4">مسارات الشحن والأسعار</h2>
                    <p className="text-slate-400 text-center text-sm mb-12">أسعار تقديرية للسيارات العادية (سيدان / SUV). قد تختلف حسب الحجم والوزن.</p>
                    <div className="grid md:grid-cols-2 gap-5">
                        {settings.routes.map((r, i) => (
                            <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-orange-500/40 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                                            <Ship className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <div className="font-black text-white">{r.from}</div>
                                            <div className="text-slate-400 text-xs">إلى {r.to}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-orange-400">${r.price.toLocaleString()}</div>
                                        <div className="text-slate-400 text-xs">{r.days} يوم تقريباً</div>
                                    </div>
                                </div>
                                {settings.notes && (
                                    <p className="text-slate-500 text-xs border-t border-slate-700/50 pt-3">{settings.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Fee Breakdown ── */}
            <section id="calculator" className="max-w-4xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-4">تفصيل الرسوم</h2>
                <p className="text-slate-500 text-sm text-center mb-10">جميع الأسعار بالدولار الأمريكي — يتم تحديثها من لوحة تحكم المدير</p>
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {[
                        { label: 'رسوم الشحن البحري (أساسية)', value: `من $${settings.seaFreightBase.toLocaleString()}`, icon: Ship },
                        { label: 'النقل الداخلي', value: `$${settings.domesticRate}/كم`, icon: Truck },
                        { label: 'رسوم الوكالة والتخليص', value: `$${settings.agencyFee.toLocaleString()}`, icon: Package },
                        { label: 'الرسوم الجمركية', value: `${settings.customsDuty}% من قيمة السيارة`, icon: Globe },
                        { label: 'رسوم الميناء والمناولة', value: `$${settings.portHandling.toLocaleString()}`, icon: MapPin },
                        { label: 'عمولة أوتو برو', value: `${settings.commissionRate}%`, icon: DollarSign },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                <item.icon className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="flex-1 font-bold text-slate-700">{item.label}</span>
                            <span className="font-black text-slate-900">{item.value}</span>
                        </div>
                    ))}
                    <div className="bg-orange-50 border-t border-orange-100 px-6 py-4 flex items-center gap-3">
                        <Info className="w-5 h-5 text-orange-500 shrink-0" />
                        <p className="text-sm text-orange-700 font-bold">
                            للحصول على سعر دقيق لسيارتك، استخدم{' '}
                            <Link to="/calculator" className="underline hover:text-orange-900">حاسبة التكلفة</Link>{' '}
                            أو تواصل مع فريقنا.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: Shield, title: 'تأمين شامل', desc: 'جميع السيارات مؤمنة خلال رحلة الشحن ضد الأعطال والتلف' },
                        { icon: Zap, title: 'تتبع لحظي', desc: 'تابع موقع سفينتك وحالة شحنتك من لوحة تحكمك' },
                        { icon: Clock, title: 'مواعيد مضمونة', desc: 'التزمنا بمواعيد التسليم مع تعويض عن أي تأخير' },
                    ].map((f, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex gap-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                <f.icon className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 mb-1">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="max-w-3xl mx-auto px-6 pb-20">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-10">الأسئلة الشائعة</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <button
                                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-right font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            >
                                <span>{faq.q}</span>
                                {openFaq === i ? <ChevronUp className="w-5 h-5 text-orange-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                            </button>
                            {openFaq === i && (
                                <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="bg-slate-900 text-white py-16">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-black mb-4">هل أنت مستعد؟</h2>
                    <p className="text-slate-400 mb-8">ابدأ بتصفح المزادات وعند الفوز، كل شيء بين يديك.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/marketplace" className="bg-orange-500 hover:bg-orange-400 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all hover:scale-105">
                            <ArrowRight className="w-5 h-5" /> تصفح المزادات الآن
                        </Link>
                        {currentUser ? (
                            <Link to="/dashboard/user?view=logistics" className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all">
                                <Truck className="w-5 h-5" /> تتبع شحناتي
                            </Link>
                        ) : (
                            <Link to="/auth" className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all">
                                <Phone className="w-5 h-5" /> تواصل مع فريقنا
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};
