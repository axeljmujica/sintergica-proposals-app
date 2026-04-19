import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { services } from '@/lib/db/schema';
import { ServiceSchema } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const list = await db.select().from(services).orderBy(asc(services.sortOrder));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = ServiceSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  const [row] = await db
    .insert(services)
    .values({
      ...parse.data,
      priceMinMXN: parse.data.priceMinMXN ?? null,
      priceMaxMXN: parse.data.priceMaxMXN ?? null,
      durationEstimate: parse.data.durationEstimate ?? null,
    })
    .returning();
  return NextResponse.json(row);
}
