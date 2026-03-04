'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';

const tabs = [
  { href: '/', labelKey: 'nav_home', icon: 'home' },
  { href: '/recipes', labelKey: 'nav_recipes', icon: 'book' },
  { href: '/calendar', labelKey: 'nav_calendar', icon: 'calendar' },
  { href: '/seasonal', labelKey: 'nav_seasonal', icon: 'leaf' },
  { href: '/grocery', labelKey: 'nav_grocery', icon: 'cart' },
  { href: '/settings', labelKey: 'nav_settings', icon: 'settings' },
] as const;

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'var(--color-accent)' : 'var(--color-ink-faint)';
  const size = active ? 22 : 20;
  const props = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'home':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" />
          <path d="M9 21V14h6v7" />
        </svg>
      );
    case 'book':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M2 4h6a4 4 0 014 4v14a3 3 0 00-3-3H2V4z" />
          <path d="M22 4h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V4z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 3 1.3 5.7 3.4 7.5C7 15 10 10 17 6c-2 5-5 9-7.6 11.5.8.3 1.7.5 2.6.5 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
        </svg>
      );
    case 'cart':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

export function BottomNav() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'rgba(250, 250, 248, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              color: active ? 'var(--color-accent)' : 'var(--color-ink-faint)',
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              transition: 'color 0.15s',
            }}
          >
            <TabIcon name={tab.icon} active={active} />
            <span>{t(tab.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
