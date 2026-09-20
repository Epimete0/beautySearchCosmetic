'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ScanLine, List } from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Inicio',
    href: '/',
    icon: Home,
    isPrimary: false,
  },
  {
    label: 'Escanear',
    href: '/scan',
    icon: ScanLine,
    isPrimary: true,
  },
  {
    label: 'Catálogo',
    href: '/productos',
    icon: List,
    isPrimary: false,
  },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Compact Sidebar (min-width: 768px) */}
      <aside className="hidden md:flex md:w-24 lg:w-48 md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40 bg-[#FFFFFF] border-r border-[#E4E0E6]">
        {/* Brand header */}
        <div className="p-4 border-b border-[#E4E0E6] flex items-center justify-center lg:justify-start">
          <span className="font-headline font-bold text-lg text-[#211B26] tracking-tight">
            BeautySearch
          </span>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-1 px-2 py-6 flex flex-col gap-6">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3 px-3 py-2.5 transition-colors ${
                  active
                    ? 'text-[#2F6F62]'
                    : 'text-[#8A8580] hover:text-[#211B26]'
                } ${item.isPrimary ? 'font-semibold' : 'font-normal'}`}
              >
                <Icon
                  className={`${
                    item.isPrimary ? 'w-6 h-6 lg:w-6 lg:h-6' : 'w-5 h-5'
                  } transition-colors`}
                  strokeWidth={active ? 2.3 : item.isPrimary ? 2.1 : 1.8}
                />
                <span
                  className={`font-headline text-xs lg:text-sm ${
                    item.isPrimary ? 'text-xs lg:text-base font-semibold' : ''
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Fixed Bottom Nav (max-width: 768px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E4E0E6] pb-safe"
        aria-label="Navegación principal"
      >
        <div className="grid grid-cols-3 h-16 items-center px-4 max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 select-none transition-colors ${
                  active
                    ? 'text-[#2F6F62]'
                    : 'text-[#8A8580] hover:text-[#211B26]'
                }`}
              >
                <Icon
                  className={`${
                    item.isPrimary ? 'w-7 h-7 -mt-0.5' : 'w-5 h-5'
                  } transition-transform`}
                  strokeWidth={active ? 2.4 : item.isPrimary ? 2.2 : 1.8}
                />
                <span
                  className={`font-headline text-[11px] leading-tight tracking-tight mt-1 ${
                    item.isPrimary ? 'font-bold text-[12px]' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
