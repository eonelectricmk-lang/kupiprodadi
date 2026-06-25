"use client";

import { Suspense } from 'react';
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import { usePathname, useSearchParams } from 'next/navigation';

function BrowseLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDetailsPage = /^\/products\/[^/]+$/.test(pathname || '');
  const hasCategoryContext = Boolean(searchParams.get('category') || searchParams.get('sub'));
  const shouldUseInlineSidebar = hasCategoryContext && !isDetailsPage;

  return (
    <>
      <Header />
      <div className="browse-shell min-h-screen bg-[#050b17]">
        {shouldUseInlineSidebar && (
          <div className="mx-auto max-w-6xl px-4 pt-2">
            <Sidebar variant="inline" />
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="browse-shell min-h-screen bg-[#050b17]" />}>
      <BrowseLayoutContent>{children}</BrowseLayoutContent>
    </Suspense>
  );
}
