'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit2, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProposalDocument } from './ProposalDocument';
import { ProposalEditor } from './ProposalEditor';
import { ExportPDFButton } from './ExportPDFButton';
import { Select } from '@/components/ui/input';
import { toast } from 'sonner';

export function ProposalView({
  id,
  cliente,
  initialHtml,
  initialStatus,
}: {
  id: string;
  cliente: string;
  initialHtml: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [html, setHtml] = useState(initialHtml);
  const [status, setStatus] = useState(initialStatus);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const latestHtmlRef = useRef(initialHtml);

  useEffect(() => {
    latestHtmlRef.current = html;
  }, [html]);

  async function persist(partial: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      setSavedAt(new Date());
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm('¿Eliminar esta propuesta? No se puede deshacer.')) return;
    const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Propuesta eliminada');
      router.push('/proposals');
    } else {
      toast.error('No se pudo eliminar');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/proposals"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          Volver
        </Link>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">
            {saving ? 'Guardando…' : savedAt ? `Guardado ${savedAt.toLocaleTimeString('es-MX')}` : ''}
          </div>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              persist({ status: e.target.value });
            }}
            className="h-9 w-32"
          >
            <option value="draft">Borrador</option>
            <option value="sent">Enviada</option>
            <option value="won">Ganada</option>
            <option value="lost">Perdida</option>
          </Select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? <Eye size={14} /> : <Edit2 size={14} />}
            {editing ? 'Vista previa' : 'Editar'}
          </Button>
          <ExportPDFButton getHtml={() => latestHtmlRef.current} cliente={cliente} />
          <Button variant="ghost" size="sm" onClick={remove}>
            <Trash2 size={14} className="text-red-500" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        {editing ? (
          <div className="rounded-lg bg-white p-2 shadow-sm">
            <ProposalEditor
              html={html}
              onChange={(nextHtml) => {
                setHtml(nextHtml);
                persist({ htmlEditado: nextHtml });
              }}
            />
          </div>
        ) : (
          <ProposalDocument html={html} />
        )}
      </div>

      {savedAt ? (
        <p className="flex items-center gap-1 text-center text-xs text-gray-500">
          <CheckCircle2 size={12} /> Cambios persistidos
        </p>
      ) : null}
    </div>
  );
}
