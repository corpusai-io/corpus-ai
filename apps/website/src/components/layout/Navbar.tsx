'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Menu,
  X,
  FileCode,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavDropdownItem {
  label: string;
  href: string;
  icon: LucideIcon;
  desc?: string;
}

interface NavItem {
  label: string;
  href?: string;
  items?: NavDropdownItem[];
  columns?: number;
  width?: string;
  footer?: { text: string; href: string };
}

const navItems: NavItem[] = [
  {
    label: 'Docs',
    href: '/docs',
  },
];

function DropdownItem({ item, hasDesc }: { item: NavDropdownItem; hasDesc: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F7F7F7] transition-colors">
      <div className="w-9 h-9 rounded-lg bg-[#F7F7F7] flex items-center justify-center text-[#171717] shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-sm font-medium text-[#171717]">{item.label}</div>
        {hasDesc && item.desc && <div className="text-xs text-[#737373] mt-0.5">{item.desc}</div>}
      </div>
    </Link>
  );
}

function DesktopNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="px-3 py-2 text-[14px] font-normal text-[#171717]/80 hover:text-[#171717] transition-colors rounded-lg tracking-[-0.2px] font-[family-name:var(--font-inter)]"
      >
        {item.label}
      </Link>
    );
  }

  const hasDesc = item.label === 'Platform';
  const gridCols = item.columns === 3 ? 'grid-cols-3' : item.columns === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="flex items-center gap-1 px-3 py-2 text-[14px] font-normal text-[#171717]/80 hover:text-[#171717] transition-colors rounded-lg cursor-pointer tracking-[-0.2px] font-[family-name:var(--font-inter)]">
        {item.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={12} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-[#E8E8E8] rounded-xl p-4 shadow-lg shadow-black/[0.06] ${item.width}`}
          >
            <div className={`grid ${gridCols} gap-1`}>
              {item.items?.map((sub) => (
                <DropdownItem key={sub.href} item={sub} hasDesc={hasDesc} />
              ))}
            </div>
            {item.footer && (
              <div className="border-t border-[#E8E8E8] mt-3 pt-3">
                <Link href={item.footer.href} className="text-xs text-[#737373] hover:text-[#171717] hover:underline transition-colors">
                  {item.footer.text}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileAccordion({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  if (item.href) {
    return (
      <Link href={item.href} className="block px-4 py-3 text-base text-[#171717]/80 hover:text-[#171717] transition-colors font-[family-name:var(--font-inter)]">
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-base text-[#171717]/80 hover:text-[#171717] transition-colors font-[family-name:var(--font-inter)]"
      >
        {item.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pb-2 space-y-1">
              {item.items?.map((sub) => {
                const Icon = sub.icon;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F7F7F7] transition-colors"
                  >
                    <Icon size={16} className="text-[#171717]" />
                    <span className="text-sm text-[#737373]">{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-[#E8E8E8]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo.svg" alt="Corpus AI" className="h-8 brightness-0 opacity-90" />
          </Link>

          {/* Center: Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <DesktopNavItem key={item.label} item={item} />
            ))}
          </div>

          {/* Right: CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/Sign-In"
              className="text-sm text-[#171717] border border-[#E8E8E8] shadow-[0_4px_4px_rgba(23,23,23,0.04)] rounded-[7px] px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/Sign-In"
              className="text-sm font-medium bg-[#171717] hover:bg-[#171717]/90 text-white rounded-md px-4 py-2.5 transition-colors tracking-[-0.28px]"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button className="lg:hidden text-[#171717]" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-50 lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E8]">
              <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
                <img src="/logo.svg" alt="Corpus AI" className="h-8 brightness-0 opacity-90" />
              </Link>
              <button className="text-[#171717]" onClick={() => setMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="mt-4 overflow-y-auto max-h-[calc(100vh-140px)]">
              {navItems.map((item) => (
                <MobileAccordion key={item.label} item={item} />
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3 border-t border-[#E8E8E8] bg-white">
              <Link
                href="/Sign-In"
                className="block text-center text-sm text-[#171717] border border-[#E8E8E8] shadow-[0_4px_4px_rgba(23,23,23,0.04)] rounded-[7px] py-2.5 hover:bg-[#F7F7F7] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/Sign-In"
                className="block text-center text-sm font-medium bg-[#171717] hover:bg-[#171717]/90 text-white rounded-md px-4 py-3 transition-colors tracking-[-0.28px]"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
