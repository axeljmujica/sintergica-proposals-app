import type { ProposalInput } from '@/lib/types';

export function compileUserPrompt(input: ProposalInput): string {
  return `Genera la propuesta estratégica integral completa para este cliente.

DATOS DEL CLIENTE:
- Cliente: ${input.cliente}
- Contacto principal: ${input.contacto || '(no especificado, infiere desde las notas)'}
- Cargo: ${input.cargo || '(no especificado)'}
- Industria: ${input.industria || '(infiere desde las notas)'}
- Tipo: ${input.tipo}
- Fecha de la sesión de diagnóstico: ${input.fechaSesion}
${input.productos ? `- Productos Sintérgica sugeridos: ${input.productos}` : ''}
${input.inversion ? `- Inversión objetivo aproximada: ${input.inversion}` : ''}
${input.tiempo ? `- Tiempo de entrega esperado: ${input.tiempo}` : ''}

NOTAS DE LA SESIÓN DE DIAGNÓSTICO:
"""
${input.notas}
"""

Genera ahora el HTML completo de la propuesta. Solo HTML, sin fences, sin explicaciones. Empieza directamente con <div class="cover">.`;
}
