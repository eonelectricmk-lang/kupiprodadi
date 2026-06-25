'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { ChevronDown, ChevronRight, CornerUpLeft } from 'lucide-react';
import { getCategoryIconMeta } from './categoryIcons';
import { normalizeCategorySlug } from '@/lib/category-aliases';

interface SidebarProps {
  activeCategory?: string;
  variant?: 'side' | 'inline';
}

export default function Sidebar({ activeCategory, variant = 'side' }: SidebarProps) {
  const [categories, setCategories] = useState(CATEGORIES);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get('category') || searchParams.get('sub') || activeCategory;
  const isDetailsPage = /^\/products\/[^/]+$/.test(pathname || '');
  const trailParam = searchParams.get('trail');
  const trailParts = (trailParam || '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  const selectedSubParam = searchParams.get('sub');

  const normalizedCategoryParam = categoryParam ? normalizeCategorySlug(categoryParam) : undefined;

  const matchedCategory = normalizedCategoryParam
    ? categories.find(
      (category) =>
        category.slug === normalizedCategoryParam ||
        category.subcategories.some((sub) => sub.slug === normalizedCategoryParam),
    )
    : undefined;

  const normalizedTrailParts = trailParts.map((part) => normalizeCategorySlug(part));
  const baseTrailParts = (() => {
    if (normalizedCategoryParam && normalizedTrailParts[0] !== normalizedCategoryParam) {
      return [normalizedCategoryParam, ...normalizedTrailParts];
    }
    if (normalizedCategoryParam && normalizedTrailParts.length === 0) {
      return [normalizedCategoryParam];
    }
    return normalizedTrailParts;
  })();
  const trailForHeader = (() => {
    const withSelectedSub = [...baseTrailParts];
    if (selectedSubParam && withSelectedSub[withSelectedSub.length - 1] !== selectedSubParam) {
      withSelectedSub.push(selectedSubParam);
    }

    const seen = new Set<string>();
    return withSelectedSub.filter((part) => {
      if (seen.has(part)) return false;
      seen.add(part);
      return true;
    });
  })();

  const slugToName: Record<string, string> = {};
  categories.forEach((cat) => {
    slugToName[cat.slug] = cat.name;
    cat.subcategories.forEach((sub) => {
      slugToName[sub.slug] = sub.name;
    });
  });

  const buildTrailHref = (index: number) => {
    const newTrailParts = trailForHeader.slice(0, index + 1);
    const params = new URLSearchParams(searchParams.toString());

    params.set('trail', newTrailParts.join('/'));
    params.set('category', newTrailParts[0]);

    if (newTrailParts.length > 1) {
      params.set('sub', newTrailParts[newTrailParts.length - 1]);
    } else {
      params.delete('sub');
    }

    params.delete('page');
    return `/products?${params.toString()}`;
  };

  const isFocusedView = Boolean(matchedCategory);
  const categoriesToRender = matchedCategory ? [matchedCategory] : categories;

  const CATEGORY_COLORS = [
    { title: 'text-sky-300', activeBg: 'bg-sky-500/15', badge: 'border border-sky-500/35 bg-sky-500/15 text-sky-200 hover:bg-sky-500/25' },
    { title: 'text-emerald-300', activeBg: 'bg-emerald-500/15', badge: 'border border-emerald-500/35 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25' },
    { title: 'text-orange-300', activeBg: 'bg-orange-500/15', badge: 'border border-orange-500/35 bg-orange-500/15 text-orange-200 hover:bg-orange-500/25' },
    { title: 'text-violet-300', activeBg: 'bg-violet-500/15', badge: 'border border-violet-500/35 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25' },
    { title: 'text-pink-300', activeBg: 'bg-pink-500/15', badge: 'border border-pink-500/35 bg-pink-500/15 text-pink-200 hover:bg-pink-500/25' },
    { title: 'text-cyan-300', activeBg: 'bg-cyan-500/15', badge: 'border border-cyan-500/35 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25' },
    { title: 'text-indigo-300', activeBg: 'bg-indigo-500/15', badge: 'border border-indigo-500/35 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25' },
    { title: 'text-teal-300', activeBg: 'bg-teal-500/15', badge: 'border border-teal-500/35 bg-teal-500/15 text-teal-200 hover:bg-teal-500/25' },
    { title: 'text-rose-300', activeBg: 'bg-rose-500/15', badge: 'border border-rose-500/35 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25' },
    { title: 'text-amber-300', activeBg: 'bg-amber-500/15', badge: 'border border-amber-500/35 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25' },
  ];

  const isInline = variant === 'inline';

  useEffect(() => {
    fetch('/api/categories')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.categories) && data.categories.length) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className={isInline ? 'w-full rounded-xl border border-[#1d2c43] bg-[#081223] p-3 pb-2' : 'h-full w-48 border-r border-[#1d2c43] bg-[#081223] p-3'}>
      <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {isFocusedView ? 'Категорија' : 'Категории'}
      </h2>
      
      <div className="space-y-0.5">
        {categoriesToRender.map((category, i) => {
          const c = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          const isOpen =
            isFocusedView
              ? true
              : expanded === category.slug || activeCategory === category.slug;
          const { Icon, className } = getCategoryIconMeta(category.slug);
          const showInlineTrailInHeader = isInline && isFocusedView && trailForHeader.length > 0;
          return (
            <div key={category.slug}>
              <button
                onClick={() => {
                  if (!isFocusedView) {
                    setExpanded(isOpen ? null : category.slug);
                  }
                }}
                className={`category-active-chip flex w-full items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-left text-sm transition ${showInlineTrailInHeader ? 'font-medium' : 'font-semibold'} ${isOpen ? `${c.activeBg} ${c.title}` : `text-slate-300 hover:bg-[#14243a] hover:text-white`}`}
              >
                {showInlineTrailInHeader ? (
                  <>
                    <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                      <Icon className={`h-4 w-4 shrink-0 ${className}`} />
                      {trailForHeader.map((part, idx) => (
                        <span key={`${part}-${idx}`} className="flex min-w-0 items-center gap-1.5">
                          <Link
                            href={buildTrailHref(idx)}
                            className="truncate rounded px-1 py-0.5 font-medium hover:bg-[#16263d] hover:text-white"
                          >
                            {slugToName[part] || part}
                          </Link>
                          {idx < trailForHeader.length - 1 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
                        </span>
                      ))}
                    </span>

                    <Link
                      href={buildTrailHref(Math.max(0, trailForHeader.length - 2))}
                      aria-disabled={trailForHeader.length <= 1}
                      className="category-back-chip ml-2 inline-flex shrink-0 items-center gap-1 rounded-md border border-[#2a3f60] bg-[#122038] px-2 py-1 text-[11px] font-semibold text-slate-200 hover:bg-[#1a2d49] aria-disabled:pointer-events-none aria-disabled:opacity-40"
                    >
                      <CornerUpLeft className="h-3.5 w-3.5" /> Назад
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon className={`h-4 w-4 ${className}`} />
                      <span className="truncate">{category.name}</span>
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isFocusedView ? 'opacity-40' : ''}`}
                    />
                  </>
                )}
              </button>

              {isOpen && (
                <div className="ml-2 mt-1 mb-1 flex flex-wrap gap-1">
                  {category.subcategories
                    .filter((sub) => !baseTrailParts.includes(sub.slug))
                    .map((sub) => {
                      const nextTrailParts = [...baseTrailParts];
                      if (nextTrailParts[nextTrailParts.length - 1] !== sub.slug) {
                        nextTrailParts.push(sub.slug);
                      }

                      return (
                        <Link
                          key={sub.slug}
                          href={`/products?category=${category.slug}&sub=${sub.slug}&trail=${encodeURIComponent(nextTrailParts.join('/'))}`}
                          className={`subcategory-pill inline-block rounded-full px-2 py-0.5 text-xs font-medium transition ${c.badge}`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
