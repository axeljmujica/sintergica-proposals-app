# Sintérgica · Generador de Propuestas

Aplicación web para generar propuestas estratégicas integrales de Sintérgica AI a partir de notas de sesiones de diagnóstico, usando Claude. Incluye panel de administración para gestionar productos, precios, políticas, voz, verticales y bases de conocimiento sin tocar código.

**Stack:** Next.js 15 · TypeScript · Tailwind v4 · Drizzle ORM (Postgres) · Auth.js v5 · Anthropic SDK (Claude Sonnet 4.5) · React-PDF · TipTap.

**Despliegue:** Vercel Plan Hobby (gratis). El PDF se genera 100% client-side para evitar timeouts.

## Desarrollo local

```bash
pnpm install
cp .env.local.example .env.local
# Edita .env.local con tus credenciales
pnpm db:push      # Crea tablas
pnpm db:seed      # Carga datos iniciales (productos, verticales, KBs, etc.)
pnpm dev
```

Abre http://localhost:3000 y entra con `ADMIN_EMAIL` / el password del hash que usaste.

### Generar el hash del password admin

```bash
node -e "console.log(require('bcryptjs').hashSync('mi-password-seguro', 10))"
```

Copia el output a `ADMIN_PASSWORD_HASH` en `.env.local`.

## Variables de entorno

```
ANTHROPIC_API_KEY=sk-ant-...
POSTGRES_URL=postgres://...
AUTH_SECRET=<openssl rand -base64 32>
AUTH_TRUST_HOST=true
ADMIN_EMAIL=axel@sintergica.ai
ADMIN_PASSWORD_HASH=<bcrypt hash>
```

## Deploy a Vercel (Plan Hobby — gratis)

1. Sube el repo a GitHub.
2. Crea un proyecto en Vercel conectado al repo.
3. En el dashboard de Vercel → **Storage** → crea **Postgres** (Neon). Esto provee `POSTGRES_URL` automáticamente.
4. Agrega manualmente en **Settings → Environment Variables**:
   - `ANTHROPIC_API_KEY`
   - `AUTH_SECRET` (`openssl rand -base64 32`)
   - `AUTH_TRUST_HOST=true`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
5. En **Settings → Functions**, selecciona la región `iad1` o `sfo1` (más cercanas a México).
6. Haz el primer deploy.
7. Desde local, apuntando a la DB de producción:
   ```bash
   POSTGRES_URL='...' pnpm db:push
   POSTGRES_URL='...' ADMIN_PASSWORD_HASH='...' pnpm db:seed
   ```
8. Login con tus credenciales.

### Por qué Plan Hobby es suficiente

El endpoint `/api/generate` puede tardar 30–90s. Se extiende a 60s con `maxDuration = 60`. Si Claude responde más rápido (lo normal con Sonnet 4.5) cabe sin problema. **No hay generación de PDF en serverless**: React-PDF se ejecuta en el navegador del usuario, así que no hay límites de timeout ni de memoria en el server.

## Arquitectura

### Compilación dinámica del prompt

`src/lib/prompts/compile-system-prompt.ts` lee de la DB (empresa, productos, servicios, políticas, voz, verticales, KBs) y construye el system prompt en tiempo real. Cada vez que se genera una propuesta:

1. Se calcula el prompt con el contexto actual.
2. Se hashea (SHA-256) el resultado.
3. Si el hash no existe en `prompt_versions`, se crea una nueva versión.
4. La propuesta generada se liga a `prompt_version_id` para trazabilidad completa.

Así, cualquier cambio que haga el admin (precio, producto, KB, palabra prohibida) se refleja automáticamente en la siguiente propuesta, y queda registrado qué versión del prompt produjo cada documento histórico.

### Generación de PDF 100% client-side

El botón "Exportar PDF":

1. Toma el HTML actual (incluyendo ediciones inline del TipTap editor).
2. Lo pasa por `parseHTMLToPDFNodes` (`node-html-parser`) que produce una estructura intermedia tipada.
3. Renderiza el documento con React-PDF (`ProposalPDF.tsx`).
4. Dispara la descarga con `pdf().toBlob()`.

React-PDF se carga via `dynamic import` para no inflar el bundle inicial.

### Knowledge Bases (KBs)

Las KBs son markdown libre que el admin puede crear desde `/admin/knowledge`. Cada KB tiene tags (industria, tipo de cliente, tema). En la compilación del prompt:

- Las KBs marcadas `alwaysInclude: true` se inyectan siempre.
- Las demás se inyectan cuando sus tags matchean la industria o el tipo de propuesta.

Esto permite acumular contexto específico (casos de éxito, marcos regulatorios, metodologías) sin tocar el código.

## Scripts

```
pnpm dev           Dev server
pnpm build         Production build
pnpm db:push       Crea/actualiza tablas (sin migration files)
pnpm db:generate   Genera migration files en /drizzle
pnpm db:seed       Carga datos iniciales
pnpm db:studio     Abre Drizzle Studio para inspeccionar la DB
```

## Decisiones de diseño

- **`db:push` en lugar de migrations** para mantener el proyecto simple. Para producción seria, usa `db:generate` y mantén los snapshots en git.
- **Auth de un solo usuario con credentials provider.** No hay signup público. Si se necesitan más usuarios, agregarlos manualmente en la tabla `users` (con `bcrypt` hash).
- **`policies PUT` reemplaza todo el array.** Simpler than per-row. Si necesitas granularidad, cambia a POST/DELETE individuales (ya está habilitado).
- **HTML como formato canónico.** El output de Claude, el editor TipTap y el renderer React-PDF trabajan todos sobre el mismo HTML, parseado distinto para cada contexto.
- **El prompt "fijo" (estructura del documento) vive en `fixed-structure.ts`**, no en la DB, porque define el contrato de HTML que el parser de PDF necesita respetar. Todo lo demás (contenido de negocio) sí vive en la DB.

## TODOs para extensiones

- Diff visual entre versiones del prompt (actualmente solo se puede ver cada versión completa).
- Restaurar versión anterior del prompt (hoy el historial es append-only).
- Drag-and-drop real para reordenar productos/servicios (actualmente campo `sortOrder` editable manualmente).
- Export de múltiples propuestas a zip.
- Métricas de uso de KBs (cuántas veces se incluyó cada una).
