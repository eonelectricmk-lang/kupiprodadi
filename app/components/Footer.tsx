'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

export default function Footer() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const contactPhoneDisplay = '+389 70 227 677';
  const contactPhoneHref = 'tel:+38970227677';
  const websiteUrl = 'https://www.kupiprodadi.mk';
  const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com/kupiprodadi.mk' },
    { label: 'Instagram', href: 'https://instagram.com/kupiprodadi.mk' },
    { label: 'TikTok', href: 'https://tiktok.com/@kupiprodadi.mk' },
    { label: 'Viber', href: 'viber://chat?number=%2B38970227677' },
    { label: 'Telegram', href: 'https://t.me/+38970227677' },
    { label: 'WhatsApp', href: 'https://wa.me/38970227677' },
  ];

  const footerGroupSlug = (slug: string) => {
    if (slug === 'motorni-vozila') return 'avtomobili';
    return slug.replace(/-/g, '');
  };

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
    <footer className="bg-[#050c16] border-t border-[#172334] text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr] xl:gap-10">

          {/* Лого + Опис */}
          <div className="min-w-0">
            <Link href="/">
              <span className="text-2xl font-extrabold text-white">kupi</span>
              <span className="text-2xl font-extrabold text-red-500">prodadi</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Македонска платформа за купување и продавање.
              <span className="mt-1 block">Безбедно, брзо и бесплатно.</span>
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition">
                <Globe className="h-4 w-4" />
                <span>www.kupiprodadi.mk</span>
              </a>
              <Link href="/messages" className="flex items-center gap-2 hover:text-white transition">
                <Mail className="h-4 w-4" />
                <span>Прати порака до админ</span>
              </Link>
              <a href={contactPhoneHref} className="flex min-w-0 items-center gap-2 hover:text-white transition">
                <Phone className="h-4 w-4 shrink-0" />
                <span>
                  Добиј нè на директна линија и прашај:
                  <span className="block">{contactPhoneDisplay}</span>
                </span>
              </a>
            </div>
            {isExploreOpen && (
              <div className="mt-5 rounded-2xl border border-[#223653] bg-[#0b1727] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Мрежи, канали и групи</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={socialLinks[0].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#314661] bg-[#081223] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                    <span className="text-[10px] font-black uppercase">fb</span>
                    Facebook
                  </a>
                  <a href={socialLinks[1].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#314661] bg-[#081223] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                    <span className="text-[10px] font-black uppercase">ig</span>
                    Instagram
                  </a>
                  <a href={socialLinks[2].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#314661] bg-[#081223] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                    <MessageCircle className="h-3.5 w-3.5" />
                    TikTok
                  </a>
                  <a href={socialLinks[3].href} className="inline-flex items-center gap-2 rounded-full border border-[#314661] bg-[#081223] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                    <Phone className="h-3.5 w-3.5" />
                    Viber
                  </a>
                  <a href={socialLinks[4].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#314661] bg-[#081223] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                    <Send className="h-3.5 w-3.5" />
                    Telegram
                  </a>
                  <a href={socialLinks[5].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#314661] bg-[#081223] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Facebook групи</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {categories.slice(0, 5).map((category) => (
                      <a
                        key={`${category.slug}-group-panel`}
                        href={`https://fb.com/kupiprodadi.${footerGroupSlug(category.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-[#314661] bg-[#081223] px-3 py-2 text-xs text-slate-200 transition hover:text-white"
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Помош */}
          <div className="xl:pl-2">
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Помош</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/kako-da-objavam" className="hover:text-white transition">Како да објавам оглас</Link></li>
              <li><Link href="/pravila" className="hover:text-white transition">Правила за огласување</Link></li>
              <li><Link href="/bezbedan-pazar" className="hover:text-white transition">Тргувај безбедно</Link></li>
              <li><Link href="/messages" className="hover:text-white transition">Контактирајте не</Link></li>
              <li><Link href="/messages?subject=abuse" className="hover:text-white transition">Пријави злоупотреба</Link></li>
            </ul>
          </div>

          {/* Информации */}
          <div className="xl:pl-2">
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Информации</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/za-nas" className="hover:text-white transition">За КупиПродади</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Политика за приватност</Link></li>
              <li><Link href="/privacy#kolacinja" className="hover:text-white transition">Политика за колачиња</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Банери и рекламирање</Link></li>
              <li><Link href="/pridobivki-za-prodavaci" className="hover:text-white transition">Придобивки за продавачи</Link></li>
            </ul>
          </div>

          {/* Категории */}
          <div className="xl:pl-2">
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Категории</h3>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 5).map((category) => (
                <li key={category.slug}>
                  <Link href={`/products?category=${category.slug}`} className="hover:text-white transition">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-start gap-3 xl:justify-end">
              <button
                type="button"
                onClick={() => setIsExploreOpen((prev) => !prev)}
                className="hover:text-white transition"
                aria-label="Website и социјални мрежи"
                aria-expanded={isExploreOpen}
              >
                <Globe className="h-5 w-5" />
              </button>
              <Link href="/messages" className="hover:text-white transition" aria-label="Контакт форма"><Mail className="h-5 w-5" /></Link>
              <a href={contactPhoneHref} className="hover:text-white transition" aria-label="Телефон"><Phone className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#172334] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 КупиПродади. Сите права задржани.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition">Приватност</Link>
            <Link href="/pravila" className="hover:text-white transition">Правила</Link>
            <Link href="/messages" className="hover:text-white transition">Контакт</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
