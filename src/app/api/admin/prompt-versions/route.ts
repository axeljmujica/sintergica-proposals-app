import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { promptVersions } from '@/lib/db/schema';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const list = await db
    .select()
    .from(promptVersions)
    .orderBy(desc(promptVersions.version));
  return NextResponse.json(list);
}
