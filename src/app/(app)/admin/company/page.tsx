'use client';
import { useEffect, useState } from 'react';
import { Input, Textarea, Field } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Company = {
  legalName: string;
  brandName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  offices: string;
  logoText: string;
  defaultPreparedBy: string;
};

const empty: Company = {
  legalName: '',
  brandName: '',
  tagline: '',
  description: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  offices: '',
  logoText: '',
  defaultPreparedBy: '',
};

export default function CompanyPage() {
  const [form, setForm] = useState<Company>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/company')
      .then((r) => r.json())
      .then((d) => {
        if (d) setForm(d);
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) toast.success('Guardado');
    else toast.error('Error al guardar');
  }

  if (loading) return <div>Cargando…</div>;

  return (
    <form onSubmit={save} className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">Identidad de empresa</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nombre legal"><Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} /></Field>
        <Field label="Marca"><Input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} /></Field>
        <Field label="Tagline"><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
        <Field label="Logo texto (portada)"><Input value={form.logoText} onChange={(e) => setForm({ ...form, logoText: e.target.value })} /></Field>
        <Field label="Email contacto"><Input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></Field>
        <Field label="Teléfono contacto"><Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></Field>
        <Field label="Website"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
        <Field label="Oficinas"><Input value={form.offices} onChange={(e) => setForm({ ...form, offices: e.target.value })} /></Field>
      </div>
      <Field label="Descripción"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></Field>
      <Field label="Preparador por defecto"><Input value={form.defaultPreparedBy} onChange={(e) => setForm({ ...form, defaultPreparedBy: e.target.value })} /></Field>
      <Button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button>
    </form>
  );
}
