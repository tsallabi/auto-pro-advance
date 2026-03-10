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

    content = content.replace(/<[a-zA-Z0-9]+[^>]+>/g, (tag) => {
        let newTag = tag;

        // Count titles
        const hasTitle = (newTag.match(/\btitle=/g) || []).length > 1;
        if (hasTitle) {
            newTag = newTag.replace(/\s+title="حقل إدخال"/, '');
            newTag = newTag.replace(/\s+title="تحديد"/, '');
            newTag = newTag.replace(/\s+title="زر إجراء"/, '');
        }

        // Count aria-Labels
        const hasAriaLabel = (newTag.match(/\baria-label=/g) || []).length > 1;
        if (hasAriaLabel) {
            newTag = newTag.replace(/\s+aria-label="حقل إدخال"/, '');
            newTag = newTag.replace(/\s+aria-label="تحديد"/, '');
            newTag = newTag.replace(/\s+aria-label="إجراء"/, '');
        }

        // Count placeholders
        const hasPlaceholder = (newTag.match(/\bplaceholder=/g) || []).length > 1;
        if (hasPlaceholder) {
            newTag = newTag.replace(/\s+placeholder="إدخال بيانات"/, '');
        }

        // Count alts
        const hasAlt = (newTag.match(/\balt=/g) || []).length > 1;
        if (hasAlt) {
            newTag = newTag.replace(/\s+alt="صورة"/, '');
        }

        return newTag;
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Cleaned duplicates in:', file);
    }
}
