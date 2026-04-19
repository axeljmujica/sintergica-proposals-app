'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

export function ExportPDFButton({ getHtml, cliente }: { getHtml: () => string; cliente: string }) {
  const [loading, setLoading] = useState(false);

  async function exportar() {
    setLoading(true);
    try {
      const [{ pdf }, { ProposalPDF }, { parseHTMLToPDFNodes }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/lib/pdf/ProposalPDF'),
        import('@/lib/pdf/html-to-pdf'),
      ]);
      const nodes = parseHTMLToPDFNodes(getHtml());
      const blob = await pdf(
        <ProposalPDF nodes={nodes} headerText={`Propuesta Estratégica · ${cliente}`} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propuesta-${cliente.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch (err) {
      console.error(err);
      toast.error('Error generando PDF: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={exportar} disabled={loading} variant="primary">
      <Download size={14} />
      {loading ? 'Generando PDF…' : 'Exportar PDF'}
    </Button>
  );
}
