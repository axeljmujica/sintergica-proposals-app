import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { compileSystemPromptText } from '@/lib/prompts/compile-system-prompt';
import { anthropic, ANTHROPIC_MODEL } from '@/lib/anthropic';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const url = new URL(req.url);
  const industria = url.searchParams.get('industria');
  const tipo = url.searchParams.get('tipo') as 'B2B' | 'B2G' | 'Piloto' | null;

  const prompt = await compileSystemPromptText({ industria, tipo });

  let tokens: number | null = null;
  try {
    const res = await anthropic.messages.countTokens({
      model: ANTHROPIC_MODEL,
      system: prompt,
      messages: [{ role: 'user', content: 'placeholder' }],
    });
    tokens = res.input_tokens;
  } catch {
    // silent
  }

  return NextResponse.json({ prompt, tokens });
}
