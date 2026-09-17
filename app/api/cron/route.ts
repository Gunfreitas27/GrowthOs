import { NextRequest, NextResponse } from 'next/server';
import { db, maturityScores, chatMessages } from '@/lib/db';

export const runtime = 'nodejs';

// Weekly anomaly detection: flags >30% WoW score change
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: implement anomaly detection logic
  // For now: log that cron ran
  console.log('[Cron] Anomaly detection run at', new Date().toISOString());

  return NextResponse.json({ ok: true });
}
