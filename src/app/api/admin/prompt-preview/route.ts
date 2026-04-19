import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { compileSystemPromptText } from '@/lib/prompts/compile-system-prompt';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;
  const url = new URL(req.url);
  const industria = url.searchParams.get('industria');
  const tipo = url.searchParams.get('tipo') as 'B2B' | 'B2G' | 'Piloto' | null;

  const prompt = await compileSystemPromptText({ industria, tipo });

  // Estimación: ~4 caracteres por token (suficiente para la preview)
  const tokens = Math.round(prompt.length / 4);

  return NextResponse.json({ prompt, tokens });
}
