import React from 'react';
import { Shield, Target, Users, Globe, Building2, TrendingUp, CheckCircle, Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AboutPage = () => {
    const { t } = useTranslation();

    const features = [
        { icon: Globe, title: 'تغطية عالمية', desc: 'نصلك بأكبر مزادات السيارات في أمريكا وكندا وكوريا.' },
        { icon: Shield, title: 'شفافية مطلقة', desc: 'لا توجد رسوم خفية. نظامنا يوضح لك التكلفة الإجمالية من لحظة المزايدة وحتى وصول السيارة.' },
        { icon: Users, title: 'دعم محلي', desc: 'فريق ليبي متخصص متواجد على مدار الساعة لدعمك في كل خطوة.' },
        { icon: Target, title: 'أسعار تنافسية', desc: 'شحن مباشر من الميناء بأسعار حصرية بفضل حجم تعاملاتنا الكبير.' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6">

                {/* Hero */}
                <div className="bg-white rounded-3xl p-10 md:p-16 mb-12 shadow-sm border border-slate-200 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-3xl z-0"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                            عن <span className="text-orange-500">AUTOPRO</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed font-medium">
                            نحن بوابة ليبيا الأولى والوحيدة نحو المزادات العالمية. هدفنا أن نمنح التاجر والمستورد الليبي تحكماً كاملاً وشفافية مطلقة في عملية شراء وشحن السيارات من الخارج.
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-orange-500" />
                            رؤيتنا
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-lg font-medium">
                            أن نصبح المنصة التكنولوجية الرائدة في شمال أفريقيا والشرق الأوسط لاستيراد وتجارة السيارات، مقدمين نظاماً بيئياً متكاملاً يشمل المزايدة، الشحن، التخليص، والتوصيل.
                        </p>
                    </div>

                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <Target className="w-6 h-6 text-orange-500" />
                            مهمتنا
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-lg font-medium">
                            كسر الاحتكار في سوق استيراد السيارات، وتوفير أدوات تقنية حديثة وموثوقة تمكن المكاتب والمستقلين من العمل باحترافية وتنمية أعمالهم بدون وسطاء وبتكاليف واضحة.
                        </p>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-12">لماذا تختار أوتو برو؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-right">
                        {features.map((feat, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-500/30 hover:shadow-md transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feat.icon className="w-6 h-6 text-orange-500" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats / Proof */}
                <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-center text-white mt-16 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-8">ثقة تبنى بالأرقام</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">+1500</div>
                                <div className="text-slate-400 font-medium">سيارة مشحونة</div>
                            </div>
                            <div>
                                <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">+800</div>
                                <div className="text-slate-400 font-medium">تاجر نشط</div>
                            </div>
                            <div>
                                <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">4</div>
                                <div className="text-slate-400 font-medium">فروع دولية</div>
                            </div>
                            <div>
                                <div className="text-4xl md:text-5xl font-black text-orange-500 mb-2">100%</div>
                                <div className="text-slate-400 font-medium">شفافية وتتبع</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
