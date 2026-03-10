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

    // A regex to find elements and deduplicate specific attributes inside them
    const deduplicateAttributes = (tagRegex) => {
        content = content.replace(tagRegex, (match) => {
            const attrs = ['title', 'aria-label', 'placeholder', 'alt'];
            let newMatch = match;
            attrs.forEach(attr => {
                const attrRegex = new RegExp(`\\s+${attr}=['"][^'"]*['"]`, 'g');
                const matches = newMatch.match(attrRegex);
                if (matches && matches.length > 1) {
                    // Keep only the first occurrence
                    let first = true;
                    newMatch = newMatch.replace(attrRegex, (m) => {
                        if (first) { first = false; return m; }
                        return ''; // Remove succeeding duplicates
                    });
                }
            });
            return newMatch;
        });
    };

    deduplicateAttributes(/<button[^>]*>/g);
    deduplicateAttributes(/<input[^>]*>/g);
    deduplicateAttributes(/<select[^>]*>/g);
    deduplicateAttributes(/<img[^>]*>/g);

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Deduplicated:', file);
    }
}
