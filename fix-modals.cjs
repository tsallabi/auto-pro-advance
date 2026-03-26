const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/UserDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// We will extract blocks using regex, then append them at the designated comment.
function extractBlock(startRegex) {
    const lines = content.split('\n');
    let startIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (startRegex.test(lines[i])) {
            startIndex = i;
            break;
        }
    }

    if (startIndex === -1) return null;

    // Simple bracket matching to find the end of the block
    let openBraces = 0;
    let endIndex = -1;
    let blockText = '';
    let foundFirstBrace = false;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
            if (line[j] === '{') {
                openBraces++;
                foundFirstBrace = true;
            }
            if (line[j] === '}') {
                openBraces--;
            }
        }

        blockText += line + '\n';

        if (foundFirstBrace && openBraces === 0) {
            endIndex = i;
            break;
        }
    }

    if (endIndex !== -1) {
        // Remove from content
        const before = lines.slice(0, startIndex - 1).join('\n'); // Also remove preceding comment line ideally
        const after = lines.slice(endIndex + 1).join('\n');

        // Let's refine the "before" to safely remove the comment above it if it exists
        let actualStart = startIndex;
        if (actualStart > 0 && lines[actualStart - 1].includes('/*')) {
            actualStart -= 1;
        }

        content = lines.slice(0, actualStart).join('\n') + '\n' + lines.slice(endIndex + 1).join('\n');
        return blockText;
    }

    return null;
}

// Extract the modals
const reportModal = extractBlock(/showReportModal &&/);
const detailedReportModal = extractBlock(/showDetailedReport &&/);
const inspectionModal = extractBlock(/showInspectionModal &&/);
const messageModal = extractBlock(/showNewMessageModal &&/);
const depositModal = extractBlock(/showDepositModal &&/);

const allModals = [
    '{/* Reports Modal */}',
    reportModal,
    '{/* Detailed Interactive Report Modal */}',
    detailedReportModal,
    '{/* Inspection Request Modal */}',
    inspectionModal,
    '{/* New Message Modal */}',
    messageModal,
    '{/* Deposit Modal */}',
    depositModal
].filter(Boolean).join('\n\n');

// Append before </main>
content = content.replace('{/* Modal overlays are handled globally at the end of the viewport */}', '{/* Modal overlays are handled globally at the end of the viewport */}\n' + allModals);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully extracted and moved modals.");
