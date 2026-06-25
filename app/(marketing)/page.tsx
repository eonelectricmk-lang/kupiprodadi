'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import Header from '../components/Header';
import AdCard from '../components/AdCard';
import CategoryCard from '../components/CategoryCard';
import { Container, Button } from '../components/ui';
import { CATEGORIES } from '@/lib/categories';
import { getCategoryIconMeta } from '../components/categoryIcons';

type ProductCard = {
  id: number;
  title: string;
  price: number;
  currency?: string;
  description?: string;
  location?: string | null;
  city?: string | null;
  image_url?: string | null;
  images?: string[];
  seller_rating?: number;
  created_at?: string;
  category: string;
};

export default function Home() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [featuredAds, setFeaturedAds] = useState<ProductCard[]>([]);

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

  useEffect(() => {
    fetch('/api/products?limit=8&offset=0', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.products) && data.products.length) {
          setFeaturedAds(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const featuredCards = useMemo(() => featuredAds.slice(0, 8), [featuredAds]);

  return (
    <main className="min-h-screen bg-[#040914] text-white">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="overflow-hidden rounded-3xl border border-[#1d2c43] bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.18),_transparent_38%),linear-gradient(135deg,_#07101c_0%,_#0b1322_100%)] p-8 md:p-12">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-200">
              Kupi Prodadi
            </p>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              Креирано за брзо објавување, јасна навигација и live категории.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Нови категории и огласи се прикажуваат од истите податоци што ги користи целиот сајт, па нема дуплирање и нема рачно синхронизирање.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products">
                <Button className="bg-red-600 text-white hover:bg-red-700">Пребарај огласи</Button>
              </Link>
              <Link href="/sell">
                <Button className="bg-[#122038] text-white hover:bg-[#1a2d49]">Објави оглас</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Категории</h2>
            <p className="mt-1 text-sm text-slate-400">Се вчитуваат директно од базата.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-red-300 hover:text-red-200">
            Види ги сите →
          </Link>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((category) => {
            const iconMeta = getCategoryIconMeta(category.slug);
            return (
              <CategoryCard
                key={category.slug}
                icon={iconMeta.Icon}
                iconClassName={iconMeta.className}
                title={category.name}
                href={`/products?category=${category.slug}`}
              />
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Истакнати огласи</h2>
            <p className="mt-1 text-sm text-slate-400">Автоматски се земаат од live products API.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-red-300 hover:text-red-200">
            Сите огласи →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featuredCards.map((ad) => {
            const image = ad.images?.[0] || ad.image_url || undefined;
            return (
              <Link key={ad.id} href={`/products/${ad.id}?category=${encodeURIComponent(ad.category)}`}>
                <AdCard
                  ad={{
                    id: ad.id,
                    title: ad.title,
                    price: ad.price,
                    currency: ad.currency || '€',
                    image_url: image,
                    location: ad.location || ad.city || 'Македонија',
                    description: ad.description,
                    postedAt: ad.created_at,
                    isVerified: Number(ad.seller_rating || 0) >= 4.7,
                    badge: null,
                  }}
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[#07101c] py-14">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-[#1d2c43] bg-[#0b1322] p-6">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
              <h3 className="mt-4 text-lg font-bold">Безбедна трансакција</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Структурата е поставена да ги користи истите категории и огласи насекаде.</p>
            </div>
            <div className="rounded-2xl border border-[#1d2c43] bg-[#0b1322] p-6">
              <Zap className="h-8 w-8 text-amber-400" />
              <h3 className="mt-4 text-lg font-bold">Брзо и едноставно</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Нови записи од admin се прикажуваат веднаш по refresh, без рачно дуплирање.</p>
            </div>
            <div className="rounded-2xl border border-[#1d2c43] bg-[#0b1322] p-6">
              <MessageCircle className="h-8 w-8 text-sky-400" />
              <h3 className="mt-4 text-lg font-bold">Директна комуникација</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Истите live податоци се користат за преглед, линкови и search flow.</p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
