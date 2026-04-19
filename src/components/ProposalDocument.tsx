'use client';
import '@/styles/proposal.css';

export function ProposalDocument({ html }: { html: string }) {
  return <div className="proposal-doc" dangerouslySetInnerHTML={{ __html: html }} />;
}
