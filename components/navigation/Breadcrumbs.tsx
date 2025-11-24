'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const breadcrumbsMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Home', href: '/', current: true }],
  '/health': [
    { label: 'Home', href: '/' },
    { label: 'Health', href: '/health', current: true },
  ],
  '/health/records': [
    { label: 'Home', href: '/' },
    { label: 'Health', href: '/health' },
    { label: 'Records', href: '/health/records', current: true },
  ],
  '/health/treatment': [
    { label: 'Home', href: '/' },
    { label: 'Health', href: '/health' },
    { label: 'Treatment', href: '/health/treatment', current: true },
  ],
  '/health/insights': [
    { label: 'Home', href: '/' },
    { label: 'Health', href: '/health' },
    { label: 'Insights', href: '/health/insights', current: true },
  ],
  '/business': [
    { label: 'Home', href: '/' },
    { label: 'Business', href: '/business', current: true },
  ],
  '/education': [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education', current: true },
  ],
  '/sustainability': [
    { label: 'Home', href: '/' },
    { label: 'Sustainability', href: '/sustainability', current: true },
  ],
  '/playground': [
    { label: 'Home', href: '/' },
    { label: 'Playground', href: '/playground', current: true },
  ],
  '/workflow': [
    { label: 'Home', href: '/' },
    { label: 'Workflows', href: '/workflow', current: true },
  ],
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbs = items || breadcrumbsMap[pathname] || [{ label: 'Home', href: '/' }];

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {item.current ? (
              <span className="font-semibold text-foreground">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
