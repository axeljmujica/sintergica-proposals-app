import { db } from '@/lib/db/client';
import { verticals } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { ProposalForm } from '@/components/ProposalForm';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const vs = await db
    .select({ slug: verticals.slug, name: verticals.name })
    .from(verticals)
    .where(eq(verticals.active, true))
    .orderBy(asc(verticals.name));
  return <ProposalForm verticals={vs} />;
}
