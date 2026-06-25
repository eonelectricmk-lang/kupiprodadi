'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import type { ElementType, ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  Clock3,
  Eye,
  Heart,
  Inbox,
  MapPin,
  MessageSquare,
  PencilLine,
  PenSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserCircle2,
} from 'lucide-react';
import { Header } from '@/app/components/Header';
import { Card, Container } from '@/app/components/ui';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';

type Product = {
  id: number;
  title: string;
  price: number;
  currency?: string;
  location?: string;
  city?: string;
  neighborhood?: string;
  address_note?: string;
  delivery?: string;
  contact_phone?: string;
  contact_email?: string;
  preferred_contact?: string;
  condition?: string;
  negotiable?: boolean;
  category?: string;
  subcategory?: string;
  image_url?: string;
  images?: string[];
  description?: string;
  views?: number;
  created_at?: string;
  status?: string;
};

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  product_id?: number | null;
  sender_name: string;
  receiver_name: string;
  content: string;
  product_title: string;
  read: boolean;
  created_at: string;
};

type SellingOrder = {
  id: number;
  product_id: number;
  title: string;
  buyer_name?: string;
  buyer_email?: string;
  status?: string;
  created_at: string;
  total_price: number;
};

type RecentView = {
  id: number;
  title: string;
  price: number;
  currency?: string;
  location?: string;
  image_url?: string | null;
  viewedAt: string;
};

type BalanceInfo = {
  balance: number;
  bonus_balance: number;
  spent_today: number;
  spent_month: number;
  refresh_today: number;
  refresh_week: number;
  refresh_month: number;
  monthly_refresh_limit: number;
  monthly_refreshes_remaining: number;
  ads_active: number;
  ads_this_month: number;
  ads_this_year: number;
  refresh_cost: number;
  promote_cost: number;
  currency: string;
};

type TabKey = 'ads' | 'saved' | 'settings' | 'messages';

