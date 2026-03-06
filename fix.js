const fs = require('fs');
const NL = String.fromCharCode(10);
const p1 = 'D:/corpus-ai/apps/dashboard/src/app/chatbots/[id]/analytics/page.tsx';
let c1 = fs.readFileSync(p1, 'utf8');

// Fix 5
c1 = c1.replace("  thumbsDown: number;" + NL + "  avgResponseTime?: number;", "  thumbsDown: number;" + NL + "  thumbsUpPercentage?: number;" + NL + "  thumbsDownPercentage?: number;" + NL + "  avgResponseTime?: number;");

// Fix 1
c1 = c1.replace("      setAnalytics(analyticsData as any);", "      const rawAnalytics = analyticsData as any;" + NL + "      setAnalytics(rawAnalytics.analytics ? rawAnalytics.analytics : rawAnalytics);");

// Fix 3
c1 = c1.replace("{new Date(log.timestamp).toLocaleDateString()}", "{log.timestamp ? new Date(log.timestamp).toLocaleDateString() : '-'}");

fs.writeFileSync(p1, c1, 'utf8');
console.log('Fixed analytics/page.tsx');