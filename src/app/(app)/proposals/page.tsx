import Link from 'next/link';
import { db } from '@/lib/db/client';
import { proposals } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { formatDateES } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Borrador', cls: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Enviada', cls: 'bg-blue-100 text-blue-800' },
  won: { label: 'Ganada', cls: 'bg-green-100 text-green-800' },
  lost: { label: 'Perdida', cls: 'bg-red-100 text-red-800' },
};

export default async function ProposalsListPage() {
  const list = await db.select().from(proposals).orderBy(desc(proposals.createdAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Propuestas</h1>
          <p className="text-sm text-gray-500">{list.length} propuestas totales.</p>
        </div>
        <Link
          href="/"
          className="rounded-md bg-[#2E75B6] px-4 py-2 text-sm font-medium text-white hover:bg-[#245d91]"
        >
          Nueva propuesta
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Industria</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Todavía no has generado propuestas.
                </td>
              </tr>
            ) : (
              list.map((p) => {
                const st = statusLabels[p.status] ?? statusLabels.draft;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/proposals/${p.id}`}
                        className="font-medium text-gray-900 hover:text-[#2E75B6]"
                      >
                        {p.cliente}
                      </Link>
                      {p.contacto ? (
                        <div className="text-xs text-gray-500">{p.contacto}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.industria || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.tipo}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDateES(String(p.createdAt))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
