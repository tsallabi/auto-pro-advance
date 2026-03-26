import React from 'react';
import { Briefcase, ChevronLeft, Search, Star, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CareersPage = () => {
    const { t } = useTranslation();

    const jobs = [
        {
            title: "مطوّر واجهات أمامية (React)",
            type: "دوام كامل",
            location: "مصراتة / عن بعد",
            desc: "نبحث عن مطور شغوف يمتلك خبرة في React و Tailwind للمساهمة في تطوير منصة أوتو برو وإضافة ميزات جديدة لتحسين تجربة المستخدم."
        },
        {
            title: "أخصائي لوجستيات وشحن",
            type: "دوام كامل",
            location: "طرابلس",
            desc: "المهام تشمل متابعة حاويات الشحن، التواصل مع وكلاء الموانئ في الولايات المتحدة، وجدولة تسليم السيارات للعملاء في ليبيا."
        },
        {
            title: "ممثل خدمة عملاء (دعم المزادات)",
            type: "نظام مناوبات",
            location: "بنغازي",
            desc: "مساعدة العملاء أثناء المزايدات المباشرة، تقديم الدعم الفني، والإجابة على الاستفسارات المتعلقة بحسابات التكلفة."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-6">

                <div className="bg-white rounded-3xl p-10 md:p-16 mb-12 shadow-sm border border-slate-200 text-center">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-8 h-8 text-orange-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                        انضم إلى <span className="text-orange-500">فريقنا</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
                        نحن نبني مستقبل تجارة السيارات في ليبيا. نبحث دائماً عن المواهب الاستثنائية التي تشاركنا نفس الشغف والرؤية.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-2xl font-black text-slate-900">الوظائف المتاحة حالياً</h2>
                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="ابحث عن مسمى وظيفي..."
                            className="w-full md:w-80 bg-white border border-slate-200 rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 right-4" />
                    </div>
                </div>

                <div className="space-y-4">
                    {jobs.map((job, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-500/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-500 transition-colors">{job.title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4 font-medium">
                                    <span className="bg-slate-100 px-3 py-1 rounded-lg">{job.type}</span>
                                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg">{job.location}</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed max-w-3xl text-sm">
                                    {job.desc}
                                </p>
                            </div>
                            <button aria-label="عرض التفاصيل" className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-500 shrink-0 transition-colors">
                                <ChevronLeft className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-slate-900 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 py-12 px-8 md:px-12">
                    <div className="text-white">
                        <h3 className="text-2xl font-black mb-3">لم تجد وظيفة تناسبك؟</h3>
                        <p className="text-slate-400">نحن دائماً نستقبل السير الذاتية للمواهب المتميزة. أرسل سيرتك وسنتواصل معك لاحقاً.</p>
                    </div>
                    <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shrink-0 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-orange-500" />
                        تواصل مع الموارد البشرية
                    </button>
                </div>

            </div>
        </div>
    );
};
