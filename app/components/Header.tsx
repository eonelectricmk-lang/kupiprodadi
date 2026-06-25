'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Container } from './ui';
import { CATEGORIES } from '@/lib/categories';
import {
  Bell, ChevronDown, Heart, LayoutGrid, MapPin,
  Search,
  UserCircle, Sun, Moon,
} from 'lucide-react';
import { getCategoryIconMeta } from './categoryIcons';
import { useTheme } from '@/app/context/ThemeContext';

const MACEDONIAN_CITIES = [
  'Целa Македонија', 'Скопје', 'Прилеп', 'Битола', 'Охрид',
  'Куманово', 'Велес', 'Штип', 'Гевгелија', 'Кавадарци',
  'Кичево', 'Коцани', 'Крива Паланка', 'Ресен', 'Берово',
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const { dark, setDark } = useTheme();
  const [categories, setCategories] = useState(CATEGORIES);
  const [headerCategorySlugs, setHeaderCategorySlugs] = useState<string[]>([]);
  const [location, setLocation] = useState('Целa Македонија');
  const [showLocation, setShowLocation] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categoryMenuTop, setCategoryMenuTop] = useState(0);
  const [search, setSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const h = dark ? {
    header: 'bg-[#07101c]/95 border-[#172334]',
    search: 'bg-[#0b1727] border-gray-500',
    searchInput: 'text-gray-100 placeholder-gray-500',
    searchIcon: 'text-gray-400',
    location: 'bg-[#0b1727] border-[#1f3047] text-gray-200',
    locationDropdown: 'bg-[#0f1b2b] border-[#1f3047]',
    locationItem: 'text-gray-200 hover:bg-[#14243a]',
    icon: 'text-gray-400 hover:text-white',
    navBar: 'bg-[#050c16] border-[#172334]',
    allCats: 'bg-[#121f33] hover:bg-[#1a2d49] text-white border-2 border-[#1d2c43]',
    navCat: 'bg-[#0f1a2b] text-gray-300 hover:text-white hover:bg-[#16263d] border-2 border-[#1d2c43]',
    more: 'text-gray-400 hover:text-white',
    dropdown: 'bg-[#0d1727] border-[#1f3047]',
    subText: 'text-gray-300 hover:text-white',
    logo: 'text-white',
  } : {
    header: 'bg-white/95 border-gray-200',
    search: 'bg-gray-100 border-gray-400',
    searchInput: 'text-gray-900 placeholder-gray-400',
    searchIcon: 'text-gray-700',
    location: 'bg-gray-100 border-gray-300 text-gray-900',
    locationDropdown: 'bg-white border-gray-200',
    locationItem: 'text-gray-900 hover:bg-gray-100',
    icon: 'text-gray-700 hover:text-gray-900',
    navBar: 'bg-gray-50 border-gray-200',
    allCats: 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300',
    navCat: 'bg-white text-gray-900 hover:text-gray-900 hover:bg-gray-50 border-2 border-gray-300',
    more: 'text-gray-700 hover:text-gray-900',
    dropdown: 'bg-white border-gray-200',
    subText: 'text-gray-700 hover:text-gray-900',
    logo: 'text-gray-900',
  };

  const colors = [
    'bg-blue-600','bg-emerald-600','bg-orange-500','bg-purple-600','bg-pink-500',
    'bg-sky-500','bg-indigo-600','bg-teal-600','bg-rose-500','bg-amber-500',
    'bg-cyan-600','bg-lime-600','bg-violet-600','bg-fuchsia-600','bg-red-500',
    'bg-green-600','bg-yellow-500','bg-blue-500','bg-emerald-500','bg-purple-500',
  ];

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
    fetch('/api/homepage-sections')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.headerCategorySlugs)) {
          setHeaderCategorySlugs(data.headerCategorySlugs);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchUnread = () => {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) { setUserAvatar(null); return; }
        const user = JSON.parse(stored);
        if (!user?.id) return;
        setUserAvatar(user.avatar_url || null);
        fetch(`/api/messages?user_id=${user.id}`)
          .then((res) => res.json())
          .then((msgs) => {
            if (Array.isArray(msgs)) {
              const unread = msgs.filter((m: any) => Number(m.read) === 0 && Number(m.receiver_id) === user.id);
              setUnreadCount(unread.length);
            }
          })
          .catch(() => {});
      } catch {}
    };
    fetchUnread();
    window.addEventListener('focus', fetchUnread);
    return () => window.removeEventListener('focus', fetchUnread);
  }, []);

  useEffect(() => {
    if (!showCategories) return undefined;

    const updateMenuTop = () => {
      const rect = headerRef.current?.getBoundingClientRect();
      if (rect) {
        setCategoryMenuTop(Math.round(rect.bottom));
      }
    };

    updateMenuTop();
    window.addEventListener('resize', updateMenuTop);

    return () => window.removeEventListener('resize', updateMenuTop);
  }, [showCategories]);

  useEffect(() => {
    setShowCategories(false);
    setShowLocation(false);
  }, [pathname]);

  const orderedHeaderCategories = useMemo(() => {
    if (!headerCategorySlugs.length) return categories.slice(0, 5);
    const bySlug = new Map(categories.map((category) => [category.slug, category]));
    const selected = headerCategorySlugs
      .map((slug) => bySlug.get(slug))
      .filter((category): category is typeof categories[number] => Boolean(category));
    return selected.length ? selected : categories.slice(0, 5);
  }, [categories, headerCategorySlugs]);

  const navCategories = orderedHeaderCategories.slice(0, 5).map((category) => {
    return {
      slug: category.slug,
      name: category.name,
      iconMeta: getCategoryIconMeta(category.slug),
    };
  });

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    if (location && location !== 'Целa Македонија') {
      params.set('location', location);
    }
    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <>
      <header ref={headerRef} className={`sticky top-0 z-50 backdrop-blur transition-colors duration-300 ${h.header}`}>
        <Container>
          <div className="flex flex-wrap items-center gap-3 py-3 md:flex-nowrap md:justify-between md:gap-4">
            <Link href="/" className="ml-2 flex-shrink-0 transition hover:opacity-90">
              <span className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${h.logo}`}>kupi</span>
              <span className="text-3xl font-extrabold tracking-tight text-red-500 sm:text-4xl">prodadi</span>
            </Link>

          <form onSubmit={submitSearch} className={`order-3 hidden w-full items-center overflow-hidden rounded-lg border-2 focus-within:border-blue-400 md:order-none md:flex md:max-w-xl md:flex-1 ${h.search}`}>
            <span className={`pl-3 text-sm ${h.searchIcon}`}><Search className="h-4 w-4" /></span>
            <input
              type="text"
              placeholder="Пребарај огласи..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`flex-1 px-3 py-2.5 text-sm focus:outline-none bg-transparent ${h.searchInput}`}
            />
            <button type="submit" className="sr-only">Пребарај</button>
          </form>

          <div className="relative flex-shrink-0 hidden lg:block">
            <button
              onClick={() => setShowLocation(!showLocation)}
              className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm font-medium hover:border-blue-400 transition ${h.location}`}
            >
              <MapPin className="h-4 w-4" />
              <span className="whitespace-nowrap">{location}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showLocation && (
              <div className={`absolute top-full right-0 mt-1 border rounded-lg shadow-xl z-50 w-48 max-h-60 overflow-y-auto ${h.locationDropdown}`}>
                {MACEDONIAN_CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => { setLocation(city); setShowLocation(false); }}
                    className={`w-full text-left px-4 py-2 text-sm ${h.locationItem}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <button onClick={() => setDark(!dark)} className={`hidden transition sm:inline-flex ${h.icon}`} title={dark ? 'Светла тема' : 'Темна тема'}>
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link href="/profile?tab=saved">
              <button className={`transition ${h.icon}`}><Heart className="h-5 w-5" /></button>
            </Link>
            <Link href="/profile?tab=messages">
              <div className="relative">
                <button className={`transition ${h.icon}`}><Bell className="h-5 w-5" /></button>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1">{unreadCount}</span>}
              </div>
            </Link>
            <Link href="/auth">
              <button className={`transition ${h.icon}`}>
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
              </button>
            </Link>
            <Link href="/sell">
              <button className="hidden whitespace-nowrap rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 sm:inline-flex">
                + Објави оглас
              </button>
            </Link>
          </div>
        </div>
      </Container>

      <div className={`transition-colors duration-300 ${h.navBar}`}>
        <Container>
          <div className="grid grid-cols-2 gap-1.5 py-1 sm:grid-cols-3 sm:gap-2 lg:grid-cols-6 lg:gap-2.5">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className={`flex min-w-0 items-center gap-1 overflow-hidden rounded px-2 py-1 text-[12px] font-semibold leading-none tracking-[-0.01em] transition sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[13px] lg:text-sm ${h.allCats}`}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left">Сите категории</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {navCategories.map(cat => (
              <a
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={`flex min-w-0 items-center gap-1 overflow-hidden rounded px-2 py-1 text-[12px] leading-none tracking-[-0.01em] transition sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[13px] lg:text-sm ${h.navCat}`}
                onClick={() => setShowCategories(false)}
              >
              <cat.iconMeta.Icon className={`h-4 w-4 shrink-0 ${cat.iconMeta.className}`} />
                <span className="min-w-0 flex-1 truncate text-left">{cat.name}</span>
              </a>
            ))}
          </div>
        </Container>
      </div>
      </header>

      {showCategories && typeof window !== 'undefined' && createPortal(
        <>
          <button
            type="button"
            aria-label="Затвори категории"
            onClick={() => setShowCategories(false)}
            className="fixed inset-0 z-[998] cursor-default bg-black/20"
          />
          <div
            className={`fixed left-0 right-0 z-[999] max-h-[70vh] overflow-y-auto border-t shadow-2xl ${h.dropdown}`}
            style={{ top: `${categoryMenuTop}px` }}
          >
            <Container>
              <div className="grid grid-cols-2 gap-4 py-5 md:grid-cols-4">
                {categories.map((category, i) => {
                  const { Icon, className } = getCategoryIconMeta(category.slug);
                  return (
                    <div key={category.slug}>
                      <a
                        href={`/products?category=${category.slug}`}
                        className={`block w-full rounded-md px-3 py-2 text-left text-sm font-bold mb-2 cursor-pointer transition ${colors[i % colors.length]}`}
                        style={{ color: '#fff' }}
                        onClick={() => setShowCategories(false)}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Icon className={`h-4 w-4 ${className}`} /> {category.name}
                        </span>
                      </a>
                      <div className="pl-1 space-y-0.5">
                        {category.subcategories.map(sub => (
                          <a
                            key={sub.slug}
                            href={`/products?category=${category.slug}&sub=${sub.slug}`}
                            className={`block w-full rounded-md px-2 py-1 text-left text-xs cursor-pointer transition hover:bg-[#16263d] hover:underline ${h.subText}`}
                            onClick={() => setShowCategories(false)}
                          >
                            • {sub.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Container>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}

export default Header;
