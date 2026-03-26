const fs = require('fs');
let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

// 1. Add hook import
content = content.replace(
    `import { useNavigate } from 'react-router-dom';`,
    `import { useNavigate } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';`
);

// 2. Add hook usage 
content = content.replace(
    `    const { branchConfig } = useStore();`,
    `    const { branchConfig } = useStore();\n    const { t, i18n } = useTranslation();`
);

// 3. Update main div dir attribute
content = content.replace(
    `dir="rtl"`,
    `dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}`
);

// 4. Update fonts (remove font-cairo as we set font-sans globally now)
content = content.replace(
    `font-cairo`,
    `font-sans`
);

const replacements = [
    ['المنصة الأقوى للمزادات في ليبيا والخليج', "{t('landingPage.badgeTop')}"],
    ['الريادة في <br />', "{t('landingPage.heroTitle1')} <br />"],
    ['الريادة في', "{t('landingPage.heroTitle1')}"],
    ['مزادات السيارات', "{t('landingPage.heroTitleHighlight')}"],
    ['بشـفافـية مطلـقة', "{t('landingPage.heroTitle2')}"],
    ['انضم إلى نخبة التجار والمشترين في أكبر سوق إلكتروني للسيارات. مع حلول شحن لوجستية متكاملة حتى باب منزلك.', "{t('landingPage.heroSubtitle')}"],
    ['سجل الآن وابدأ المزايدة <ArrowRight className="w-7 h-7 rotate-180 group-hover:-translate-x-2 transition-transform" />', "{t('landingPage.registerStart')} <ArrowRight className={`w-7 h-7 transform ${i18n.language === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />"],
    ['>تصفح السيارات<', ">{t('landingPage.browseCars')}<"],
    ['سيارة أسبوعياً', "{t('landingPage.weeklyCars')}"],
    ['ضمان الشفافية', "{t('landingPage.transparency')}"],
    ['تقييم التجار', "{t('landingPage.dealerRating')}"],
    ['المزايدة المباشرة تبدأ الآن', "{t('landingPage.liveBidStarts')}"],
    ['الموافقة الفورية', "{t('landingPage.instantApproval')}"],
    ['جاهز للشحن', "{t('landingPage.readyToShip')}"],
    ['خدماتنا اللوجستية', "{t('landingPage.logisticsServices')}"],
    ['>حلول شاملة <', ">{t('landingPage.comprehensiveSolutions')} <"],
    ['>لنمو تجارتك<', ">{t('landingPage.growBusiness')}<"],
    ['نحن لا نبيع السيارات فحسب؛ نحن نبني جسراً يربطك بالأسواق العالمية مع ضمان أمان أموالك ووصول شحناتك.', "{t('landingPage.logisticsSubtitle')}"],
    ['>شـراء (Buy)<', ">{t('landingPage.buySection.title')}<"],
    ['استفد من الوصول الحصري لأكثر من 50,000 سيارة أسبوعياً. نظام مزايدة حي متوافق مع كافة الأجهزة وبشفافية تامة في الرسوم.', "{t('landingPage.buySection.desc')}"],
    ['>استكشف النظام<', ">{t('landingPage.buySection.btn')}<"],
    ['>بـيـع (Sell)<', ">{t('landingPage.sellSection.title')}<"],
    ['اعرض مخزونك في سوقنا المفتوح واحصل على عروض شراء فورية من شبكة تضم آلاف التجار المعتمدين في ليبيا والشرق الأوسط.', "{t('landingPage.sellSection.desc')}"],
    ['>اعرض سيارتك<', ">{t('landingPage.sellSection.btn')}<"],
    ['>تخـمين (Value)<', ">{t('landingPage.valueSection.title')}<"],
    ['استخدم المحرك الذكي لتقدير التكلفة الواصلة ليدك شاملة الشحن والتخليص. لا مفاجآت بعد اليوم، اعرف تكاليفك بدقة البرمجيات الحديثة.', "{t('landingPage.valueSection.desc')}"],
    ['>حاسبة التكلفة 🇱🇾<', ">{t('landingPage.valueSection.btn')}<"],
    ['>تتبع حي للشحنة<', ">{t('landingPage.transport.liveTrack')}<"],
    ['>وصول متوقع خلال 14 يوم<', ">{t('landingPage.transport.eta')}<"],
    ['>شحن آمن..<', ">{t('landingPage.transport.safeTransport')}<"],
    ['>من الميناء إلى باب المعرض<', ">{t('landingPage.transport.portToDoor')}<"],
    ['نمتلك شبكة لوجستية تغطي كافة الولايات الأمريكية وساحات المزادات. فريقنا يضمن لك فحص حالة السيارة عند الاستلام وشحنها بأمان تام مع تأمين شامل.', "{t('landingPage.transport.desc')}"],
    ["{ text: 'تخليص جمركي فوري', icon: Shield }", "{ text: t('landingPage.transport.feature1'), icon: Shield }"],
    ["{ text: 'تتبع GPS لحظي', icon: Globe }", "{ text: t('landingPage.transport.feature2'), icon: Globe }"],
    ["{ text: 'تأمين شامل ضد الأضرار', icon: CheckCircle2 }", "{ text: t('landingPage.transport.feature3'), icon: CheckCircle2 }"],
    ["{ text: 'فريق دعم لوجستي ليبي', icon: Users }", "{ text: t('landingPage.transport.feature4'), icon: Users }"],
    ['>حان وقت الانطلاق..<', ">{t('landingPage.cta.title1')}<"],
    ['>الربح بانتظارك!<', ">{t('landingPage.cta.title2')}<"],
    ["{ title: 'أرباح مضاعفة', desc: 'وفر حتى 30% من قيمة الشراء المحلي عند الشراء مباشرة من المزادات العالمية.', icon: TrendingUp }", "{ title: t('landingPage.cta.feat1Title'), desc: t('landingPage.cta.feat1Desc'), icon: TrendingUp }"],
    ["{ title: 'بيانات دقيقة', desc: 'نقدم لك تقارير فحص كاملة وصوراً عالية الدقة لكل زاوية في السيارة.', icon: Activity }", "{ title: t('landingPage.cta.feat2Title'), desc: t('landingPage.cta.feat2Desc'), icon: Activity }"],
    ["{ title: 'دعم عربي 24/7', desc: 'فريق متخصص لمساعدتك في المزايدة باللغة العربية طوال أيام الأسبوع.', icon: MessageSquare }", "{ title: t('landingPage.cta.feat3Title'), desc: t('landingPage.cta.feat3Desc'), icon: MessageSquare }"],
    ['>سجل مجاناً وانطلق<', ">{t('landingPage.cta.btn')}<"],
    ['بوابة المزايدة المباشرة مفتوحة الآن لجميع المسجلين', "{t('landingPage.cta.liveGateway')}"],
    ['>شركاء النجاح<', ">{t('landingPage.testimonials.title')}<"],
    ['>تجار ومستوردون يتحدثون عن تجربتهم<', ">{t('landingPage.testimonials.subtitle')}<"],
    ["{ name: 'عبد الله الغرياني', role: 'تاجر سيارات - طرابلس', text: 'أوتو برو وفرت عليّ الكثير من الجهد. الآن أقوم بالمزايدة وأنا جالس في مكتبي، والسيارة تصلني كما في الصور تماماً.' }", "{ name: t('landingPage.testimonials.1_name'), role: t('landingPage.testimonials.1_role'), text: t('landingPage.testimonials.1_text') }"],
    ["{ name: 'سالم الورفلي', role: 'مستورد مستقل - بنغازي', text: 'الشفافية في الرسوم هي أكثر ما أعجبني. لا توجد تكاليف خفية، وأسعار الشحن منافسة جداً مقارنة بالمكاتب التقليدية.' }", "{ name: t('landingPage.testimonials.2_name'), role: t('landingPage.testimonials.2_role'), text: t('landingPage.testimonials.2_text') }"],
    ["{ name: 'عمر القطراني', role: 'صاحب معرض سيارات', text: 'حاسبة التكلفة عندهم دقيقة جداً. تعطيني السعر الواصل ليدي قبل أن أضع المزايدة، وهذا يساعدني في حساب أرباحي مسبقاً.' }", "{ name: t('landingPage.testimonials.3_name'), role: t('landingPage.testimonials.3_role'), text: t('landingPage.testimonials.3_text') }"],
    ['>جاهز للتحكم في <', ">{t('landingPage.footer.ready')} <"],
    ['>مستقبلك التجاري؟<', ">{t('landingPage.footer.future')}<"],
    ['>إنشاء حساب مجاني<', ">{t('landingPage.footer.createAccount')}<"],
    ['>لا توجد رسوم خفية • تسجيل فوري • دعم فني مباشر<', ">{t('landingPage.footer.note')}<"]
];

for (const [find, replace] of replacements) {
    if (content.includes(find)) {
        content = content.replace(new RegExp(find.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replace);
        console.log(`Matched and replaced: ${find} => ${replace}`);
    } else {
        console.log(`Could not find string: ${find}`);
    }
}

fs.writeFileSync('src/pages/LandingPage.tsx', content);
console.log('Done!');
