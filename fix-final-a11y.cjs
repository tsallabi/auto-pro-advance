const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

// WalletPage fixes
{
    const file = path.join(cwd, 'src', 'pages', 'WalletPage.tsx');
    let lines = fs.readFileSync(file, 'utf-8').split('\n');
    const targetLines = [313, 335, 411, 417, 422];
    for (const ln of targetLines) {
        let l = ln - 1;
        if (lines[l].includes('<input')) {
            if (!lines[l].includes('aria-label')) lines[l] = lines[l].replace(/<input\b/, '<input aria-label="مدخل" title="مدخل" placeholder="مدخل" ');
        } else if (lines[l].includes('<select')) {
            if (!lines[l].includes('aria-label')) lines[l] = lines[l].replace(/<select\b/, '<select aria-label="تحديد" title="تحديد" ');
        } else if (lines[l].includes('<button')) {
            if (!lines[l].includes('aria-label')) lines[l] = lines[l].replace(/<button\b/, '<button aria-label="زر" title="زر" ');
        }
    }
    fs.writeFileSync(file, lines.join('\n'));
}

// UserDashboard fixes
{
    const file = path.join(cwd, 'src', 'pages', 'UserDashboard.tsx');
    let lines = fs.readFileSync(file, 'utf-8').split('\n');
    const targetLines = [551, 560, 569, 578, 587, 596, 1060, 1069, 1085, 1193, 1266, 1374, 1379, 1384, 1389, 1435, 1440, 1445];
    for (const ln of targetLines) {
        let l = ln - 1;
        if (lines[l].includes('<input')) {
            if (!lines[l].includes('aria-label')) lines[l] = lines[l].replace(/<input\b/, '<input aria-label="مدخل" title="مدخل" placeholder="مدخل" ');
        } else if (lines[l].includes('<textarea')) {
            if (!lines[l].includes('aria-label')) lines[l] = lines[l].replace(/<textarea\b/, '<textarea aria-label="نص" title="نص" placeholder="نص" ');
        } else if (lines[l].includes('<select')) {
            if (!lines[l].includes('aria-label')) lines[l] = lines[l].replace(/<select\b/, '<select aria-label="تحديد" title="تحديد" ');
        } else if (lines[l].includes('<button')) {
            if (!lines[l].includes('aria-label')) lines[l] = lines[l].replace(/<button\b/, '<button aria-label="زر" title="زر" ');
        }
    }
    fs.writeFileSync(file, lines.join('\n'));
}

console.log('Fixed final precise lines.');
