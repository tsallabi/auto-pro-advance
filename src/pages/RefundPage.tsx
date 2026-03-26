import React from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';

export const RefundPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                            <DollarSign className="w-7 h-7 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">سياسة الاسترجاع والإلغاء</h1>
                            <p className="text-slate-500 font-medium">قواعد وشروط استرجاع المبالغ وودائع التأمين.</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                        <h2>1. استرجاع مبلغ التأمين (Deposit)</h2>
                        <p>
                            مبلغ التأمين الذي تقوم بدفعه لتفعيل حسابك والمزايدة هو مبلغ <strong>مسترد بالكامل 100%</strong> في حال لم تفُز بأي مزاد، أو في حال رغبت بإلغاء اشتراكك.
                        </p>
                        <p>
                            يستغرق الاسترجاع البنكي أو النقدي من 3 إلى 7 أيام عمل من تاريخ تقديم طلب الاسترداد من لوحة التحكم الخاصة بك.
                        </p>

                        <h2>2. إلغاء المزايدة أو التراجع عن الشراء</h2>
                        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl my-6 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                            <p className="text-red-800 text-sm leading-relaxed m-0 font-bold">
                                تنبيه هام: بمجرد فوزك במزاد واحتساب السيارة على حسابك، لا توجد سياسة إرجاع (No Refund Policy) للإلغاء من طرف المشتري.
                            </p>
                        </div>
                        <p>
                            إذا قررت التراجع عن دفع قيمة السيارة التي فزت بها، سيتم مصادرة مبلغ <strong>التأمين بالكامل (Deposit forfeiture)</strong> لتغطية غرامات إعادة العرض (Relist Fees) ورسوم التأخير (Late Fees) المفروضة من قبل ساحة المزاد بأمريكا وكندا.
                        </p>

                        <h2>3. المبالغ الزائدة</h2>
                        <p>
                            إذا قمت بتحويل مبلغ أكبر من قيمة السيارة والفواتير المستحقة (رصيد دائن)، فإن هذا الفائض سيبقى في محفظتك الإلكترونية كمصدر تمويل למزايدة القادمة. ويمكنك طلب استرجاعه نقداً أو لحسابك البنكي متى شئت.
                        </p>

                        <h2>4. السيارات غير المتوافقة مع الوصف</h2>
                        <p>
                            تذكر دائماً أن سيارات المزادات تُباع "As-Is". لا يوجد استرجاع أو تعويض إذا ظهر أي عيب ميكانيكي أو ظاهري لم يكن واضحاً في صور ساحة المزاد. منصة أوتو برو توفر أداة الشراء، ولكن قرار الشراء يقع بالكامل على تقييم العميل لصور وفحص السيارة قبل المزايدة.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
