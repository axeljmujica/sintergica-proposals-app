import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { products } from '@/lib/db/schema';
import { ProductSchema } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const list = await db.select().from(products).orderBy(asc(products.sortOrder));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = ProductSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  const [row] = await db
    .insert(products)
    .values({ ...parse.data, notes: parse.data.notes ?? null })
    .returning();
  return NextResponse.json(row);
}
