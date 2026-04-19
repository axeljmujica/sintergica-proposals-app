import crypto from 'node:crypto';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  companyConfig,
  products,
  services,
  policies,
  voiceRules,
  verticals,
  knowledgeBases,
  promptVersions,
} from '@/lib/db/schema';
import { formatMXN } from '@/lib/utils';
import { FIXED_STRUCTURE } from './fixed-structure';

export type CompileOpts = {
  industria?: string | null;
  tipo?: 'B2B' | 'B2G' | 'Piloto' | null;
  createdBy?: string;
};

export async function compileSystemPromptText(opts: CompileOpts = {}): Promise<string> {
  const [company] = await db.select().from(companyConfig).limit(1);
  const [voice] = await db.select().from(voiceRules).limit(1);
  const prods = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.sortOrder));
  const svcs = await db
    .select()
    .from(services)
    .where(eq(services.active, true))
    .orderBy(asc(services.sortOrder));
  const pols = await db
    .select()
    .from(policies)
    .where(eq(policies.active, true))
    .orderBy(asc(policies.sortOrder));

  let matchedVertical = null;
  if (opts.industria) {
    const industriaLower = opts.industria.toLowerCase();
    const all = await db.select().from(verticals).where(eq(verticals.active, true));
    matchedVertical =
      all.find(
        (v) =>
          v.slug === industriaLower ||
          v.name.toLowerCase() === industriaLower ||
          v.name.toLowerCase().includes(industriaLower) ||
          industriaLower.includes(v.slug)
      ) || null;
  }

  const allKbs = await db.select().from(knowledgeBases).where(eq(knowledgeBases.active, true));
  const selectedKbs = allKbs.filter((kb) => {
    if (kb.alwaysInclude) return true;
    const tags = (kb.tags || []).map((t) => t.toLowerCase());
    if (opts.industria) {
      const ind = opts.industria.toLowerCase();
      if (tags.some((t) => ind.includes(t) || t.includes(ind))) return true;
    }
    if (opts.tipo) {
      if (tags.some((t) => t.toLowerCase() === opts.tipo!.toLowerCase())) return true;
    }
    return false;
  });

  const out: string[] = [];

  if (company) {
    out.push('CONTEXTO DE SINTÉRGICA AI');
    out.push(
      `${company.brandName} (${company.legalName}) — ${company.tagline}. ${company.description} Oficinas: ${company.offices}. Contacto: ${company.contactEmail} · ${company.contactPhone} · ${company.website}. Preparador por defecto: ${company.defaultPreparedBy}.`
    );
    out.push('');
  }

  const allForbidden = new Set<string>();
  for (const p of prods) for (const a of p.forbiddenAliases || []) allForbidden.add(a);
  if (voice) for (const w of voice.forbiddenWords || []) allForbidden.add(w);
  if (allForbidden.size > 0) {
    out.push('REGLA CRÍTICA DE NAMING');
    out.push(
      `NUNCA menciones ninguno de estos nombres en la propuesta: ${Array.from(allForbidden).join(', ')}. Son nombres internos/técnicos o productos de terceros que no deben aparecer en comunicación externa.`
    );
    out.push('');
  }

  if (prods.length > 0) {
    out.push('PRODUCTOS Y PRECIOS');
    for (const p of prods) {
      out.push(`${p.name} (${p.category}):`);
      out.push(p.longDescription);
      for (const t of p.pricingTiers || []) {
        const parts: string[] = [`- ${t.name}:`];
        if (t.monthlyPriceMXN) parts.push(`$${formatMXN(t.monthlyPriceMXN)} MXN/mes`);
        if (t.oneTimePriceMXN) parts.push(`$${formatMXN(t.oneTimePriceMXN)} MXN una vez`);
        if (t.unit) parts.push(t.unit);
        if (t.includes) parts.push(`(${t.includes})`);
        out.push(parts.join(' '));
      }
      if (p.notes) out.push(`Nota: ${p.notes}`);
      out.push('');
    }
  }

  if (svcs.length > 0) {
    out.push('SERVICIOS');
    for (const s of svcs) {
      const priceRange =
        s.priceMinMXN && s.priceMaxMXN
          ? `$${formatMXN(s.priceMinMXN)} – $${formatMXN(s.priceMaxMXN)} MXN ${s.unit}`
          : s.priceMinMXN
            ? `$${formatMXN(s.priceMinMXN)} MXN ${s.unit}`
            : s.unit;
      out.push(`- ${s.name} (${s.category}): ${s.description} — ${priceRange}${s.durationEstimate ? ` · ${s.durationEstimate}` : ''}`);
    }
    out.push('');
  }

  if (pols.length > 0) {
    out.push('POLÍTICAS COMERCIALES');
    for (const p of pols) {
      out.push(`- ${p.title}: ${p.body}`);
    }
    out.push('');
  }

  if (voice) {
    out.push('VOZ Y ESTILO');
    out.push(voice.toneDescription);
    out.push(voice.styleGuidelines);
    if ((voice.preferredPhrases || []).length > 0) {
      out.push('Frases preferidas:');
      for (const pp of voice.preferredPhrases) {
        out.push(`- En lugar de "${pp.instead_of}" usar "${pp.use}"`);
      }
    }
    out.push('');
  }

  if (matchedVertical) {
    out.push(`CONTEXTO ESPECÍFICO DEL SECTOR (${matchedVertical.name})`);
    if (matchedVertical.context) out.push(matchedVertical.context);
    if ((matchedVertical.typicalPainPoints || []).length > 0) {
      out.push(`Dolores típicos: ${matchedVertical.typicalPainPoints.join('; ')}`);
    }
    if ((matchedVertical.metrics || []).length > 0) {
      out.push('Métricas estándar:');
      for (const m of matchedVertical.metrics) {
        out.push(`- ${m.kpi}: línea base ${m.baseline} → proyección ${m.projection} (fuente: ${m.source})`);
      }
    }
    if ((matchedVertical.recommendedProducts || []).length > 0) {
      out.push(`Productos recomendados: ${matchedVertical.recommendedProducts.join(', ')}`);
    }
    out.push('');
  }

  if (selectedKbs.length > 0) {
    out.push('CONOCIMIENTO ADICIONAL');
    for (const kb of selectedKbs) {
      out.push(`## ${kb.title}`);
      out.push(kb.content);
      out.push('');
    }
  }

  out.push(FIXED_STRUCTURE);

  return out.join('\n');
}

export function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

export async function compileAndVersionPrompt(
  opts: CompileOpts = {}
): Promise<{ prompt: string; versionId: string; version: number }> {
  const prompt = await compileSystemPromptText(opts);
  const hash = hashPrompt(prompt);

  const [existing] = await db
    .select()
    .from(promptVersions)
    .where(eq(promptVersions.hash, hash))
    .limit(1);
  if (existing) {
    return { prompt, versionId: existing.id, version: existing.version };
  }

  const [last] = await db
    .select()
    .from(promptVersions)
    .orderBy(desc(promptVersions.version))
    .limit(1);
  const nextVersion = (last?.version ?? 0) + 1;

  const [inserted] = await db
    .insert(promptVersions)
    .values({
      version: nextVersion,
      systemPrompt: prompt,
      hash,
      changeNote: 'Auto-versioned on prompt compilation',
      createdBy: opts.createdBy || 'system',
    })
    .returning();

  return { prompt, versionId: inserted.id, version: inserted.version };
}
