'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdCard from '@/app/components/AdCard';
import { Button, Container } from '@/app/components/ui';
import { normalizeCategorySlug } from '@/lib/category-aliases';

interface Product {
  id: number;
  title: string;
  price: number;
  currency?: string;
  description: string;
  category: string;
  subcategory?: string | null;
  condition?: string | null;
  location?: string | null;
  city?: string | null;
  image_url?: string | null;
  images?: string[];
  seller_rating?: number;
  created_at?: string;
}

const PER_PAGE_OPTIONS = [30, 50, 70, 100] as const;
const DEFAULT_PER_PAGE = 30;

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function formatPostedAt(value?: string) {
  if (!value) return 'Денес';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Денес';

  return new Intl.DateTimeFormat('mk-MK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [cardsPerRow, setCardsPerRow] = useState<6 | 4 | 2>(4);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'title-asc'>('newest');

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const location = searchParams.get('location');
  const page = searchParams.get('page');
  const sub = searchParams.get('sub');
  const trail = searchParams.get('trail');

  const sortedProducts = useMemo(() => {
    const next = [...products];

    switch (sortBy) {
      case 'oldest':
        return next.sort((a, b) => a.id - b.id);
      case 'price-asc':
        return next.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return next.sort((a, b) => b.price - a.price);
      case 'title-asc':
        return next.sort((a, b) => a.title.localeCompare(b.title, 'mk'));
      case 'newest':
      default:
        return next.sort((a, b) => b.id - a.id);
    }
  }, [products, sortBy]);

  const adsGridClassName = useMemo(() => {
    if (cardsPerRow === 6) {
      return 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
    }
    if (cardsPerRow === 2) {
      return 'grid grid-cols-1 gap-3 sm:grid-cols-2';
    }
    return 'grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4';
  }, [cardsPerRow]);

  useEffect(() => {
    const pageNumber = Math.max(parseInt(page || '1', 10) || 1, 1);
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const apiParams = new URLSearchParams();
        apiParams.set('limit', String(perPage));
        apiParams.set('offset', String((pageNumber - 1) * perPage));

        if (category) apiParams.set('category', normalizeCategorySlug(category));
        if (sub) apiParams.set('sub', normalizeCategorySlug(sub));
        if (search) apiParams.set('search', search);
        if (location) apiParams.set('location', location);

        const response = await fetch(`/api/products?${apiParams.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Не можам да ги вчитам огласите.');
        }

        const data = await response.json();
        const nextProducts = Array.isArray(data.products) ? data.products : [];
        const total = Number(data.total || 0);

        setProducts(nextProducts);
        setTotalProducts(total);
        setTotalPages(Math.max(Math.ceil(total / perPage), 1));
        setCurrentPage(pageNumber);
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Error fetching products:', fetchError);
          setError(fetchError instanceof Error ? fetchError.message : 'Грешка при вчитување на огласи.');
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [category, search, location, page, sub, trail, perPage]);

  const goToPage = (newPage: number) => {
    const nextPage = Math.min(Math.max(newPage, 1), totalPages);
    const newParams = new URLSearchParams(searchParams);

    if (nextPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', nextPage.toString());
    }

    router.push(`/products?${newParams.toString()}`);
  };

  return (
    <Container className="pb-8 pt-3 text-white">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Огласи</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? 'Вчитување...' : `${totalProducts.toLocaleString('mk-MK')} активни огласи`}
          </p>
        </div>

        {!loading && !error && products.length > 0 && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              value={perPage}
              onChange={(e) => {
                const newPerPage = Number(e.target.value);
                setPerPage(newPerPage);
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('page');
                router.push(`/products?${newParams.toString()}`);
              }}
              className="h-9 rounded-lg border border-[#1f3250] bg-[#0f1a2b] px-2.5 text-sm text-slate-200 outline-none transition focus:border-[#2d4f7d]"
              aria-label="Огласи по страна"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>Прикажи по {n}</option>
              ))}
            </select>
            <div className="inline-flex items-center gap-1 rounded-lg border border-[#1f3250] bg-[#0f1a2b] p-1">
            <button
              type="button"
              aria-label="Прикажи 6 во ред"
              onClick={() => setCardsPerRow(6)}
              className={`rounded p-1 transition ${cardsPerRow === 6 ? 'bg-[#162945] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="grid grid-cols-3 gap-0.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={`products-v6-${i}`} className="h-1.5 w-1.5 rounded-[2px] bg-current" />
                ))}
              </span>
            </button>
            <button
              type="button"
              aria-label="Прикажи 4 во ред"
              onClick={() => setCardsPerRow(4)}
              className={`rounded p-1 transition ${cardsPerRow === 4 ? 'bg-[#162945] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="grid grid-cols-2 gap-0.5">
                {Array.from({ length: 4 }, (_, i) => (
                  <span key={`products-v4-${i}`} className="h-1.5 w-1.5 rounded-[2px] bg-current" />
                ))}
              </span>
            </button>
            <button
              type="button"
              aria-label="Прикажи 2 во ред"
              onClick={() => setCardsPerRow(2)}
              className={`rounded p-1 transition ${cardsPerRow === 2 ? 'bg-[#162945] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="grid grid-cols-1 gap-0.5">
                {Array.from({ length: 2 }, (_, i) => (
                  <span key={`products-v2-${i}`} className="h-1.5 w-3 rounded-[2px] bg-current" />
                ))}
              </span>
            </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'title-asc')}
              className="h-9 rounded-lg border border-[#1f3250] bg-[#0f1a2b] px-2.5 text-sm text-slate-200 outline-none transition focus:border-[#2d4f7d]"
              aria-label="Сортирај огласи"
            >
              <option value="newest">Најновите први</option>
              <option value="oldest">Најстарите први</option>
              <option value="price-asc">Најниска цена</option>
              <option value="price-desc">Највисока цена</option>
              <option value="title-asc">По име (А-Ш)</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-[#1d2c43] bg-[#081223] py-12 text-center">
          <p className="text-slate-400">Вчитување огласи...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-[#1d2c43] bg-[#081223] py-12 text-center">
          <p className="text-slate-300">Нема огласи кои одговараат на вашите критериуми.</p>
          <Link href="/sell" className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            Објави прв оглас
          </Link>
        </div>
      ) : (
        <>
          <div className={adsGridClassName}>
            {sortedProducts.map((product) => {
              const primaryImage = product.images?.[0] || product.image_url || undefined;
              const hrefCategory = normalizeCategorySlug(category || product.category);

              return (
                <Link key={product.id} href={`/products/${product.id}?category=${encodeURIComponent(hrefCategory)}`}>
                  <AdCard
                    ad={{
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      currency: product.currency || '€',
                      image_url: primaryImage,
                      location: product.location || product.city || 'Македонија',
                      description: product.description,
                      postedAt: formatPostedAt(product.created_at),
                      isVerified: Number(product.seller_rating || 0) >= 4.7,
                      badge: product.condition === 'Ново' ? 'НОВО' : null,
                    }}
                    layout={cardsPerRow === 2 ? 'list' : 'grid'}
                  />
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-1.5">
              <Button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Назад
              </Button>

              {getPageNumbers(currentPage, totalPages).map((num, i) =>
                num === '...' ? (
                  <span key={`e-${i}`} className="px-2 text-sm text-slate-500">...</span>
                ) : (
                  <button
                    key={num}
                    type="button"
                    onClick={() => goToPage(num as number)}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      currentPage === num
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-[#2a3f60] bg-[#122038] text-slate-200 hover:bg-[#1a2d49]'
                    }`}
                  >
                    {num}
                  </button>
                )
              )}

              <Button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                Напред →
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Container className="py-8 text-white"><p className="text-slate-400">Вчитување...</p></Container>}>
      <ProductsPageContent />
    </Suspense>
  );
}
