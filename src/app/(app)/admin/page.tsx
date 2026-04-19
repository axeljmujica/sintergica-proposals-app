import Link from 'next/link';
import { db } from '@/lib/db/client';
import {
  proposals,
  products,
  services,
  knowledgeBases,
  promptVersions,
} from '@/lib/db/schema';
import { desc, eq, count } from 'drizzle-orm';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { formatDateES } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalProposalsRow] = await db.select({ c: count() }).from(proposals);
  const [lastProposal] = await db.select().from(proposals).orderBy(desc(proposals.createdAt)).limit(1);
  const [lastVersion] = await db.select().from(promptVersions).orderBy(desc(promptVersions.version)).limit(1);
  const [prodCount] = await db.select({ c: count() }).from(products).where(eq(products.active, true));
  const [svcCount] = await db.select({ c: count() }).from(services).where(eq(services.active, true));
  const [kbCount] = await db.select({ c: count() }).from(knowledgeBases).where(eq(knowledgeBases.active, true));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="Propuestas totales" value={totalProposalsRow?.c || 0} />
        <Stat label="Productos activos" value={prodCount?.c || 0} />
        <Stat label="Servicios activos" value={svcCount?.c || 0} />
        <Stat label="Bases de conocimiento activas" value={kbCount?.c || 0} />
        <Stat
          label="Última propuesta"
          value={lastProposal ? lastProposal.cliente : '—'}
          sub={lastProposal ? formatDateES(String(lastProposal.createdAt)) : undefined}
        />
        <Stat
          label="Versión de prompt actual"
          value={lastVersion ? `v${lastVersion.version}` : 'ninguna'}
          sub={lastVersion ? formatDateES(String(lastVersion.createdAt)) : undefined}
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-2">
            <Link href="/admin/prompt-preview" className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">
              Ver prompt compilado
            </Link>
            <Link href="/admin/products" className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">
              Editar productos
            </Link>
            <Link href="/admin/knowledge" className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">
              Gestionar conocimiento
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
        {sub ? <div className="mt-1 text-xs text-gray-500">{sub}</div> : null}
      </CardBody>
    </Card>
  );
}
