'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { ChipsInput } from '@/components/ui/chips-input';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

type Voice = {
  toneDescription: string;
  styleGuidelines: string;
  forbiddenWords: string[];
  preferredPhrases: { instead_of: string; use: string }[];
};

const empty: Voice = { toneDescription: '', styleGuidelines: '', forbiddenWords: [], preferredPhrases: [] };

export default function VoicePage() {
  const [form, setForm] = useState<Voice>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/voice').then((r) => r.json()).then((d) => {
      if (d) setForm(d);
      setLoading(false);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/voice', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) toast.success('Guardado'); else toast.error('Error');
  }

  if (loading) return <div>Cargando…</div>;

  return (
    <form onSubmit={save} className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">Voz y reglas de naming</h1>
      <Field label="Tono" hint="Descripción narrativa del tono de la marca">
        <Textarea value={form.toneDescription} onChange={(e) => setForm({ ...form, toneDescription: e.target.value })} rows={3} />
      </Field>
      <Field label="Lineamientos de estilo" hint="Markdown libre. Reglas de redacción.">
        <Textarea value={form.styleGuidelines} onChange={(e) => setForm({ ...form, styleGuidelines: e.target.value })} rows={10} />
      </Field>
      <Field label="Palabras prohibidas globales">
        <ChipsInput value={form.forbiddenWords} onChange={(v) => setForm({ ...form, forbiddenWords: v })} placeholder="Agregar y Enter…" />
      </Field>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Frases preferidas</h3>
          <Button type="button" variant="secondary" size="sm" onClick={() => setForm({ ...form, preferredPhrases: [...form.preferredPhrases, { instead_of: '', use: '' }] })}>
            <Plus size={12} /> Agregar
          </Button>
        </div>
        {form.preferredPhrases.map((pp, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <Input placeholder="En lugar de…" value={pp.instead_of} onChange={(e) => setForm({ ...form, preferredPhrases: form.preferredPhrases.map((x, j) => j === i ? { ...x, instead_of: e.target.value } : x) })} />
            <Input placeholder="Usar…" value={pp.use} onChange={(e) => setForm({ ...form, preferredPhrases: form.preferredPhrases.map((x, j) => j === i ? { ...x, use: e.target.value } : x) })} />
            <button type="button" onClick={() => setForm({ ...form, preferredPhrases: form.preferredPhrases.filter((_, j) => j !== i) })} className="text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
    </form>
  );
}
