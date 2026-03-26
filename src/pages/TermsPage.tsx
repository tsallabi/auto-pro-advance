import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TermsPage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                            <FileText className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">الشروط والأحكام</h1>
                            <p className="text-slate-500 font-medium">آخر تحديث: 1 أكتوبر 2024</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-li:font-medium">
                        <h2>1. مقدمة</h2>
                        <p>
                            مرحباً بكم في منصة AutoPro (أوتو برو). يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام الموقع والتسجيل للمزايدة. استخدامك لمنصتنا يعني موافقتك الكاملة على جميع الشروط الواردة هنا.
                        </p>

                        <h2>2. حسابات المستخدمين والتسجيل</h2>
                        <p>
                            للتمكن من تقديم عروض في قاعات المزادات، يجب على المستخدم:
                        </p>
                        <ul>
                            <li>تقديم معلومات هوية صحيحة ودقيقة (جواز سفر أو بطاقة هوية وطنية).</li>
                            <li>دفع "تأمين مسترد" يحدد الحد الأقصى للمزايدة (قيمة التخويل).</li>
                            <li>الحفاظ على سرية بيانات حسابه، ويتحمل مسؤولية أي مزايدة تتم من خلال حسابه.</li>
                        </ul>

                        <h2>3. آلية المزايدة والالتزام العضوي</h2>
                        <p>
                            عندما تقوم بوضع عرض (Bid) سواء كان مبدئياً أو أثناء المزاد المباشر وفزت بالسيارة، فإن هذا يعتبر التزاماً قانونياً بشراء المركبة ودفع قيمتها مع كافة الرسوم المترتبة.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl my-6 flex gap-4">
                            <ShieldAlert className="w-6 h-6 text-orange-600 shrink-0 mt-1" />
                            <p className="text-orange-800 text-sm leading-relaxed m-0 font-bold">
                                التخلف عن الدفع بعد الفوز بالمزاد يعرض حسابك للإيقاف، ويؤدي إلى مصادرة مبلغ التأمين المدفوع بالكامل لتغطية غرامات المزاد المترتبة على الشركة.
                            </p>
                        </div>

                        <h2>4. الرسوم وتحديد الأسعار</h2>
                        <p>
                            يتم احتساب الرسوم بناءً على: سعر السيارة، رسوم المزاد (Copart أو IAAI)، أجور النقل الداخلي في الولايات المتحدة، الشحن البحري، عمولة منصة أوتو برو، وأي مصاريف بنكية. تستطيع استخدام حاسبة التكلفة لمعرفة التكلفة التقديرية بدقة ممتازة قبل الشراء.
                        </p>

                        <h2>5. حالة المركبات والضمان</h2>
                        <p>
                            تُباع جميع المركبات على المنصة "على حالتها الراهنة" (As-Is / Where-Is). منصة AutoPro تعرض البيانات والصور المزودة من قبل ساحات المزاد كما هي، ولا تقدم أي ضمان ميكانيكي أو ظاهري للسيارات المشترَاة.
                        </p>
                        <p>
                            نوصي دائماً بقراءة "تقرير الحالة" (Condition Report) الذي نوفره بعناية وبناء قرارك عليه.
                        </p>

                        <h2>6. التخليص الجمركي والتسليم</h2>
                        <p>
                            يتولى الوكيل اللوجستي الخاص بنا عمليات الشحن البحري للمركبات وتفريغها. بعد استلام المركبة بالميناء المخصص في ليبيا، تنتهي مسؤوليتنا وتصبح السيارة في عهدتك مالم تقم باختيار خدمة النقل المحلي الداخلي الإضافية.
                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
};
