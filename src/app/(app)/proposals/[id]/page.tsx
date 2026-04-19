import { notFound } from 'next/navigation';
import { db } from '@/lib/db/client';
import { proposals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProposalView } from '@/components/ProposalView';

export const dynamic = 'force-dynamic';

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p] = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  if (!p) notFound();
  const html = p.htmlEditado || p.htmlOriginal;
  return (
    <ProposalView id={p.id} cliente={p.cliente} initialHtml={html} initialStatus={p.status} />
  );
}
