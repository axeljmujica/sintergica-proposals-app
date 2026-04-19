'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { slugify } from '@/lib/utils';

type Policy = {
  id?: string;
  key: string;
  title: string;
  body: string;
  applyAlways: boolean;
  active: boolean;
  sortOrder: number;
};

export default function PoliciesPage() {
  const [items, setItems] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch('/api/admin/policies');
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveAll() {
    const res = await fetch('/api/admin/policies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    if (res.ok) toast.success('Guardado'); else toast.error('Error al guardar');
  }

  function addNew() {
    setItems([...items, {
      key: `policy_${items.length + 1}`,
      title: 'Nueva política',
      body: '',
      applyAlways: true,
      active: true,
      sortOrder: (items[items.length - 1]?.sortOrder || 0) + 10,
    }]);
  }

  if (loading) return <div>Cargando…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Políticas comerciales</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={addNew}><Plus size={14} /> Agregar</Button>
          <Button onClick={saveAll}>Guardar todo</Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((p, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Key (slug)"><Input value={p.key} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, key: slugify(e.target.value) } : x))} /></Field>
              <Field label="Título"><Input value={p.title} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} /></Field>
              <Field label="Orden"><Input type="number" value={p.sortOrder} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, sortOrder: Number(e.target.value) || 0 } : x))} /></Field>
            </div>
            <Field label="Texto"><Textarea value={p.body} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, body: e.target.value } : x))} rows={2} /></Field>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={p.applyAlways} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, applyAlways: e.target.checked } : x))} /> Aplicar siempre</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={p.active} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, active: e.target.checked } : x))} /> Activa</label>
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="ml-auto text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
