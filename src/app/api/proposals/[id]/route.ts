import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { proposals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const PatchSchema = z.object({
  htmlEditado: z.string().optional(),
  status: z.enum(['draft', 'sent', 'won', 'lost']).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [p] = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(p);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parse = PatchSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: 'Input inválido' }, { status: 400 });
  await db
    .update(proposals)
    .set({ ...parse.data, updatedAt: new Date() })
    .where(eq(proposals.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await db.delete(proposals).where(eq(proposals.id, id));
  return NextResponse.json({ ok: true });
}
