'use client';

import { useEffect, useState } from 'react';
import { Heart, MapPin, ShieldCheck } from 'lucide-react';
import { loadFavoriteIds, subscribeToFavoriteUpdates, toggleFavorite } from '@/lib/client-favorites';

interface AdCardItem {
  id: number;
  title: string;
  price: number;
  description?: string;
  postedAt?: string;
  currency?: string;
  image?: string;
  image_url?: string;
  location?: string;
  isVerified?: boolean;
  verified?: boolean;
  badge?: string | null;
}

interface AdCardProps {
  ad?: AdCardItem;
  layout?: 'grid' | 'list';
  id?: number;
  title?: string;
  price?: number;
  description?: string;
  postedAt?: string;
  currency?: string;
  image?: string;
  image_url?: string;
  location?: string;
  verified?: boolean;
  isVerified?: boolean;
  badge?: string | null;
}

const FALLBACK_IMAGE = 'https://picsum.photos/640/480?grayscale&blur=1';

export function AdCard({
  ad,
  layout = 'grid',
  id,
  title,
  price,
  description,
  postedAt,
  currency,
  image,
  image_url,
  location,
  verified,
  isVerified,
  badge,
}: AdCardProps) {
  const card = ad || {
    id: id || 0,
    title: title || 'Оглас',
    price: price || 0,
    description,
    postedAt,
    currency,
    image,
    image_url,
    location,
    verified,
    isVerified,
    badge,
  };

  const resolvedImage = card.image || card.image_url || FALLBACK_IMAGE;
  const resolvedVerified = card.isVerified ?? card.verified ?? false;
  const postedLabel = card.postedAt || 'Денес 22:43';
  const [imageSrc, setImageSrc] = useState(resolvedImage);
  const [isSaved, setIsSaved] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    setImageSrc(resolvedImage);
  }, [resolvedImage]);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem('user') || '{}') : {};
    const userId = Number(storedUser?.id || 0);
    if (!userId || !card.id) return;

    loadFavoriteIds(userId).then((ids) => {
      setIsSaved(ids.includes(card.id));
    });

    return subscribeToFavoriteUpdates((productId, saved) => {
      if (productId === card.id) {
        setIsSaved(saved);
      }
    });
  }, [card.id]);

  const onToggleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const storedUser = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem('user') || '{}') : {};
    const userId = Number(storedUser?.id || 0);

    if (!userId) {
      window.location.href = '/auth';
      return;
    }

    if (!card.id || togglingFavorite) return;

    try {
      setTogglingFavorite(true);
      const saved = await toggleFavorite(userId, card.id);
      setIsSaved(saved);
    } catch (error) {
      console.error(error);
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (layout === 'list') {
    return (
      <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f1a2b] transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-950/20">
        <div className="flex gap-3 p-3">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0a1322] sm:h-32 sm:w-32">
            <img
              src={imageSrc}
              alt={card.title}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
              onError={() => setImageSrc(FALLBACK_IMAGE)}
            />
            {card.badge && (
              <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {card.badge}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-base font-semibold leading-[1.2] text-white">{card.title}</h3>
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`shrink-0 rounded-full p-1.5 transition ${
                  isSaved
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    : 'bg-black/35 text-gray-100 hover:bg-black/50'
                }`}
                aria-label={isSaved ? 'Отстрани од зачувани' : 'Зачувај оглас'}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {card.location || 'Македонија'}
              </span>
              <span className="ml-auto text-slate-400">ID: KP-{card.id.toString().padStart(6, '0')}</span>
            </p>

            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">
              {card.description || 'Краток преглед на огласот со повеќе детали, состојба и клучни информации.'}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xl font-bold leading-none text-red-500">{card.price.toLocaleString()} <span className="text-white">{card.currency || '€'}</span></p>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-medium text-slate-400">Објавен: {postedLabel}</p>
                {resolvedVerified && (
                  <span title="Проверен продавач" className="inline-flex items-center text-green-400">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f1a2b] transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/20">
      <div className="relative h-36 overflow-hidden">
        <img
          src={imageSrc}
          alt={card.title}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
        />
        {card.badge && (
          <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white">
            {card.badge}
          </span>
        )}
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute right-3 top-3 rounded-full p-1.5 transition ${
            isSaved
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
              : 'bg-black/35 text-gray-100 hover:bg-black/50'
          }`}
          aria-label={isSaved ? 'Отстрани од зачувани' : 'Зачувај оглас'}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex h-[98px] flex-col px-3 pb-3 pt-2.5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {card.location || 'Македонија'}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-slate-400">ID: KP-{card.id.toString().padStart(6, '0')}</span>
            {resolvedVerified && (
              <span title="Проверен продавач" className="inline-flex shrink-0 items-center text-green-400">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
        <h3 className="line-clamp-2 min-h-[34px] text-[15px] font-semibold leading-[1.2] text-white">{card.title}</h3>
        <div className="mt-auto flex items-end justify-between gap-1 pt-0">
          <p className="whitespace-nowrap text-base font-bold leading-none text-red-500">{card.price.toLocaleString()} <span className="text-white">{card.currency || '€'}</span></p>
          <div className="flex shrink-0 items-center gap-1">
            <p className="text-[10px] text-slate-500">{postedLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdCard;
