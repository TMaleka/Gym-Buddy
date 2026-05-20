'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'This Week' },
  { href: '/marathon', label: 'Full Plan' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gradient-to-r from-[#1e293b] to-[#334155] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#5B7FFF] rounded-lg p-1.5 group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              GYM BUDDY
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-[#5B7FFF] text-white shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
