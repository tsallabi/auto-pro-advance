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
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    // Revert the exact strings injected
    content = content.replace(/ title="حقل إدخال" placeholder="إدخال بيانات" aria-label="حقل إدخال"/g, '');
    content = content.replace(/ title="زر إجراء" aria-label="إجراء"/g, '');
    content = content.replace(/ title="تحديد" aria-label="تحديد"/g, '');

    // Revert versions without preceding space
    content = content.replace(/<select title="تحديد" aria-label="تحديد"/g, '<select');
    content = content.replace(/<button title="زر إجراء" aria-label="إجراء"/g, '<button');
    content = content.replace(/<input title="حقل إدخال" placeholder="إدخال بيانات" aria-label="حقل إدخال"/g, '<input');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Reverted injected attributes in:', file);
    }
}
