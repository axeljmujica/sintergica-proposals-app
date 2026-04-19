'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, Field } from '@/components/ui/input';
import { toast } from 'sonner';

const LOADING_MESSAGES = [
  'Analizando las notas de la sesión…',
  'Identificando hallazgos críticos…',
  'Construyendo la arquitectura de solución…',
  'Calculando proyección de impacto…',
  'Redactando con voz consultora senior…',
];

export function ProposalForm({ verticals }: { verticals: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [form, setForm] = useState({
    cliente: '',
    contacto: '',
    cargo: '',
    industria: '',
    tipo: 'B2B' as 'B2B' | 'B2G' | 'Piloto',
    notas: '',
    productos: '',
    inversion: '',
    tiempo: '',
    fechaSesion: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 5000);
    return () => clearInterval(t);
  }, [loading]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      const data = await res.json();
      toast.success('Propuesta generada');
      router.push(`/proposals/${data.id}`);
    } catch (err) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-gray-900">Nueva propuesta</h1>
        <p className="text-sm text-gray-500">
          Pega las notas de la sesión y genera una propuesta estratégica integral.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Cliente *">
          <Input
            required
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            placeholder="Ej. Municipio de Toluca"
          />
        </Field>
        <Field label="Fecha de la sesión *">
          <Input
            type="date"
            required
            value={form.fechaSesion}
            onChange={(e) => setForm({ ...form, fechaSesion: e.target.value })}
          />
        </Field>
        <Field label="Contacto">
          <Input
            value={form.contacto}
            onChange={(e) => setForm({ ...form, contacto: e.target.value })}
            placeholder="Ej. Lic. María Rodríguez"
          />
        </Field>
        <Field label="Cargo">
          <Input
            value={form.cargo}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            placeholder="Ej. Directora de Operaciones"
          />
        </Field>
        <Field label="Industria">
          <Select value={form.industria} onChange={(e) => setForm({ ...form, industria: e.target.value })}>
            <option value="">— Seleccionar —</option>
            {verticals.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo">
          <Select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as 'B2B' | 'B2G' | 'Piloto' })}
          >
            <option value="B2B">B2B</option>
            <option value="B2G">B2G</option>
            <option value="Piloto">Piloto</option>
          </Select>
        </Field>
      </div>

      <Field label="Notas de la sesión de diagnóstico *" hint="Pega aquí todas las notas crudas — dolores, métricas, sistemas actuales, decisores, restricciones.">
        <Textarea
          required
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
          placeholder="Pega todo el contenido de la sesión…"
          rows={14}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Productos sugeridos">
          <Input
            value={form.productos}
            onChange={(e) => setForm({ ...form, productos: e.target.value })}
            placeholder="Ej. Lattice Pro + Nahui"
          />
        </Field>
        <Field label="Inversión objetivo">
          <Input
            value={form.inversion}
            onChange={(e) => setForm({ ...form, inversion: e.target.value })}
            placeholder="Ej. $350,000 MXN"
          />
        </Field>
        <Field label="Tiempo de entrega">
          <Input
            value={form.tiempo}
            onChange={(e) => setForm({ ...form, tiempo: e.target.value })}
            placeholder="Ej. 6 semanas"
          />
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? loadingMsg : 'Generar propuesta con Claude'}
        </Button>
        {loading ? (
          <span className="text-xs text-gray-500">Esto toma 30–90 segundos. No cierres la pestaña.</span>
        ) : null}
      </div>
    </form>
  );
}
