import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';

export const companyConfig = pgTable('company_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  legalName: text('legal_name').notNull(),
  brandName: text('brand_name').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  website: text('website').notNull(),
  offices: text('offices').notNull(),
  logoText: text('logo_text').notNull(),
  defaultPreparedBy: text('default_prepared_by').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type PricingTier = {
  name: string;
  monthlyPriceMXN: number | null;
  oneTimePriceMXN: number | null;
  unit: string;
  includes: string;
};

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  shortDescription: text('short_description').notNull(),
  longDescription: text('long_description').notNull(),
  forbiddenAliases: jsonb('forbidden_aliases').$type<string[]>().notNull().default([]),
  pricingTiers: jsonb('pricing_tiers').$type<PricingTier[]>().notNull().default([]),
  notes: text('notes'),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  priceMinMXN: integer('price_min_mxn'),
  priceMaxMXN: integer('price_max_mxn'),
  unit: text('unit').notNull(),
  durationEstimate: text('duration_estimate'),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  applyAlways: boolean('apply_always').notNull().default(false),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
});

export type PreferredPhrase = { instead_of: string; use: string };

export const voiceRules = pgTable('voice_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  toneDescription: text('tone_description').notNull(),
  styleGuidelines: text('style_guidelines').notNull(),
  forbiddenWords: jsonb('forbidden_words').$type<string[]>().notNull().default([]),
  preferredPhrases: jsonb('preferred_phrases').$type<PreferredPhrase[]>().notNull().default([]),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type VerticalMetric = {
  kpi: string;
  baseline: string;
  projection: string;
  source: string;
};

export const verticals = pgTable('verticals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  recommendedProducts: jsonb('recommended_products').$type<string[]>().notNull().default([]),
  typicalPainPoints: jsonb('typical_pain_points').$type<string[]>().notNull().default([]),
  metrics: jsonb('metrics').$type<VerticalMetric[]>().notNull().default([]),
  context: text('context'),
  active: boolean('active').notNull().default(true),
});

export const knowledgeBases = pgTable('knowledge_bases', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  alwaysInclude: boolean('always_include').notNull().default(false),
  active: boolean('active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const promptVersions = pgTable('prompt_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  version: integer('version').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  hash: varchar('hash', { length: 64 }).notNull(),
  changeNote: text('change_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by').notNull(),
});

export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  cliente: text('cliente').notNull(),
  contacto: text('contacto'),
  cargo: text('cargo'),
  industria: text('industria'),
  tipo: varchar('tipo', { length: 16 }).notNull(),
  notas: text('notas').notNull(),
  productos: text('productos'),
  inversion: text('inversion'),
  tiempo: text('tiempo'),
  fechaSesion: text('fecha_sesion').notNull(),
  htmlOriginal: text('html_original').notNull(),
  htmlEditado: text('html_editado'),
  promptVersionId: uuid('prompt_version_id').references(() => promptVersions.id),
  status: varchar('status', { length: 16 }).notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: varchar('role', { length: 16 }).notNull().default('admin'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Policy = typeof policies.$inferSelect;
export type VoiceRules = typeof voiceRules.$inferSelect;
export type Vertical = typeof verticals.$inferSelect;
export type KnowledgeBase = typeof knowledgeBases.$inferSelect;
export type CompanyConfig = typeof companyConfig.$inferSelect;
export type PromptVersion = typeof promptVersions.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type User = typeof users.$inferSelect;
