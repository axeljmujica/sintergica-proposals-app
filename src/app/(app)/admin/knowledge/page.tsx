'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, Field } from '@/components/ui/input';
import { ChipsInput } from '@/components/ui/chips-input';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';
import { slugify } from '@/lib/utils';

type KB = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  tags: string[];
  alwaysInclude: boolean;
  active: boolean;
};

const empty: KB = {
  title: '',
  slug: '',
  category: 'case_study',
  content: '',
  tags: [],
  alwaysInclude: false,
  active: true,
};

const CATEGORIES = ['case_study', 'regulatory', 'methodology', 'reference', 'success_story', 'other'];

export default function KnowledgePage() {
  const [items, setItems] = useState<KB[]>([]);
  const [editing, setEditing] = useState<KB | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  async function load() {
    const r = await fetch('/api/admin/knowledge');
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(kb: KB) {
    const payload = { ...kb, slug: kb.slug || slugify(kb.title) };
    const url = kb.id ? `/api/admin/knowledge/${kb.id}` : '/api/admin/knowledge';
    const { id, ...body } = payload;
    const res = await fetch(url, {
      method: kb.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) { toast.success('Guardado'); setEditing(null); load(); }
    else toast.error('Error');
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar base de conocimiento?')) return;
    await fetch(`/api/admin/knowledge/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <div>Cargando…</div>;

  const filtered = filter
    ? items.filter((kb) => kb.title.toLowerCase().includes(filter.toLowerCase()) || kb.tags.some((t) => t.toLowerCase().includes(filter.toLowerCase())))
    : items;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Bases de conocimiento</h1>
        <div className="flex gap-2">
          <Input placeholder="Buscar…" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-60" />
          <Button onClick={() => setEditing({ ...empty })}><Plus size={14} /> Nueva KB</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((kb) => (
          <div key={kb.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <button onClick={() => setEditing(kb)} className="font-medium text-gray-900 hover:text-[#2E75B6]">{kb.title}</button>
                <div className="mt-1 text-xs text-gray-500">{kb.category} {kb.alwaysInclude ? '· 🔒 siempre incluir' : ''}</div>
              </div>
              <button onClick={() => remove(kb.id!)} className="text-red-500"><Trash2 size={14} /></button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {kb.tags.map((t) => (
                <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setEditing(null)}>
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? 'Editar KB' : 'Nueva KB'}</h2>
              <button onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <Field label="Título"><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug"><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} /></Field>
              <Field label="Categoría">
                <Select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Tags"><ChipsInput value={editing.tags} onChange={(v) => setEditing({ ...editing, tags: v })} placeholder="logística, b2g, aduanal…" /></Field>
            <Field label="Contenido (markdown)"><Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={16} className="font-mono text-xs" /></Field>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.alwaysInclude} onChange={(e) => setEditing({ ...editing, alwaysInclude: e.target.checked })} /> Incluir siempre</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Activa</label>
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
