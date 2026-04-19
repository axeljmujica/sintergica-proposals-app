'use client';
import * as React from 'react';
import { X } from 'lucide-react';

export function ChipsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState('');
  const add = (v: string) => {
    const t = v.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setDraft('');
  };
  return (
    <div className="flex min-h-[40px] flex-wrap gap-1.5 rounded-md border border-gray-300 bg-white p-1.5">
      {value.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
        >
          {v}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="text-gray-500 hover:text-gray-900">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(draft);
          } else if (e.key === 'Backspace' && !draft && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => add(draft)}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
      />
    </div>
  );
}
