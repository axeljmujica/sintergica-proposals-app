'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { ChipsInput } from '@/components/ui/chips-input';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';

type Tier = {
  name: string;
  monthlyPriceMXN: number | null;
  oneTimePriceMXN: number | null;
  unit: string;
  includes: string;
};
type Product = {
  id?: string;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  forbiddenAliases: string[];
  pricingTiers: Tier[];
  notes?: string | null;
  active: boolean;
  sortOrder: number;
};

const emptyProduct: Product = {
  name: '',
  category: 'Plataforma',
  shortDescription: '',
  longDescription: '',
  forbiddenAliases: [],
  pricingTiers: [],
  notes: '',
  active: true,
  sortOrder: 0,
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch('/api/admin/products');
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(p: Product) {
    const url = p.id ? `/api/admin/products/${p.id}` : '/api/admin/products';
    const method = p.id ? 'PUT' : 'POST';
    const { id, ...payload } = p;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success('Guardado');
      setEditing(null);
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Error al guardar');
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este producto?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Eliminado');
      load();
    }
  }

  if (loading) return <div>Cargando…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Button onClick={() => setEditing({ ...emptyProduct })}><Plus size={14} /> Nuevo producto</Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Tiers</th><th className="px-4 py-3">Activo</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(p)} className="font-medium text-gray-900 hover:text-[#2E75B6]">{p.name}</button>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.category}</td>
                <td className="px-4 py-3 text-gray-600">{p.pricingTiers?.length || 0}</td>
                <td className="px-4 py-3">{p.active ? '✅' : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(p.id!)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <ProductDrawer product={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function ProductDrawer({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [p, setP] = useState<Product>(product);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{product.id ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre"><Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
          <Field label="Categoría"><Input value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} /></Field>
        </div>
        <Field label="Descripción corta"><Input value={p.shortDescription} onChange={(e) => setP({ ...p, shortDescription: e.target.value })} /></Field>
        <Field label="Descripción larga"><Textarea value={p.longDescription} onChange={(e) => setP({ ...p, longDescription: e.target.value })} rows={4} /></Field>
        <Field label="Aliases prohibidos (no se mencionan en propuestas)">
          <ChipsInput value={p.forbiddenAliases} onChange={(v) => setP({ ...p, forbiddenAliases: v })} placeholder="Agregar y Enter…" />
        </Field>

        <div className="my-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Tiers de precio</h3>
            <Button type="button" variant="secondary" size="sm" onClick={() => setP({ ...p, pricingTiers: [...p.pricingTiers, { name: '', monthlyPriceMXN: null, oneTimePriceMXN: null, unit: '', includes: '' }] })}>
              <Plus size={12} /> Agregar tier
            </Button>
          </div>
          {p.pricingTiers.map((t, i) => (
            <div key={i} className="mb-3 rounded border border-gray-200 p-3">
              <div className="grid grid-cols-5 gap-2">
                <Input placeholder="Nombre" value={t.name} onChange={(e) => setP({ ...p, pricingTiers: p.pricingTiers.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} />
                <Input placeholder="$ mes" type="number" value={t.monthlyPriceMXN ?? ''} onChange={(e) => setP({ ...p, pricingTiers: p.pricingTiers.map((x, j) => j === i ? { ...x, monthlyPriceMXN: e.target.value ? Number(e.target.value) : null } : x) })} />
                <Input placeholder="$ único" type="number" value={t.oneTimePriceMXN ?? ''} onChange={(e) => setP({ ...p, pricingTiers: p.pricingTiers.map((x, j) => j === i ? { ...x, oneTimePriceMXN: e.target.value ? Number(e.target.value) : null } : x) })} />
                <Input placeholder="Unidad (/mes)" value={t.unit} onChange={(e) => setP({ ...p, pricingTiers: p.pricingTiers.map((x, j) => j === i ? { ...x, unit: e.target.value } : x) })} />
                <div className="flex gap-1">
                  <Input placeholder="Incluye" value={t.includes} onChange={(e) => setP({ ...p, pricingTiers: p.pricingTiers.map((x, j) => j === i ? { ...x, includes: e.target.value } : x) })} />
                  <button type="button" onClick={() => setP({ ...p, pricingTiers: p.pricingTiers.filter((_, j) => j !== i) })} className="text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Field label="Notas"><Textarea value={p.notes || ''} onChange={(e) => setP({ ...p, notes: e.target.value })} rows={2} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Orden"><Input type="number" value={p.sortOrder} onChange={(e) => setP({ ...p, sortOrder: Number(e.target.value) || 0 })} /></Field>
          <Field label="Activo">
            <label className="flex h-10 items-center gap-2 text-sm">
              <input type="checkbox" checked={p.active} onChange={(e) => setP({ ...p, active: e.target.checked })} /> Mostrar en prompts
            </label>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={() => onSave(p)}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
