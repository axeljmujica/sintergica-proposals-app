'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  FileText,
  Plus,
  Settings,
  Building2,
  Package,
  Wrench,
  FileCheck2,
  Mic,
  Layers,
  BookOpen,
  Eye,
  History,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNav = [
  { href: '/', label: 'Nueva propuesta', icon: Plus },
  { href: '/proposals', label: 'Propuestas', icon: FileText },
];

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: Settings },
  { href: '/admin/company', label: 'Empresa', icon: Building2 },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/services', label: 'Servicios', icon: Wrench },
  { href: '/admin/policies', label: 'Políticas', icon: FileCheck2 },
  { href: '/admin/voice', label: 'Voz', icon: Mic },
  { href: '/admin/verticals', label: 'Verticales', icon: Layers },
  { href: '/admin/knowledge', label: 'Conocimiento', icon: BookOpen },
  { href: '/admin/prompt-preview', label: 'Preview prompt', icon: Eye },
  { href: '/admin/prompt-versions', label: 'Versiones prompt', icon: History },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 flex-col bg-[#111318] text-gray-300">
      <div className="px-5 py-5">
        <div className="text-lg font-bold tracking-tight text-white">SINTÉRGICA</div>
        <div className="text-[11px] italic text-gray-400">Propuestas</div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2">
        <div className="mb-1 mt-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Trabajo
        </div>
        {mainNav.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))} />
        ))}
        <div className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Admin
        </div>
        {adminNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
          />
        ))}
      </nav>
      <div className="border-t border-gray-800 px-3 py-3">
        <div className="mb-2 px-2 text-xs text-gray-400">{userName}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'mb-0.5 flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors',
        active ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-100'
      )}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}
