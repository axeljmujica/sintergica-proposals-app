import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { knowledgeBases } from '@/lib/db/schema';
import { KnowledgeBaseSchema } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const list = await db.select().from(knowledgeBases).orderBy(desc(knowledgeBases.updatedAt));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = KnowledgeBaseSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  const [row] = await db.insert(knowledgeBases).values(parse.data).returning();
  return NextResponse.json(row);
}
