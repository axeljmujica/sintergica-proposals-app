import { z } from 'zod';

export const ProposalInputSchema = z.object({
  cliente: z.string().min(1, 'Cliente requerido'),
  contacto: z.string().optional().nullable(),
  cargo: z.string().optional().nullable(),
  industria: z.string().optional().nullable(),
  tipo: z.enum(['B2B', 'B2G', 'Piloto']),
  notas: z.string().min(20, 'Las notas son muy cortas'),
  productos: z.string().optional().nullable(),
  inversion: z.string().optional().nullable(),
  tiempo: z.string().optional().nullable(),
  fechaSesion: z.string().min(1),
});
export type ProposalInput = z.infer<typeof ProposalInputSchema>;

export const CompanyConfigSchema = z.object({
  legalName: z.string().min(1),
  brandName: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  website: z.string().min(1),
  offices: z.string().min(1),
  logoText: z.string().min(1),
  defaultPreparedBy: z.string().min(1),
});

export const PricingTierSchema = z.object({
  name: z.string().min(1),
  monthlyPriceMXN: z.number().nullable(),
  oneTimePriceMXN: z.number().nullable(),
  unit: z.string(),
  includes: z.string(),
});

export const ProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  forbiddenAliases: z.array(z.string()).default([]),
  pricingTiers: z.array(PricingTierSchema).default([]),
  notes: z.string().nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const ServiceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  priceMinMXN: z.number().nullable().optional(),
  priceMaxMXN: z.number().nullable().optional(),
  unit: z.string().min(1),
  durationEstimate: z.string().nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const PolicySchema = z.object({
  key: z.string().min(1).max(64),
  title: z.string().min(1),
  body: z.string().min(1),
  applyAlways: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const VoiceRulesSchema = z.object({
  toneDescription: z.string().min(1),
  styleGuidelines: z.string().min(1),
  forbiddenWords: z.array(z.string()).default([]),
  preferredPhrases: z
    .array(z.object({ instead_of: z.string(), use: z.string() }))
    .default([]),
});

export const VerticalSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).max(64),
  recommendedProducts: z.array(z.string()).default([]),
  typicalPainPoints: z.array(z.string()).default([]),
  metrics: z
    .array(
      z.object({
        kpi: z.string(),
        baseline: z.string(),
        projection: z.string(),
        source: z.string(),
      })
    )
    .default([]),
  context: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export const KnowledgeBaseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).max(128),
  category: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  alwaysInclude: z.boolean().default(false),
  active: z.boolean().default(true),
});
