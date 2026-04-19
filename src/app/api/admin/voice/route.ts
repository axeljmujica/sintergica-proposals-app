import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { voiceRules } from '@/lib/db/schema';
import { VoiceRulesSchema } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const [row] = await db.select().from(voiceRules).limit(1);
  return NextResponse.json(row || null);
}

export async function PUT(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  const parse = VoiceRulesSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.issues[0]?.message }, { status: 400 });
  const [existing] = await db.select().from(voiceRules).limit(1);
  if (existing) {
    await db.update(voiceRules).set({ ...parse.data, updatedAt: new Date() });
  } else {
    await db.insert(voiceRules).values(parse.data);
  }
  return NextResponse.json({ ok: true });
}
