import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { verticals } from '@/lib/db/schema';
import { VerticalSchema } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const list = await db.select().from(verticals).orderBy(asc(verticals.name));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = VerticalSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  const [row] = await db
    .insert(verticals)
    .values({ ...parse.data, context: parse.data.context ?? null })
    .returning();
  return NextResponse.json(row);
}
