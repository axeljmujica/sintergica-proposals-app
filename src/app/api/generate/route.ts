import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { proposals } from '@/lib/db/schema';
import { ProposalInputSchema } from '@/lib/types';
import { anthropic, ANTHROPIC_MODEL } from '@/lib/anthropic';
import { compileAndVersionPrompt } from '@/lib/prompts/compile-system-prompt';
import { compileUserPrompt } from '@/lib/prompts/compile-user-prompt';

export const runtime = 'nodejs';
export const maxDuration = 60;

function cleanHtml(raw: string): string {
  return raw
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parse = ProposalInputSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0]?.message || 'Input inválido' }, { status: 400 });
  }
  const input = parse.data;

  try {
    const { prompt, versionId } = await compileAndVersionPrompt({
      industria: input.industria,
      tipo: input.tipo,
      createdBy: session.user.email || 'unknown',
    });
    const userPrompt = compileUserPrompt(input);

    const resp = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 16000,
      system: prompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n');
    const html = cleanHtml(text);

    if (!html.startsWith('<')) {
      return NextResponse.json({ error: 'Claude devolvió un output sin HTML válido' }, { status: 502 });
    }

    const [inserted] = await db
      .insert(proposals)
      .values({
        cliente: input.cliente,
        contacto: input.contacto || null,
        cargo: input.cargo || null,
        industria: input.industria || null,
        tipo: input.tipo,
        notas: input.notas,
        productos: input.productos || null,
        inversion: input.inversion || null,
        tiempo: input.tiempo || null,
        fechaSesion: input.fechaSesion,
        htmlOriginal: html,
        promptVersionId: versionId,
        status: 'draft',
      })
      .returning();

    return NextResponse.json({ id: inserted.id, html, versionId });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: `Error de generación: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
