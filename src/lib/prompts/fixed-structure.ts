export const FIXED_STRUCTURE = `ESTRUCTURA OBLIGATORIA DEL DOCUMENTO

Genera el documento completo en HTML semántico. Las 11 secciones son obligatorias:

1. Portada (div.cover con marca, label, título, subtítulo, meta de cliente/preparador/fecha)
2. Resumen Ejecutivo (h2 + 3-4 párrafos en prosa, SIN bullets)
   - Apertura fija: "El presente documento es el resultado de la Sesión de Diagnóstico Inteligente realizada el [fecha] con [contacto] de [cliente]…"
3. Diagnóstico Situacional (h2)
   - 2.1 Contexto (h3 + prosa 1-3 párrafos)
   - 2.2 Estado Operativo Actual (h3 + tabla cuando hay datos)
   - 2.3 Hallazgos del Diagnóstico (h3 + 5-6 hallazgos en formato A-F, cada uno h4 + párrafo)
4. Solución Propuesta (h2)
   - Tabla resumen de productos
   - Cada pilar/módulo como h3 + 2-3 párrafos descriptivos
5. Modalidad de Despliegue (h2 + tabla comparativa SaaS / VPC / On-Premise / Híbrido)
   - Recomendación específica al final
6. Plan de Trabajo (h2 + tabla con Fase / Actividades / Duración / Entregable)
   - Mínimo 4 fases
7. Proyección de Impacto (h2)
   - 6.1 Metodología (h3 + párrafo citando 3 fuentes documentables)
   - 6.2 Indicadores Proyectados (h3 + tabla con KPI / Línea Base / Proyección / Fuente, mínimo 6-8 KPIs)
8. Inversión (h2)
   - Tabla detallada con 8-12 conceptos
   - Fila SUBTOTAL en pricing-row
   - Fila TOTAL en pricing-total
   - Si aplica: tabla de licencias mensuales
   - Esquema de pago, IVA, descuento de consultoría
9. Por Qué Sintérgica AI (h2)
   - 8.1 Capacidades Propias (h3 + párrafo descriptivo)
   - 8.2 Comparativo Técnico (h3 + tabla Sintérgica vs Proveedores Globales)
   - 8.3 Beneficios Específicos para [Cliente] (h3 + 4-6 puntos)
10. Próximos Pasos (h2 + tabla numerada con # / Acción / Responsable / Fecha)
    - Mínimo 5-6 acciones
11. Términos y Condiciones (h2 + lista de bullets con vigencia, inicio, tiempos, esquema de pago, licencias, soberanía, cumplimiento, sin permanencia, supervisión humana, confidencialidad)

REGLAS DE OUTPUT

- Devuelve ÚNICAMENTE HTML válido para insertar dentro de un div contenedor.
- NO incluyas <html>, <head>, <body>, <!DOCTYPE>, ni fences de markdown.
- NO incluyas explicaciones, comentarios ni notas antes o después del HTML.
- Empieza directamente con <div class="cover">.
- Etiquetas permitidas: div, h1, h2, h3, h4, p, ul, ol, li, table, thead, tbody, tr, th, td, strong, em, blockquote
- Clases CSS disponibles: cover, cover-brand, cover-tag, cover-label, cover-title, cover-sub, cover-meta, pricing-row, pricing-total

Patrón obligatorio de la portada:
<div class="cover">
  <div class="cover-brand">SINTÉRGICA</div>
  <div class="cover-tag">Laboratorio de IA · Consultora de Transformación Digital</div>
  <div class="cover-label">PROPUESTA ESTRATÉGICA INTEGRAL</div>
  <div class="cover-title">[Título descriptivo de la solución]</div>
  <div class="cover-sub">[Subtítulo con productos involucrados]</div>
  <div class="cover-meta">
    <p><strong>Preparado para:</strong><br>[Cliente]<br>[Contacto] · [Cargo]</p>
    <p><strong>Preparado por:</strong><br>Sintérgica AI<br>Axel Mujica · Director de Estrategia</p>
    <p><strong>[Mes Año]</strong> · Documento Confidencial</p>
  </div>
</div>

Genera contenido SUSTANCIAL y ESPECÍFICO al cliente real. Si las notas mencionan un dolor concreto, ese dolor debe aparecer textualmente como hallazgo. Si las notas mencionan un sistema actual del cliente (ej. Aspel, Google Drive, WhatsApp), referénciarlo con su nombre real.`;
