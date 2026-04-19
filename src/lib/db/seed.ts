import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './client';
import {
  companyConfig,
  products,
  services,
  policies,
  voiceRules,
  verticals,
  knowledgeBases,
  users,
} from './schema';

async function seed() {
  console.log('Seeding database...');

  // Company config
  const existingCompany = await db.select().from(companyConfig).limit(1);
  if (existingCompany.length === 0) {
    await db.insert(companyConfig).values({
      legalName: 'MDA Startup Labs Solutions SAPI de CV',
      brandName: 'Sintérgica AI',
      tagline: 'La infraestructura de IA de referencia para América Latina',
      description: 'Laboratorio de IA y consultora de transformación digital mexicana',
      contactEmail: 'hola@sintergica.ai',
      contactPhone: '+52 56 5922 7340',
      website: 'sintergica.ai',
      offices: 'CDMX · Boca del Río · Xalapa',
      logoText: 'SINTÉRGICA',
      defaultPreparedBy: 'Axel Mujica · Director de Estrategia',
    });
  }

  // Voice rules
  const existingVoice = await db.select().from(voiceRules).limit(1);
  if (existingVoice.length === 0) {
    await db.insert(voiceRules).values({
      toneDescription:
        'Español mexicano formal pero directo, sin anglicismos innecesarios. Tono de consultor senior que conoce el negocio. Confiado sin arrogancia.',
      styleGuidelines: `## Reglas de redacción

- Hallazgos del diagnóstico en formato A, B, C, D, E, F — cada uno con título (h4) y un párrafo denso que cuantifique el dolor.
- Toda métrica debe estar sustentada con una fuente documentable (estudios, normativa, casos referenciales).
- Separador de miles con coma (ej. 1,200,000).
- Moneda: siempre MXN explícito.
- Evita viñetas en secciones narrativas (Resumen Ejecutivo, Contexto, Metodología).
- Usa tablas para datos comparativos, cronogramas, pricing y KPIs.
- Siempre cierra con 5-6 próximos pasos numerados y responsables asignados.`,
      forbiddenWords: [
        'GoHighLevel',
        'GHL',
        'OpenWebUI',
        'OpenFang',
        'Fleetbase',
        'Qwen',
        'Kimi',
        'ActivePieces',
        'N8N',
      ],
      preferredPhrases: [
        { instead_of: 'GPT/Gemini/Claude', use: 'modelos globales de frontera' },
        { instead_of: 'chatbots de OpenAI/Google', use: 'chatbots globales' },
        {
          instead_of: 'modelo fundacional',
          use: 'modelo especializado con corpus mexicano y LATAM',
        },
      ],
    });
  }

  // Products
  const existingProducts = await db.select().from(products).limit(1);
  if (existingProducts.length === 0) {
    await db.insert(products).values([
      {
        name: 'Lattice Platform',
        category: 'Plataforma',
        shortDescription: 'Plataforma central de IA para empresas',
        longDescription:
          'Plataforma unificada para desplegar asistentes, flujos y agentes de IA dentro de la infraestructura del cliente. Incluye orquestación, RAG, control de acceso y trazabilidad completa.',
        forbiddenAliases: ['OpenWebUI', 'OpenFang'],
        pricingTiers: [
          { name: 'Starter', monthlyPriceMXN: 14990, oneTimePriceMXN: null, unit: '/mes', includes: '8,000 CL · hasta 10 usuarios' },
          { name: 'Pro', monthlyPriceMXN: 44900, oneTimePriceMXN: null, unit: '/mes', includes: '30,000 CL · hasta 50 usuarios' },
          { name: 'Business', monthlyPriceMXN: 107500, oneTimePriceMXN: null, unit: '/mes', includes: '100,000 CL · usuarios ilimitados' },
          { name: 'Despliegue Privado', monthlyPriceMXN: 250000, oneTimePriceMXN: null, unit: '/mes+', includes: 'VPC / On-Premise, SLA dedicado' },
        ],
        sortOrder: 10,
      },
      {
        name: 'Lattice Flows',
        category: 'Automatización',
        shortDescription: 'Motor de flujos y agentes de IA',
        longDescription:
          'Constructor visual de agentes y automatizaciones de IA sobre la plataforma Lattice. Conecta fuentes de datos, LLMs y acciones empresariales.',
        forbiddenAliases: ['ActivePieces', 'N8N'],
        pricingTiers: [],
        notes: 'Incluido en todos los tiers de Lattice Platform',
        sortOrder: 20,
      },
      {
        name: 'SalesHub CRM',
        category: 'CRM',
        shortDescription: 'CRM con IA operativa para equipos de ventas',
        longDescription:
          'CRM con WhatsApp, email, automatizaciones, y agentes de IA especializados para ventas consultivas en el mercado mexicano.',
        forbiddenAliases: ['GoHighLevel', 'GHL'],
        pricingTiers: [
          { name: 'Onboarding (primeros 3 meses)', monthlyPriceMXN: 4500, oneTimePriceMXN: null, unit: '/mes', includes: 'Setup + acompañamiento' },
          { name: 'Operación', monthlyPriceMXN: 7200, oneTimePriceMXN: null, unit: '/mes', includes: 'Operación mensual continua' },
        ],
        sortOrder: 30,
      },
      {
        name: 'Nahui',
        category: 'Operaciones',
        shortDescription: 'Plataforma de gestión de flotas y logística',
        longDescription:
          'Sistema de gestión de flotas, rutas y operaciones logísticas con IA embebida para optimización y trazabilidad.',
        forbiddenAliases: ['Fleetbase'],
        pricingTiers: [
          { name: 'Starter', monthlyPriceMXN: 8990, oneTimePriceMXN: null, unit: '/mes', includes: 'Hasta 10 vehículos' },
          { name: 'Pro', monthlyPriceMXN: 21500, oneTimePriceMXN: null, unit: '/mes', includes: 'Hasta 50 vehículos' },
          { name: 'Business', monthlyPriceMXN: 53800, oneTimePriceMXN: null, unit: '/mes', includes: 'Hasta 200 vehículos' },
          { name: 'Enterprise', monthlyPriceMXN: 107500, oneTimePriceMXN: null, unit: '/mes+', includes: 'Flotas ilimitadas' },
        ],
        sortOrder: 40,
      },
      {
        name: 'Familia Na\'at',
        category: 'Modelo',
        shortDescription: 'Modelos especializados con corpus mexicano y LATAM',
        longDescription:
          'Familia de modelos de lenguaje especializados en español mexicano, normativa LATAM y contextos locales. Disponibles en tamaños 4B, 9B y 1T.',
        forbiddenAliases: ['Kimi', 'Qwen'],
        pricingTiers: [
          { name: 'Na\'at 4B', monthlyPriceMXN: null, oneTimePriceMXN: null, unit: '/M tokens', includes: '$8 MXN por millón de tokens' },
          { name: 'Na\'at 9B', monthlyPriceMXN: null, oneTimePriceMXN: null, unit: '/M tokens', includes: '$12 MXN por millón de tokens' },
          { name: 'Na\'at Full 1T', monthlyPriceMXN: null, oneTimePriceMXN: null, unit: '/M tokens', includes: '$26 MXN por millón de tokens' },
        ],
        notes: 'Modelo especializado con corpus mexicano y LATAM, NUNCA fundacional',
        sortOrder: 50,
      },
      {
        name: 'Seeb',
        category: 'Modelo Vertical',
        shortDescription: 'Modelos verticales especializados por industria',
        longDescription:
          'Modelos verticales fine-tuneados sobre Na\'at para industrias específicas: Legal, Gobierno, Logística, Energía, Salud, Financiero.',
        forbiddenAliases: [],
        pricingTiers: [
          { name: 'Seeb', monthlyPriceMXN: null, oneTimePriceMXN: null, unit: '/M tokens', includes: '$10 MXN por millón de tokens' },
          { name: 'Seeb Pro', monthlyPriceMXN: null, oneTimePriceMXN: null, unit: '/M tokens', includes: '$16 MXN por millón de tokens' },
        ],
        notes: 'Exclusividad de uso dentro de Lattice, no portable, cliente no posee pesos',
        sortOrder: 60,
      },
    ]);
  }

  // Services
  const existingServices = await db.select().from(services).limit(1);
  if (existingServices.length === 0) {
    await db.insert(services).values([
      { name: 'Sesión de Diagnóstico Inteligente', category: 'Consultoría', description: 'Sesión de 45 minutos para mapear el caso de negocio y oportunidades de IA', priceMinMXN: 0, priceMaxMXN: 0, unit: 'gratuita', durationEstimate: '45 min', sortOrder: 10 },
      { name: 'Consultoría estratégica', category: 'Consultoría', description: 'Proyectos de consultoría estratégica personalizada', priceMinMXN: 8960, priceMaxMXN: 268000, unit: 'por proyecto', durationEstimate: '2-12 semanas', sortOrder: 20 },
      { name: 'Implementación Lattice SaaS', category: 'Implementación', description: 'Setup completo en la nube de Sintérgica', priceMinMXN: 80000, priceMaxMXN: 180000, unit: 'una vez', durationEstimate: '2-4 semanas', sortOrder: 30 },
      { name: 'Implementación VPC', category: 'Implementación', description: 'Despliegue en nube privada del cliente', priceMinMXN: 200000, priceMaxMXN: 450000, unit: 'una vez', durationEstimate: '4-8 semanas', sortOrder: 40 },
      { name: 'Implementación On-Premise', category: 'Implementación', description: 'Despliegue en infraestructura del cliente', priceMinMXN: 450000, priceMaxMXN: 900000, unit: 'una vez', durationEstimate: '8-16 semanas', sortOrder: 50 },
      { name: 'Fine-tuning Seeb', category: 'IA avanzada', description: 'Fine-tuning de modelo vertical dedicado para el cliente', priceMinMXN: 268000, priceMaxMXN: 895000, unit: 'una vez', durationEstimate: '4-12 semanas', sortOrder: 60 },
      { name: 'Desarrollo a medida — agente simple', category: 'Desarrollo', description: 'Agente de IA con 1-2 herramientas', priceMinMXN: 17900, priceMaxMXN: 17900, unit: 'por agente', durationEstimate: '1-2 semanas', sortOrder: 70 },
      { name: 'Desarrollo a medida — agente complejo', category: 'Desarrollo', description: 'Agente con múltiples herramientas, integraciones y memoria', priceMinMXN: 89600, priceMaxMXN: 179000, unit: 'por agente', durationEstimate: '3-6 semanas', sortOrder: 80 },
      { name: 'Capacitación medio día', category: 'Capacitación', description: 'Taller de IA aplicada al negocio', priceMinMXN: 17900, priceMaxMXN: 35800, unit: 'por sesión', durationEstimate: '4 horas', sortOrder: 90 },
      { name: 'MaaS Starter', category: 'Servicio gestionado', description: 'Model-as-a-Service con operación gestionada', priceMinMXN: 17900, priceMaxMXN: 17900, unit: '/mes', sortOrder: 100 },
      { name: 'MaaS Pro', category: 'Servicio gestionado', description: 'MaaS Pro', priceMinMXN: 35800, priceMaxMXN: 35800, unit: '/mes', sortOrder: 110 },
      { name: 'MaaS Business', category: 'Servicio gestionado', description: 'MaaS Business', priceMinMXN: 89600, priceMaxMXN: 89600, unit: '/mes', sortOrder: 120 },
      { name: 'Landing básica', category: 'Desarrollo', description: 'Landing page profesional', priceMinMXN: 8960, priceMaxMXN: 8960, unit: 'una vez', sortOrder: 130 },
      { name: 'Ecommerce básico', category: 'Desarrollo', description: 'Tienda en línea funcional', priceMinMXN: 44800, priceMaxMXN: 44800, unit: 'una vez', sortOrder: 140 },
      { name: 'Growth Partner', category: 'Consultoría', description: 'Acompañamiento estratégico continuo', priceMinMXN: 44900, priceMaxMXN: 250000, unit: '/mes', sortOrder: 150 },
    ]);
  }

  // Policies
  const existingPolicies = await db.select().from(policies).limit(1);
  if (existingPolicies.length === 0) {
    await db.insert(policies).values([
      { key: 'discount_consultancy', title: 'Descuento de consultoría', body: 'El costo de la consultoría se descuenta íntegramente de la implementación si el cliente avanza en 90 días.', applyAlways: true, sortOrder: 10 },
      { key: 'annual_discount', title: 'Descuento anual', body: 'Descuento del 15% en contratación anual de licencias.', applyAlways: true, sortOrder: 20 },
      { key: 'payment_schedule', title: 'Esquema de pago', body: '50% anticipo · 30% al go-live del piloto · 20% al cierre.', applyAlways: true, sortOrder: 30 },
      { key: 'vat_disclosure', title: 'IVA y facturación', body: 'Todos los precios + IVA 16%, facturación en MXN con CFDI 4.0.', applyAlways: true, sortOrder: 40 },
      { key: 'data_sovereignty', title: 'Soberanía de datos', body: 'Los datos del cliente nunca salen de su infraestructura. Certificado zero-retention al cierre.', applyAlways: true, sortOrder: 50 },
      { key: 'proposal_validity', title: 'Vigencia de propuesta', body: 'Vigencia de propuesta: 30 días naturales.', applyAlways: true, sortOrder: 60 },
    ]);
  }

  // Verticals
  const existingVerticals = await db.select().from(verticals).limit(1);
  if (existingVerticals.length === 0) {
    await db.insert(verticals).values([
      {
        name: 'Legal',
        slug: 'legal',
        recommendedProducts: ['Lattice Platform', 'Seeb', 'Familia Na\'at'],
        typicalPainPoints: [
          'Revisión contractual manual y lenta',
          'Búsqueda de precedentes jurisprudenciales dispersa',
          'Redacción de escritos repetitiva',
        ],
        metrics: [
          { kpi: 'Tiempo de revisión contractual', baseline: '4-6 horas', projection: '30-45 min', source: 'Casos referenciales despachos mexicanos 2024' },
          { kpi: 'Cobertura de búsqueda jurisprudencial', baseline: '60%', projection: '95%', source: 'Benchmark interno Sintérgica' },
        ],
        context: 'Firmas legales mexicanas con necesidad de soberanía de datos y cumplimiento de secreto profesional.',
      },
      {
        name: 'Gobierno',
        slug: 'gobierno',
        recommendedProducts: ['Lattice Platform', 'Seeb', 'Nahui'],
        typicalPainPoints: [
          'Presiones presupuestales y procesos de licitación complejos',
          'Cumplimiento normativo y transparencia',
          'Integración con sistemas legados',
        ],
        metrics: [
          { kpi: 'Tiempo de atención ciudadana', baseline: '15-20 min', projection: '3-5 min', source: 'Caso Toluca 2025' },
          { kpi: 'Cobertura digital de trámites', baseline: '35%', projection: '80%', source: 'SEDECO CDMX' },
        ],
        context: 'Proyectos B2G requieren soberanía de datos, cumplimiento LFPDPPP y certificación MoReq.',
      },
      {
        name: 'Logística y Comercio Exterior',
        slug: 'logistica',
        recommendedProducts: ['Nahui', 'Lattice Platform', 'Seeb'],
        typicalPainPoints: [
          'Documentación aduanal manual y propensa a errores',
          'Visibilidad fragmentada de la cadena de transporte',
          'Coordinación con múltiples actores (agentes, transportistas, bodegas)',
        ],
        metrics: [
          { kpi: 'Tiempos de despacho', baseline: '72 horas', projection: '43 horas', source: 'Casos 3PL mexicanos 2023-2024' },
          { kpi: 'Errores documentales', baseline: '8%', projection: '3%', source: 'SAT-Aduanas MX' },
        ],
        context: 'Regulación SAT-Aduanas, CFDI de traslado obligatorio, requerimientos de trazabilidad IMMEX y carta porte.',
      },
      {
        name: 'Energía',
        slug: 'energia',
        recommendedProducts: ['Lattice Platform', 'Seeb'],
        typicalPainPoints: [
          'Mantenimiento predictivo insuficiente',
          'Reportería regulatoria manual',
          'Optimización de consumo energético',
        ],
        metrics: [
          { kpi: 'Tiempo de elaboración de reportes CRE/CENACE', baseline: '40 horas/mes', projection: '8 horas/mes', source: 'CENACE' },
        ],
        context: 'Sector regulado por CRE, CENACE y ASEA. Obligaciones de reporte periódico estrictas.',
      },
      {
        name: 'Salud',
        slug: 'salud',
        recommendedProducts: ['Lattice Platform', 'Seeb'],
        typicalPainPoints: [
          'Documentación clínica manual',
          'Triaje ineficiente',
          'Cumplimiento de NOM-004',
        ],
        metrics: [
          { kpi: 'Tiempo de documentación por consulta', baseline: '12 min', projection: '3 min', source: 'Benchmark Sintérgica clínicas LATAM' },
        ],
        context: 'Normativa NOM-004-SSA3-2012 sobre expediente clínico. Datos de salud son datos sensibles según LFPDPPP.',
      },
      {
        name: 'Financiero',
        slug: 'financiero',
        recommendedProducts: ['Lattice Platform', 'Seeb', 'SalesHub CRM'],
        typicalPainPoints: [
          'KYC/AML manual y lento',
          'Análisis crediticio fragmentado',
          'Atención al cliente omnicanal deficiente',
        ],
        metrics: [
          { kpi: 'Tiempo de onboarding KYC', baseline: '48 horas', projection: '15 min', source: 'CNBV benchmark 2024' },
        ],
        context: 'Regulación CNBV, Banxico, UIF. Requerimientos de prevención de lavado y secreto bancario.',
      },
    ]);
  }

  // Knowledge bases
  const existingKbs = await db.select().from(knowledgeBases).limit(1);
  if (existingKbs.length === 0) {
    await db.insert(knowledgeBases).values([
      {
        title: 'Caso referencial Toluca 2025',
        slug: 'caso-toluca-2025',
        category: 'case_study',
        content: `# Caso referencial: Municipio de Toluca, 2025

**Contexto:** Gestión de residuos sólidos urbanos (RSU) con flota de 180 unidades y cobertura a 900,000 habitantes.

**Solución desplegada:**
- Nahui para gestión de flota
- Lattice Platform con Seeb para atención ciudadana
- Integración con sistema SIAM

**Resultados 6 meses:**
- −40% tiempos de recolección
- −62% quejas ciudadanas
- 95% cobertura digital de reportes
- ROI: 4.2x en el primer año`,
        tags: ['logistica', 'gobierno', 'b2g', 'rsu'],
        alwaysInclude: false,
      },
      {
        title: 'Marco regulatorio aduanal SAT',
        slug: 'regulatorio-aduanal-sat',
        category: 'regulatory',
        content: `# Marco regulatorio aduanal SAT-Aduanas México

- CFDI de traslado obligatorio desde 2023
- Carta Porte complemento obligatorio para transporte terrestre
- IMMEX: requerimientos de trazabilidad completa del inventario
- Ventanilla Única de Comercio Exterior Mexicano (VUCEM) para documentación
- Regla 1.6.1 de Reglas Generales de Comercio Exterior: archivo electrónico mínimo 5 años`,
        tags: ['logistica', 'aduanal', 'comercio-exterior'],
        alwaysInclude: false,
      },
      {
        title: 'Metodología de proyecciones B2G',
        slug: 'metodologia-proyecciones-b2g',
        category: 'methodology',
        content: `# Metodología de proyecciones para propuestas B2G

Para proyectos de gobierno, las proyecciones DEBEN:

1. Citar al menos 3 fuentes documentables (estudios académicos, casos publicados, estadísticas oficiales).
2. Usar intervalos conservadores en línea base (percentil 50-75).
3. Separar proyecciones de corto (6m), mediano (12m) y largo plazo (24m).
4. Vincular cada KPI a una política pública vigente o un indicador del PND.
5. Incluir ROI financiero y ROI social (ciudadanos impactados, horas ahorradas).`,
        tags: ['b2g', 'gobierno', 'metodologia'],
        alwaysInclude: false,
      },
    ]);
  }

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'axel@sintergica.ai';
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  const existingUser = await db.select().from(users).limit(1);
  if (existingUser.length === 0) {
    const passwordHash = adminHash || bcrypt.hashSync('cambiar-password-ya', 10);
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      name: 'Axel Mujica',
      role: 'admin',
    });
    if (!adminHash) {
      console.log(
        `\n⚠️  ADMIN_PASSWORD_HASH no estaba definido. Se creó usuario con password "cambiar-password-ya". Cambia el hash en producción.`
      );
    }
  }

  console.log('Seed completado.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
