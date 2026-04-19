import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { services } from '@/lib/db/schema';
import { ServiceSchema } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = ServiceSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  await db
    .update(services)
    .set({
      ...parse.data,
      priceMinMXN: parse.data.priceMinMXN ?? null,
      priceMaxMXN: parse.data.priceMaxMXN ?? null,
      durationEstimate: parse.data.durationEstimate ?? null,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { error } = await requireAuth();
  if (error) return error;
  await db.delete(services).where(eq(services.id, id));
  return NextResponse.json({ ok: true });
}
