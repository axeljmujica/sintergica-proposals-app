'use client';
import { useEffect, useState } from 'react';
import { formatDateES } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

type Version = {
  id: string;
  version: number;
  systemPrompt: string;
  changeNote?: string | null;
  createdAt: string;
  createdBy: string;
};

export default function PromptVersionsPage() {
  const [items, setItems] = useState<Version[]>([]);
  const [viewing, setViewing] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/prompt-versions').then((r) => r.json()).then((d) => {
      setItems(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Cargando…</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Historial de versiones del prompt</h1>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Versión</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Autor</th><th className="px-4 py-3">Nota</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay versiones todavía. Se generan automáticamente con la primera propuesta.</td></tr>
            ) : items.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">v{v.version}</td>
                <td className="px-4 py-3 text-gray-600">{formatDateES(v.createdAt)}</td>
                <td className="px-4 py-3 text-gray-600">{v.createdBy}</td>
                <td className="px-4 py-3 text-gray-600">{v.changeNote || '—'}</td>
                <td className="px-4 py-3 text-right"><Button size="sm" variant="secondary" onClick={() => setViewing(v)}><Eye size={12} /> Ver</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setViewing(null)}>
          <div className="h-full w-full max-w-4xl overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Versión v{viewing.version}</h2>
              <button onClick={() => setViewing(null)}><X size={18} /></button>
            </div>
            <pre className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs">{viewing.systemPrompt}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
