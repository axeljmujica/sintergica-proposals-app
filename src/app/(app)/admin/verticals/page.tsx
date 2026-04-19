'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { ChipsInput } from '@/components/ui/chips-input';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';
import { slugify } from '@/lib/utils';

type Metric = { kpi: string; baseline: string; projection: string; source: string };
type Vertical = {
  id?: string;
  name: string;
  slug: string;
  recommendedProducts: string[];
  typicalPainPoints: string[];
  metrics: Metric[];
  context?: string | null;
  active: boolean;
};

const empty: Vertical = {
  name: '',
  slug: '',
  recommendedProducts: [],
  typicalPainPoints: [],
  metrics: [],
  context: '',
  active: true,
};

export default function VerticalsPage() {
  const [items, setItems] = useState<Vertical[]>([]);
  const [editing, setEditing] = useState<Vertical | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch('/api/admin/verticals');
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(v: Vertical) {
    const payload = { ...v, slug: v.slug || slugify(v.name) };
    const url = v.id ? `/api/admin/verticals/${v.id}` : '/api/admin/verticals';
    const { id, ...body } = payload;
    const res = await fetch(url, {
      method: v.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) { toast.success('Guardado'); setEditing(null); load(); }
    else toast.error('Error');
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar vertical?')) return;
    await fetch(`/api/admin/verticals/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <div>Cargando…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Verticales</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus size={14} /> Nueva vertical</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Métricas</th><th className="px-4 py-3">Activa</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><button onClick={() => setEditing(v)} className="font-medium hover:text-[#2E75B6]">{v.name}</button></td>
                <td className="px-4 py-3 text-xs text-gray-500">{v.slug}</td>
                <td className="px-4 py-3 text-gray-600">{v.metrics?.length || 0}</td>
                <td className="px-4 py-3">{v.active ? '✅' : '—'}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(v.id!)} className="text-red-500"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setEditing(null)}>
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? 'Editar vertical' : 'Nueva vertical'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Slug"><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></Field>
            </div>
            <Field label="Productos recomendados"><ChipsInput value={editing.recommendedProducts} onChange={(v) => setEditing({ ...editing, recommendedProducts: v })} /></Field>
            <Field label="Dolores típicos"><ChipsInput value={editing.typicalPainPoints} onChange={(v) => setEditing({ ...editing, typicalPainPoints: v })} /></Field>

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Métricas estándar</h3>
                <Button type="button" size="sm" variant="secondary" onClick={() => setEditing({ ...editing, metrics: [...editing.metrics, { kpi: '', baseline: '', projection: '', source: '' }] })}>
                  <Plus size={12} /> Agregar
                </Button>
              </div>
              {editing.metrics.map((m, i) => (
                <div key={i} className="mb-2 grid grid-cols-5 gap-2">
                  <Input placeholder="KPI" value={m.kpi} onChange={(e) => setEditing({ ...editing, metrics: editing.metrics.map((x, j) => j === i ? { ...x, kpi: e.target.value } : x) })} />
                  <Input placeholder="Baseline" value={m.baseline} onChange={(e) => setEditing({ ...editing, metrics: editing.metrics.map((x, j) => j === i ? { ...x, baseline: e.target.value } : x) })} />
                  <Input placeholder="Proyección" value={m.projection} onChange={(e) => setEditing({ ...editing, metrics: editing.metrics.map((x, j) => j === i ? { ...x, projection: e.target.value } : x) })} />
                  <Input placeholder="Fuente" value={m.source} onChange={(e) => setEditing({ ...editing, metrics: editing.metrics.map((x, j) => j === i ? { ...x, source: e.target.value } : x) })} />
                  <button type="button" onClick={() => setEditing({ ...editing, metrics: editing.metrics.filter((_, j) => j !== i) })} className="text-red-500 justify-self-start"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <Field label="Contexto (notas regulatorias, normativa)"><Textarea value={editing.context || ''} onChange={(e) => setEditing({ ...editing, context: e.target.value })} rows={4} /></Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Activa
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button type="button" onClick={() => save(editing)}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
