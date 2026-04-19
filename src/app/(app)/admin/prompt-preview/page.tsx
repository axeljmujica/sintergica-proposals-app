'use client';
import { useEffect, useState } from 'react';
import { Select, Field } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

export default function PromptPreviewPage() {
  const [industria, setIndustria] = useState('');
  const [tipo, setTipo] = useState('B2B');
  const [verticals, setVerticals] = useState<{ slug: string; name: string }[]>([]);
  const [prompt, setPrompt] = useState('');
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/verticals').then((r) => r.json()).then((list) => {
      setVerticals(list.filter((v: { active: boolean }) => v.active));
    });
  }, []);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (industria) qs.set('industria', industria);
    if (tipo) qs.set('tipo', tipo);
    const r = await fetch(`/api/admin/prompt-preview?${qs}`);
    const d = await r.json();
    setPrompt(d.prompt);
    setTokens(d.tokens);
    setLoading(false);
  }
  useEffect(() => { load(); }, [industria, tipo]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Vista previa del system prompt</h1>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Industria">
          <Select value={industria} onChange={(e) => setIndustria(e.target.value)}>
            <option value="">— ninguna —</option>
            {verticals.map((v) => <option key={v.slug} value={v.slug}>{v.name}</option>)}
          </Select>
        </Field>
        <Field label="Tipo">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="B2B">B2B</option>
            <option value="B2G">B2G</option>
            <option value="Piloto">Piloto</option>
          </Select>
        </Field>
        <Field label="Tokens estimados">
          <div className="flex h-10 items-center text-sm text-gray-700">{tokens ?? '—'} tokens</div>
        </Field>
      </div>
      <div className="mb-3 flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(prompt); toast.success('Copiado'); }}>
          <Copy size={12} /> Copiar
        </Button>
        <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
          Recargar
        </Button>
      </div>
      <pre className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-800">
        {prompt}
      </pre>
    </div>
  );
}
