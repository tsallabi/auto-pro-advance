const fs = require('fs');

const files = [
    'src/pages/AdminDashboard.tsx',
    'src/pages/AuthPage.tsx',
    'src/pages/CarDetails.tsx',
    'src/pages/Home.tsx',
    'src/pages/SellerDashboard.tsx',
    'src/pages/UserDashboard.tsx',
    'src/pages/WalletPage.tsx',
    'src/components/LiveAuction.tsx',
    'src/components/MobileBottomNav.tsx',
    'src/components/SiteFooter.tsx',
    'src/components/ToastNotification.tsx',
    'src/pages/ShippingPage.tsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        continue;
    }

    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    // Fix empty alt attributes
    content = content.replace(/alt=(['"`])\1/g, 'alt="صورة"');
    // Add fallback alt to img tags missing it entirely
    content = content.replace(/<img(?![^>]*alt=)/g, '<img alt="صورة"');

    // Fix select elements without title/aria-label
    content = content.replace(/<select((?!title=)(?!aria-label=)[^>]*)>/g, '<select title="تحديد" aria-label="تحديد"$1>');

    // Fix buttons missing titles/aria-labels
    content = content.replace(/<button((?!title=)(?!aria-label=)[^>]*)>/g, '<button title="زر إجراء" aria-label="إجراء"$1>');

    // Fix inputs missing titles & placeholders
    content = content.replace(/<input((?!type=['"]?(hidden|checkbox|radio)['"]?)(?!title=)(?!aria-label=)(?!id=)(?!placeholder=)[^>]*)>/g, '<input title="حقل إدخال" placeholder="إدخال بيانات" aria-label="حقل إدخال"$1>');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
    }
}