function formatDate(value?: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return 'Денес';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Денес';
  return new Intl.DateTimeFormat('mk-MK', options || { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function readRecentViews(): RecentView[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('recently_viewed_ads');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toDateKey(value: Date) {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0'),
  ].join('-');
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const { dark } = useTheme();
  return (
    <Card className={`!rounded-[16px] p-4 text-center sm:p-5 ${dark ? 'force-dark-card border-[#1d2c43] bg-[#0b1423]' : 'border-slate-200 bg-white shadow-sm'}`}>
      <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl border text-slate-400 ${dark ? 'force-dark-subtle border-[#223653] bg-[#081223]' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
        <AlertCircle className="h-4 w-4" />
      </div>
      <h3 className={`mt-3 text-base font-semibold sm:text-lg ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

function MiniAdCard({
  title,
  meta,
  price,
  image,
  href,
  note,
  status,
}: {
  title: string;
  meta: string;
  price: string;
  image?: string | null;
  href: string;
  note?: string;
  status?: string;
}) {
  const { dark } = useTheme();
  const statusStyles: Record<string, string> = {
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    rejected: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    sold: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  };

  const statusLabels: Record<string, string> = {
    active: 'Активен',
    pending: 'Во преглед',
    rejected: 'Одбиен',
    sold: 'Продаден',
  };

  const resolvedStatus = status || null;
  const lightStatusStyles: Record<string, string> = {
    active: 'border-emerald-600 bg-emerald-100 text-emerald-800',
    pending: 'border-amber-500 bg-amber-50 text-amber-700',
    rejected: 'border-rose-500 bg-rose-50 text-rose-700',
    sold: 'border-slate-500 bg-slate-100 text-slate-700',
  };
  const statusClass = resolvedStatus
    ? dark
      ? statusStyles[resolvedStatus] || statusStyles.active
      : lightStatusStyles[resolvedStatus] || lightStatusStyles.active
    : '';
  const statusLabel = resolvedStatus ? statusLabels[resolvedStatus] || statusLabels.active : '';

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[14px] border border-[#1d2c43] bg-[#0f1a2b] transition hover:-translate-y-0.5 hover:border-[#2d4f7d] hover:bg-[#122038]"
    >
      <div className="relative h-24 overflow-hidden sm:h-28">
        <img
          src={image || 'https://picsum.photos/640/480?grayscale&blur=1'}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {resolvedStatus && (
          <div className="absolute left-2 top-2">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-white">{title}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
          <span className="truncate">{meta}</span>
          <span className="shrink-0 font-bold text-red-400">{price}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>{note || 'Отвори'}</span>
          <span className="text-slate-600">›</span>
        </div>
      </div>
    </Link>
  );
}

function OwnerAdCard({
  productId,
  title,
  meta,
  price,
  image,
  images,
  href,
  note,
  status,
  sellerName,
  description,
  createdAt,
  views,
  messageCount,
  location,
  category,
  subcategory,
  condition,
  delivery,
  phone,
  email,
  contactPreference,
  negotiable,
  onRefresh,
  onEdit,
  onDelete,
  onPromote,
}: {
  productId?: number;
  title: string;
  meta: string;
  price: string;
  image?: string | null;
  images?: string[];
  href: string;
  note?: string;
  status?: string;
  sellerName?: string;
  description?: string;
  createdAt?: string;
  views?: number;
  messageCount?: number;
  location?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  delivery?: string;
  phone?: string;
  email?: string;
  contactPreference?: string;
  negotiable?: boolean;
  onRefresh: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPromote: () => void;
}) {
  const { dark } = useTheme();
  const statusStyles: Record<string, string> = {
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    rejected: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    sold: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  };

  const statusLabels: Record<string, string> = {
    active: 'Активен',
    pending: 'Во преглед',
    rejected: 'Одбиен',
    sold: 'Продаден',
  };

  const resolvedStatus = status || null;
  const statusClass = resolvedStatus ? statusStyles[resolvedStatus] || statusStyles.active : '';
  const statusLabel = resolvedStatus ? statusLabels[resolvedStatus] || statusLabels.active : '';
  const galleryImages = (images || []).filter(Boolean);
  const mainImage = galleryImages[0] || image || 'https://picsum.photos/640/480?grayscale&blur=1';
  const thumbImages = [mainImage, ...galleryImages.slice(1, 4)];
  const savedCount = 0;
  const promoClicks = 0;

  return (
    <div
      className={`w-full overflow-hidden rounded-[18px] border shadow-[0_12px_24px_rgba(0,0,0,0.2)] ${
        dark
          ? 'force-dark-card force-dark-gradient border-[#1d2c43] bg-[linear-gradient(135deg,#081120_0%,#0c182b_56%,#091423_100%)]'
          : 'border-slate-600 bg-white shadow-slate-300/40'
      }`}
    >
      <div className="grid gap-0 xl:grid-cols-[268px_minmax(0,1fr)_286px]">
          <div className={`border-b p-3.5 xl:border-b-0 xl:border-r ${dark ? 'border-[#223653]' : 'border-slate-500'}`}>
          <Link href={href} className="group block">
              <div className={`relative h-[186px] overflow-hidden rounded-[14px] border sm:h-[196px] xl:h-[208px] ${dark ? 'force-dark-pill border-[#223653] bg-[#0b1727]' : 'border-slate-500 bg-slate-100'}`}>
              <img
                src={mainImage}
                alt={title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {resolvedStatus && (
                <div className="absolute left-2 top-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
              )}
            </div>
          </Link>

          <div className="mt-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }).map((_, index) => {
                const thumb = thumbImages[index];
                return (
                  <div
                    key={`${title}-thumb-${index}`}
                    className={`h-11 overflow-hidden rounded-[10px] border ${
                      thumb
                        ? index === 0
                          ? dark
                            ? 'force-dark-pill border-sky-500/60 bg-[#0b1727]'
                            : 'border-sky-500 bg-white'
                          : dark
                            ? 'force-dark-pill border-[#223653] bg-[#0b1727]'
                            : 'border-slate-500 bg-white'
                        : dark
                          ? 'force-dark-subtle border-dashed border-[#30435f] bg-[#081223]'
                          : 'border-dashed border-slate-600 bg-slate-50'
                    }`}
                  >
                    {thumb ? (
                      <img src={thumb} alt={`${title} ${index + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center text-[28px] leading-none ${dark ? 'text-slate-500' : 'text-slate-400'}`}>+</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`min-w-0 p-3.5 pb-2 xl:border-r xl:p-4 xl:pb-2.5 ${dark ? 'xl:border-[#223653]' : 'xl:border-slate-500'}`}>
          <div className="flex h-full flex-col gap-0">
            <div className="flex flex-wrap items-start justify-between gap-2.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-[8px] border px-3 py-1 text-[12px] font-medium ${dark ? 'force-dark-pill border-[#28415f] bg-[#0d1b2f] !text-slate-200' : 'border-slate-500 bg-slate-50 text-slate-900'}`}>
                  {sellerName || 'Продавач'}
                </span>
                <Link href={href} className="min-w-0">
                  <p className={`line-clamp-2 text-[22px] font-black tracking-[-0.03em] transition ${dark ? '!text-white hover:!text-sky-300' : 'text-slate-900 hover:text-sky-600'}`}>
                    {title}
                  </p>
                </Link>
              </div>
              {typeof productId === 'number' && (
                <span className={`inline-flex shrink-0 items-center rounded-[8px] border px-3 py-1 text-[11px] font-semibold ${dark ? 'force-dark-subtle border-[#223653] bg-[#081223] !text-slate-300' : 'border-slate-500 bg-slate-50 text-slate-900'}`}>
                  ID: KP-{String(productId).padStart(5, '0')}
                </span>
              )}
            </div>

            <div className={`mt-3 flex flex-wrap items-center gap-3 text-[12px] ${dark ? '!text-slate-300' : 'text-slate-500'}`}>
              <span className="inline-flex items-center gap-2">
                <MapPin className={`h-4 w-4 ${dark ? '!text-slate-400' : 'text-slate-400'}`} />
                {location || meta}
              </span>
              <span className={dark ? '!text-slate-500' : 'text-slate-300'}>•</span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className={`h-4 w-4 ${dark ? '!text-slate-400' : 'text-slate-400'}`} />
                {formatDate(createdAt)}
              </span>
            </div>

            <p className={`mt-3 line-clamp-2 max-w-3xl text-[13px] leading-5 ${dark ? '!text-slate-300' : 'text-slate-700'}`}>
              {description || 'Нема внесен опис за овој оглас.'}
            </p>

            <div className={`mt-auto -translate-y-1 border-t pt-1.5 ${dark ? 'border-[#223653]' : 'border-slate-500'}`}>
              <div className="flex items-center gap-2 overflow-x-auto xl:overflow-visible">
                <button
                  type="button"
                  onClick={onEdit}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-semibold transition ${dark ? 'force-dark-pill border-[#2b3f5f] bg-[#0b1727] text-slate-100 hover:bg-[#122038] hover:text-white' : 'border-slate-600 bg-white text-slate-900 hover:bg-slate-50 hover:text-black'}`}
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Измени
                </button>
                <button
                  type="button"
                  onClick={onRefresh}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-semibold transition ${dark ? 'border-sky-500/35 bg-sky-500/10 text-sky-300 hover:bg-sky-500/15' : 'border-sky-600 bg-sky-100 text-sky-900 hover:bg-sky-200'}`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Обнови
                </button>
                <button
                  type="button"
                  onClick={onPromote}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-semibold transition ${dark ? 'border-amber-500/35 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15' : 'border-amber-600 bg-amber-100 text-amber-900 hover:bg-amber-200'}`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Промовирај
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-semibold transition ${dark ? 'border-rose-500/35 bg-rose-500/10 text-rose-300 hover:bg-rose-500/15' : 'border-rose-600 bg-rose-100 text-rose-900 hover:bg-rose-200'}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Избриши
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3.5 pb-2 xl:p-4 xl:pb-2.5">
          <div className={`flex items-start justify-between gap-3 border-b pb-2 ${dark ? 'border-[#223653]' : 'border-slate-500'}`}>
            <p className="text-[25px] font-black tracking-[-0.03em] text-red-400">{price}</p>
            <span
              className={`inline-flex items-center gap-2 rounded-[12px] border px-3 py-1.5 text-[11px] font-semibold ${
                dark
                  ? statusClass || 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : resolvedStatus === 'active' || !resolvedStatus
                    ? 'border-emerald-800 bg-emerald-300 text-emerald-950'
                    : resolvedStatus === 'pending'
                      ? 'border-amber-700 bg-amber-200 text-amber-950'
                      : resolvedStatus === 'rejected'
                        ? 'border-rose-700 bg-rose-200 text-rose-950'
                        : 'border-slate-700 bg-slate-300 text-slate-950'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-current opacity-90" />
              {resolvedStatus ? statusLabel : 'Активен'}
            </span>
          </div>

          <div className={`rounded-[16px] border p-3 ${dark ? 'force-dark-panel border-[#223653] bg-[#0a1628] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]' : 'border-slate-500 bg-slate-50'}`}>
            <p className={`text-[15px] font-bold ${dark ? '!text-white' : 'text-slate-900'}`}>Статистика за огласот</p>

            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-[13px] ${dark ? '!text-slate-300' : 'text-slate-600'}`}>
                  <Eye className={`h-4 w-4 ${dark ? '!text-slate-400' : 'text-slate-400'}`} />
                  Прегледи
                </span>
                <span className={`text-[14px] font-bold ${dark ? '!text-white' : 'text-slate-900'}`}>{Number((views || 0)).toLocaleString('mk-MK')}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-[13px] ${dark ? '!text-slate-300' : 'text-slate-600'}`}>
                  <MessageSquare className={`h-4 w-4 ${dark ? '!text-slate-400' : 'text-slate-400'}`} />
                  Пораки
                </span>
                <span className={`text-[14px] font-bold ${dark ? '!text-white' : 'text-slate-900'}`}>{Number((messageCount || 0)).toLocaleString('mk-MK')}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-[13px] ${dark ? '!text-slate-300' : 'text-slate-600'}`}>
                  <Heart className={`h-4 w-4 ${dark ? '!text-slate-400' : 'text-slate-400'}`} />
                  Зачувувања
                </span>
                <span className={`text-[14px] font-bold ${dark ? '!text-white' : 'text-slate-900'}`}>{savedCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-2 text-[13px] ${dark ? '!text-slate-300' : 'text-slate-600'}`}>
                  <ArrowRight className={`h-4 w-4 ${dark ? '!text-slate-400' : 'text-slate-400'}`} />
                  Промо кликови
                </span>
                <span className={`text-[14px] font-bold ${dark ? '!text-white' : 'text-slate-900'}`}>{promoClicks}</span>
              </div>
            </div>

            <button
              type="button"
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[12px] border px-4 py-2 text-[12px] font-semibold transition ${dark ? 'border-sky-500/35 bg-sky-500/10 text-sky-300 hover:bg-sky-500/15' : 'border-sky-600 bg-white text-sky-800 hover:bg-sky-50'}`}
            >
              <Inbox className="h-4 w-4" />
              Детална статистика
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#081223] px-3.5 py-2.5">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  icon: ElementType;
  accent: string;
}) {
  const { dark } = useTheme();
  return (
      <div className={`rounded-[14px] border px-3 py-2.5 sm:px-3.5 ${dark ? 'force-dark-subtle border-[#223653] bg-[#081223]' : 'border-slate-500 bg-white shadow-sm'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] sm:text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{label}</span>
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
      </div>
      <p className={`mt-0.5 text-[18px] font-black leading-none sm:text-[22px] ${dark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  const { dark } = useTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition sm:px-4 ${
        active
          ? 'border border-red-700 bg-red-600 text-white shadow-lg shadow-red-600/20'
          : dark
            ? 'border border-[#223653] bg-[#081223] text-slate-300 hover:bg-[#122038] hover:text-white'
            : 'border border-slate-500 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      {children}
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { dark } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageFilter, setMessageFilter] = useState<'all' | 'received' | 'sent'>('all');
  const [sellingOrders, setSellingOrders] = useState<SellingOrder[]>([]);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('ads');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (requestedTab === 'ads' || requestedTab === 'saved' || requestedTab === 'settings' || requestedTab === 'messages') {
      setActiveTab(requestedTab);
    }
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id) {
      window.location.href = '/auth';
      return;
    }

    setUser(userData);
    setAvatarUrl(userData.avatar_url || null);
    setRecentViews(readRecentViews());

    const load = async () => {
      try {
        const [adsRes, favRes, msgRes, salesRes, balanceRes] = await Promise.all([
          fetch(`/api/products?seller_id=${userData.id}&all=1`),
          fetch(`/api/favorites?user_id=${userData.id}`),
          fetch(`/api/messages?user_id=${userData.id}`),
          fetch(`/api/orders?user_id=${userData.id}&type=selling`),
          fetch(`/api/user/balance?user_id=${userData.id}`),
        ]);

        const [adsData, favData, msgData, salesData, balanceData] = await Promise.all([
          adsRes.json(),
          favRes.json(),
          msgRes.json(),
          salesRes.json(),
          balanceRes.json(),
        ]);

        setMyProducts(Array.isArray(adsData?.products) ? adsData.products : []);
        setFavorites(Array.isArray(favData) ? favData : []);
        setMessages(Array.isArray(msgData) ? msgData : []);
        setSellingOrders(Array.isArray(salesData) ? salesData : []);
        if (balanceData && !balanceData.error) setBalanceInfo(balanceData as BalanceInfo);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const refreshRecentViews = () => setRecentViews(readRecentViews());
    window.addEventListener('storage', refreshRecentViews);
    window.addEventListener('focus', refreshRecentViews);
    return () => {
      window.removeEventListener('storage', refreshRecentViews);
      window.removeEventListener('focus', refreshRecentViews);
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'messages' || !user?.id) return;
    fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: user.id }),
    }).catch(() => {});
  }, [activeTab, user?.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 500_000) { alert('Сликата е преголема (макс 500KB)'); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      try {
        const res = await fetch('/api/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, image_data: dataUrl }),
        });
        const result = await res.json();
        if (res.ok) {
          setAvatarUrl(dataUrl);
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          stored.avatar_url = dataUrl;
          localStorage.setItem('user', JSON.stringify(stored));
        } else {
          alert(result.error || 'Грешка при поставување слика');
        }
      } catch {
        alert('Грешка при поставување слика');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const unreadMessages = useMemo(
    () => messages.filter((message) => !message.read && message.receiver_id === user?.id).length,
    [messages, user?.id],
  );

  const activeAds = useMemo(
    () => myProducts.filter((product) => product.status === 'active').length,
    [myProducts],
  );

  const soldAds = useMemo(
    () => sellingOrders.filter((order) => order.status && order.status !== 'pending').length,
    [sellingOrders],
  );

  const locationLabel = user?.location || 'Цела Македонија';
  const joinedLabel = user?.created_at
    ? formatDate(user.created_at, { month: 'long', year: 'numeric' })
    : 'Не е внесен';

  const recentViewsByDay = useMemo(() => {
    const labels = ['Нед', 'Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб'];
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: toDateKey(date),
        label: labels[date.getDay()],
        count: 0,
      };
    });

    const byKey = new Map(days.map((day) => [day.key, day]));
    recentViews.forEach((view) => {
      const viewedDate = new Date(view.viewedAt);
      if (Number.isNaN(viewedDate.getTime())) return;
      const key = toDateKey(viewedDate);
      const target = byKey.get(key);
      if (target) target.count += 1;
    });

    return days;
  }, [recentViews]);

  const maxRecentViews = Math.max(...recentViewsByDay.map((day) => day.count), 1);

  const sortedMyProducts = useMemo(
    () =>
      [...myProducts].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      ),
    [myProducts],
  );

  const messageCountsByProduct = useMemo(() => {
    return messages.reduce<Record<number, number>>((acc, message) => {
      if (typeof message.product_id === 'number') {
        acc[message.product_id] = (acc[message.product_id] || 0) + 1;
      }
      return acc;
    }, {});
  }, [messages]);

  const refreshProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bump', seller_id: user?.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Не успеа обновувањето.');
      }

      const now = new Date().toISOString();
      setMyProducts((prev) =>
        prev
          .map((product) =>
            product.id === productId ? { ...product, created_at: now, status: 'active' } : product,
          )
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
      );

      const balanceRes = await fetch(`/api/user/balance?user_id=${user?.id}`);
      const balanceData = await balanceRes.json();
      if (balanceData && !balanceData.error) setBalanceInfo(balanceData as BalanceInfo);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Не успеа обновувањето на огласот.';
      window.alert(message);
    }
  };

  const deleteProduct = async (productId: number) => {
    const confirmed = window.confirm('Сигурен ли си дека сакаш да го избришеш огласот?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${productId}?seller_id=${user?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Не успеа бришењето.');
      }

      setMyProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error(error);
      window.alert('Не успеа бришењето на огласот.');
    }
  };

  const editProduct = (productId: number) => {
    router.push(`/sell?edit=${productId}`);
  };

  const promoteProduct = (productId: number) => {
    router.push(`/sell?promote=${productId}`);
  };

  const tabs: Array<{ id: TabKey; label: string }> = [
    { id: 'ads', label: 'Мои огласи' },
    { id: 'saved', label: 'Зачувани' },
    { id: 'settings', label: 'Уреди профил' },
    { id: 'messages', label: 'Пораки' },
  ];

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  if (loading || !user) {
    return (
      <div className={dark ? 'min-h-screen bg-[#040914] text-white' : 'min-h-screen bg-slate-100 text-slate-900'}>
        <Header />
        <Container className="py-12">
          <div className={`rounded-3xl border py-16 text-center ${dark ? 'border-[#1d2c43] bg-[#0b1423] text-slate-400' : 'border-slate-200 bg-white text-slate-600 shadow-sm'}`}>
            Вчитување профил...
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={dark ? 'min-h-screen bg-[#040914] text-white' : 'min-h-screen bg-slate-100 text-slate-900'}>
      <Header />
      <Container className="py-3 md:py-4">
        <div className="mx-auto max-w-6xl space-y-3">
          <section className={`overflow-hidden rounded-[18px] border shadow-xl ${dark ? 'force-dark-card border-[#1d2c43] bg-gradient-to-br from-[#081223] via-[#0b1423] to-[#07101c] shadow-black/20' : 'border-slate-600 bg-white shadow-slate-300/40'}`}>
            <div className="grid gap-2 p-2.5 sm:p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:items-start">
              <div className="min-w-0">
                <div className="flex min-w-0 gap-3.5">
                  <div className="relative shrink-0">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border sm:h-16 sm:w-16 ${dark ? 'border-[#223653] bg-[#0b1727]' : 'border-slate-500 bg-white shadow-sm'} overflow-hidden`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <UserCircle2 className={`h-8 w-8 sm:h-9 sm:w-9 ${dark ? 'text-slate-300' : 'text-slate-900'}`} />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border sm:h-6 sm:w-6 ${dark ? 'border-[#223653] bg-[#0b1727] text-sky-400 hover:bg-[#1a2a3e]' : 'border-slate-400 bg-white text-sky-700 hover:bg-slate-100'} shadow-md transition-colors`}
                      title="Постави слика"
                    >
                      <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>

                  <div className="min-w-0 flex-1 pl-1 sm:pl-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className={`truncate text-[18px] font-black tracking-tight sm:text-[25px] ${dark ? '!text-white' : 'text-slate-950'}`}>{user.name}</h1>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${dark ? 'border-sky-500/30 bg-sky-500/10 text-sky-300' : 'border-sky-700 bg-sky-100 text-sky-900'}`}>
                        <PenSquare className="h-3.5 w-3.5" />
                        Активни огласи {activeAds}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${dark ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-amber-700 bg-amber-100 text-amber-900'}`}>
                        ID #{user.id}
                      </span>
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className={`text-[11px] leading-none sm:text-xs ${dark ? '!text-slate-300' : 'text-slate-800'}`}>Профил со доверба и брз пристап до твоите огласи.</span>
                    </div>

                    <p className={`mt-0.5 max-w-lg text-[12px] leading-[1.1] sm:text-[13px] sm:leading-[1.25] ${dark ? '!text-slate-300' : 'text-slate-800'}`}>
                      Управувај со огласите, следи ги зачуваните ставки и
                      <span className="block">провери ги основните податоци на едно место.</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 lg:justify-self-end">
                <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs ${dark ? 'force-dark-subtle border-[#223653] bg-[#081223] !text-slate-200' : 'border-slate-500 bg-slate-50 text-slate-900'}`}>
                    <Sparkles className={`h-3.5 w-3.5 ${dark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    {locationLabel}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs ${dark ? 'force-dark-subtle border-[#223653] bg-[#081223] !text-slate-200' : 'border-slate-500 bg-slate-50 text-slate-900'}`}>
                    <Clock3 className={`h-3.5 w-3.5 ${dark ? 'text-sky-400' : 'text-sky-700'}`} />
                    Член од {joinedLabel}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs ${dark ? 'force-dark-subtle border-[#223653] bg-[#081223] !text-slate-200' : 'border-slate-500 bg-slate-50 text-slate-900'}`}>
                    <BadgeCheck className={`h-3.5 w-3.5 ${dark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    Активен профил
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-[5px] sm:gap-1.5">
                  <StatCard label="Активни огласи" value={activeAds} icon={PenSquare} accent="text-sky-400" />
                  <StatCard label="Продадени" value={soldAds} icon={Heart} accent="text-pink-400" />
                  <StatCard label="Оценка" value={`${Number(user.rating || 5).toFixed(1)}/5`} icon={Star} accent="text-amber-400" />
                </div>
              </div>
            </div>
          </section>

          {balanceInfo && (
            <section className={`overflow-hidden rounded-[18px] border shadow-xl ${dark ? 'force-dark-card border-[#1d2c43] bg-gradient-to-br from-[#0a1628] via-[#0d1a2e] to-[#081220] shadow-black/20' : 'border-slate-600 bg-white shadow-slate-300/40'}`}>
              <div className="p-3 sm:p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-[#223653] bg-[#0b1727] p-3">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Вашата состојба</p>
                    <p className="mt-1.5 text-[22px] font-black text-emerald-400">
                      {balanceInfo.balance.toFixed(2)} <span className="text-[13px] font-semibold text-slate-400">{balanceInfo.currency}</span>
                    </p>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-slate-500">Потрошено денес:</span><span className="text-slate-300 font-medium">{balanceInfo.spent_today.toFixed(2)} {balanceInfo.currency}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Потрошено овој месец:</span><span className="text-slate-300 font-medium">{balanceInfo.spent_month.toFixed(2)} {balanceInfo.currency}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Бонуси:</span><span className="text-amber-400 font-medium">{balanceInfo.bonus_balance.toFixed(2)} {balanceInfo.currency}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#223653] bg-[#0b1727] p-3">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Статистика за обновувањето</p>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-slate-500">Денес:</span><span className="text-slate-300 font-medium">{balanceInfo.refresh_today}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Оваа недела:</span><span className="text-slate-300 font-medium">{balanceInfo.refresh_week}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Овој месец:</span><span className="text-slate-300 font-medium">{balanceInfo.refresh_month}</span></div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">За овој месец имате уште:</span>
                        <span className={`font-medium ${balanceInfo.monthly_refreshes_remaining > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {balanceInfo.monthly_refreshes_remaining} обновувања
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#223653] bg-[#0b1727] p-3">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Статистика за огласувањето</p>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-slate-500">Активни огласи:</span><span className="text-slate-300 font-medium">{balanceInfo.ads_active}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Предадени огласи овој месец:</span><span className="text-slate-300 font-medium">{balanceInfo.ads_this_month}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Предадени огласи во тековна година:</span><span className="text-slate-300 font-medium">{balanceInfo.ads_this_year}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Цена на обновување:</span><span className="text-slate-300 font-medium">{balanceInfo.refresh_cost} {balanceInfo.currency}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#223653] bg-[#0b1727] p-3 flex flex-col items-center justify-center">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Брзи дејства</p>
                    <button
                      onClick={() => window.location.href = '/sell'}
                      className="mt-2 w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                    >
                      + Нов оглас
                    </button>
                    <p className="mt-2 text-[10px] text-slate-500 text-center leading-relaxed">
                      Обновувањето чини {balanceInfo.refresh_cost} {balanceInfo.currency}.<br />
                      Лимит: {balanceInfo.monthly_refresh_limit} месечно.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className={`flex gap-1.5 overflow-x-auto rounded-[14px] border p-[5px] ${dark ? 'border-[#1d2c43] bg-[#0b1423]' : 'border-slate-700 bg-white shadow-sm'}`}>
            {tabs.map((tab) => (
              <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => changeTab(tab.id)}>
                {tab.label}
              </TabButton>
            ))}
          </div>

          {activeTab === 'ads' && (
            <section className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h2 className={`text-[17px] font-bold sm:text-xl ${dark ? 'text-white' : 'text-slate-900'}`}>Мои огласи</h2>
                    <p className={`text-[13px] sm:text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Компактна листа со активни, во преглед и архивирани огласи.</p>
                  </div>
                </div>
                <Link
                  href="/sell"
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                    dark
                      ? 'border-[#223653] bg-[#081223] text-slate-300 hover:bg-[#122038] hover:text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  Нов оглас <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {myProducts.length === 0 ? (
                <EmptyState
                  title="Немаш огласи за сега"
                  description="Објави прв оглас и ќе се појави тука веднаш штом биде активен."
                  action={
                    <Link href="/sell" className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                      Објави прв оглас
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {sortedMyProducts.slice(0, 9).map((product) => (
                    <OwnerAdCard
                      key={product.id}
                      productId={product.id}
                      href={`/products/${product.id}`}
                      title={product.title}
                      meta={`${product.location || 'Македонија'} · ${formatDate(product.created_at)}`}
                      price={`${product.price.toLocaleString()} ${product.currency || '€'}`}
                      image={product.images?.[0] || product.image_url}
                      images={product.images}
                      description={product.description}
                      createdAt={product.created_at}
                      views={product.views}
                      messageCount={messageCountsByProduct[product.id] || 0}
                      note={product.status === 'active' ? 'Активен' : product.status === 'pending' ? 'Во преглед' : product.status === 'rejected' ? 'Одбиен' : product.status || 'Оглас'}
                      status={product.status}
                      sellerName={user.name}
                      negotiable={product.negotiable}
                      onRefresh={() => refreshProduct(product.id)}
                      onEdit={() => editProduct(product.id)}
                      onDelete={() => deleteProduct(product.id)}
                      onPromote={() => promoteProduct(product.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'saved' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold sm:text-xl">Зачувани огласи</h2>
                  <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Брз пристап до огласите што ги следиш.</p>
                </div>
                <span className="shrink-0 text-sm text-slate-400">{favorites.length} ставки</span>
              </div>

              {favorites.length === 0 ? (
                <EmptyState
                  title="Немаш зачувани огласи"
                  description="Кога ќе зачуваш оглас, тој ќе се појави тука за брз пристап."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {favorites.slice(0, 9).map((product) => (
                    <MiniAdCard
                      key={product.id}
                      href={`/products/${product.id}`}
                      title={product.title}
                      meta={product.location || 'Македонија'}
                      price={`${product.price.toLocaleString()} ${product.currency || '€'}`}
                      image={product.image_url || product.images?.[0]}
                      note="Зачуван"
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="grid gap-3 lg:grid-cols-[1fr_0.95fr]">
              <Card className="border-[#1d2c43] bg-[#0b1423] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                  <h2 className="text-[17px] font-bold sm:text-xl">Основни податоци</h2>
                    <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Профил, контакт и јавен идентитет.</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300">
                    ID #{user.id}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-sm">
                  <InfoRow label="Име" value={user.name} />
                  <InfoRow label="Е-пошта" value={user.email} />
                  <InfoRow label="Телефон" value={user.phone || 'Не е внесен'} />
                  <InfoRow label="Локација" value={locationLabel} />
                  <InfoRow label="Член од" value={joinedLabel} />
                </div>
              </Card>

              <div className="space-y-3">
                <Card className="!rounded-[16px] border-[#1d2c43] bg-[#0b1423] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-bold text-white sm:text-base">Безбедност</h3>
                      <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Клучните индикатори за сметката.</p>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>

                  <div className="mt-4 space-y-2.5 text-sm text-slate-300">
                    <InfoRow
                      label="Лозинка"
                      value={
                        <span className="inline-flex items-center gap-1 font-medium text-white">
                          <Inbox className="h-4 w-4 text-sky-400" />
                          Заштитена
                        </span>
                      }
                    />
                    <InfoRow
                      label="Профил"
                      value={
                        <span className="inline-flex items-center gap-1 font-medium text-white">
                          <BadgeCheck className="h-4 w-4 text-emerald-400" />
                          Активен
                        </span>
                      }
                    />
                    <InfoRow label="Оценка" value={`${Number(user.rating || 5).toFixed(1)}/5`} />
                    <div className="rounded-xl border border-[#223653] bg-[#0b1727] px-4 py-2.5 text-xs leading-5 text-slate-400">
                      Следниот чекор може да биде уредување на профил и промена на лозинка.
                    </div>
                  </div>
                </Card>

                <Card className="!rounded-[16px] border-[#1d2c43] bg-[#0b1423] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[15px] font-bold text-white sm:text-base">Гледани огласи</h3>
                      <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Последни 7 дена.</p>
                    </div>
                    <Clock3 className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="mt-4 space-y-2">
                    {recentViewsByDay.map((day) => {
                      const width = `${Math.max((day.count / maxRecentViews) * 100, day.count > 0 ? 18 : 8)}%`;
                      return (
                        <div key={day.key} className="flex items-center gap-2">
                          <span className="w-7 shrink-0 text-[11px] text-slate-400">{day.label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#081223]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                              style={{ width }}
                            />
                          </div>
                          <span className="w-4 shrink-0 text-right text-[11px] text-slate-300">{day.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

              </div>
            </section>
          )}

          {activeTab === 'messages' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold sm:text-xl">Пораки</h2>
                  <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Преглед на сите разговори поврзани со твоите огласи.</p>
                </div>
                <span className="shrink-0 text-sm text-slate-400">{messages.length} разговори</span>
              </div>

              <div className="flex gap-2">
                {(['all', 'received', 'sent'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setMessageFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      messageFilter === f
                        ? 'bg-red-600 text-white'
                        : 'border border-[#223653] bg-[#0b1727] text-slate-300 hover:bg-[#14243a]'
                    }`}
                  >
                    {f === 'all' ? 'Сите' : f === 'received' ? 'Примени' : 'Пратени'}
                  </button>
                ))}
              </div>

              {messages.length === 0 ? (
                <EmptyState
                  title="Немаш пораки"
                  description="Кога некој ќе ти пише за оглас, пораката ќе се појави тука."
                />
              ) : (
                <div className="space-y-2.5">
                  {messages.filter((m) => {
                    if (messageFilter === 'received') return m.receiver_id === user?.id && m.sender_id !== user?.id;
                    if (messageFilter === 'sent') return m.sender_id === user?.id;
                    return true;
                  }).map((message) => (
                    <div
                      key={message.id}
                      className="rounded-[16px] border border-[#1d2c43] bg-[#0b1423] px-4 py-3 transition hover:border-[#2d4f7d] hover:bg-[#10203a]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">
                              {message.sender_id === user?.id ? 'до ' + (message.receiver_name || 'непознат') : 'од ' + (message.sender_name || 'непознат')}
                            </p>
                            {!message.read ? (
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-[10px] text-red-400">Непрочитана</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-[10px] text-green-400">Прочитана</span>
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-400">{message.product_title}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-500">{formatDate(message.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
