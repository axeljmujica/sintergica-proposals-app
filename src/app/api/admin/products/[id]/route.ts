import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { products } from '@/lib/db/schema';
import { ProductSchema } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = ProductSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  await db
    .update(products)
    .set({ ...parse.data, notes: parse.data.notes ?? null, updatedAt: new Date() })
    .where(eq(products.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { error } = await requireAuth();
  if (error) return error;
  await db.delete(products).where(eq(products.id, id));
  return NextResponse.json({ ok: true });
}
