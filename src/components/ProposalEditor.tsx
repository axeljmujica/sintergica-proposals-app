'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import '@/styles/proposal.css';

export function ProposalEditor({
  html,
  onChange,
}: {
  html: string;
  onChange: (html: string) => void;
}) {
  const debouncedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: html,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'proposal-doc focus:outline-none' },
    },
    onUpdate: ({ editor }) => {
      if (debouncedRef.current) clearTimeout(debouncedRef.current);
      debouncedRef.current = setTimeout(() => onChange(editor.getHTML()), 2000);
    },
  });

  useEffect(() => {
    return () => {
      if (debouncedRef.current) clearTimeout(debouncedRef.current);
    };
  }, []);

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}
