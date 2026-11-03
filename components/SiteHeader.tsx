'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { Logo, Wordmark } from './Logo';

const NAV = [
  { href: '/', label: 'Каталог' },
  { href: '/categories', label: 'Категории' },
  { href: '/about', label: 'О проекте' },
  { href: '/docs', label: 'Добавить приложение' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-violet-400/12 bg-ink-950/80 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl py-1 pr-2">
          <Logo />
          <Wordmark />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? 'bg-violet-500/15 text-violet-100'
                    : 'text-violet-100/60 hover:bg-white/5 hover:text-violet-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/littlelegsoff-dev/Cremnoty-Store"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-violet-400/20 bg-white/[0.03] px-3.5 py-1.5 text-[13px] font-medium text-violet-100/80 transition-colors hover:border-violet-400/40 hover:text-violet-50 sm:flex"
          >
            <GithubIcon className="size-4" />
            Репозиторий
          </a>
          <a
            href="/api/apps"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full bg-violet-500 px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(143,87,247,0.9)] transition-colors hover:bg-violet-400 sm:block"
          >
            API
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
            className="grid size-9 place-items-center rounded-xl border border-violet-400/20 text-violet-100 md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-violet-400/10 bg-ink-950/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm text-violet-100/80 hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
