'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';

type Service = {
  id?: string;
  name: string;
  category: string;
  description: string;
  priceMinMXN?: number | null;
  priceMaxMXN?: number | null;
  unit: string;
  durationEstimate?: string | null;
  active: boolean;
  sortOrder: number;
};

const empty: Service = {
  name: '',
  category: 'Consultoría',
  description: '',
  priceMinMXN: null,
  priceMaxMXN: null,
  unit: 'una vez',
  durationEstimate: '',
  active: true,
  sortOrder: 0,
};

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch('/api/admin/services');
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(s: Service) {
    const url = s.id ? `/api/admin/services/${s.id}` : '/api/admin/services';
    const { id, ...payload } = s;
    const res = await fetch(url, {
      method: s.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success('Guardado');
      setEditing(null);
      load();
    } else {
      toast.error('Error al guardar');
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este servicio?')) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Eliminado'); load(); }
  }

  if (loading) return <div>Cargando…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Servicios</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus size={14} /> Nuevo servicio</Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Activo</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(s)} className="font-medium text-gray-900 hover:text-[#2E75B6]">{s.name}</button>
                </td>
                <td className="px-4 py-3 text-gray-600">{s.category}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {s.priceMinMXN && s.priceMaxMXN ? `$${s.priceMinMXN.toLocaleString()}–$${s.priceMaxMXN.toLocaleString()} ${s.unit}` : s.unit}
                </td>
                <td className="px-4 py-3">{s.active ? '✅' : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(s.id!)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setEditing(null)}>
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? 'Editar servicio' : 'Nuevo servicio'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Categoría"><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
            </div>
            <Field label="Descripción"><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} /></Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Precio mínimo MXN"><Input type="number" value={editing.priceMinMXN ?? ''} onChange={(e) => setEditing({ ...editing, priceMinMXN: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Precio máximo MXN"><Input type="number" value={editing.priceMaxMXN ?? ''} onChange={(e) => setEditing({ ...editing, priceMaxMXN: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Unidad"><Input value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} /></Field>
            </div>
            <Field label="Duración estimada"><Input value={editing.durationEstimate || ''} onChange={(e) => setEditing({ ...editing, durationEstimate: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Orden"><Input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) || 0 })} /></Field>
              <Field label="Activo">
                <label className="flex h-10 items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Mostrar en prompts
                </label>
              </Field>
            </div>
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
