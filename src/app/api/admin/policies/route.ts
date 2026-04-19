import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { policies } from '@/lib/db/schema';
import { PolicySchema } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';
import { z } from 'zod';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const list = await db.select().from(policies).orderBy(asc(policies.sortOrder));
  return NextResponse.json(list);
}

const PoliciesArraySchema = z.array(PolicySchema.extend({ id: z.string().optional() }));

export async function PUT(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = PoliciesArraySchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  // Replace-all strategy: delete and insert.
  await db.delete(policies);
  if (parse.data.length > 0) {
    await db.insert(policies).values(parse.data.map(({ id, ...rest }) => rest));
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = PolicySchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  const [row] = await db.insert(policies).values(parse.data).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  await db.delete(policies).where(eq(policies.id, id));
  return NextResponse.json({ ok: true });
}
