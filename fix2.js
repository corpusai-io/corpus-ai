const fs = require('fs');
const CRLF = String.fromCharCode(13) + String.fromCharCode(10);
const p1 = 'D:/corpus-ai/apps/dashboard/src/app/chatbots/[id]/analytics/page.tsx';
let c1 = fs.readFileSync(p1, 'utf8');

// Fix 5: Add percentage fields
c1 = c1.replace("  thumbsDown: number;" + CRLF + "  avgResponseTime?: number;", "  thumbsDown: number;" + CRLF + "  thumbsUpPercentage?: number;" + CRLF + "  thumbsDownPercentage?: number;" + CRLF + "  avgResponseTime?: number;");

fs.writeFileSync(p1, c1, 'utf8');
console.log('Fixed interface');