'use client';

type FavoriteSnapshot = {
  userId: number;
  ids: number[];
};

const STORAGE_KEY = 'favorite_product_ids';
const EVENT_NAME = 'favorites-updated';

let favoriteCache: FavoriteSnapshot | null = null;
let loadingPromise: Promise<number[]> | null = null;

function readStorage(): FavoriteSnapshot | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.userId !== 'number' || !Array.isArray(parsed.ids)) return null;
    return {
      userId: parsed.userId,
      ids: parsed.ids.filter((id: unknown): id is number => typeof id === 'number'),
    };
  } catch {
    return null;
  }
}

function writeStorage(snapshot: FavoriteSnapshot) {
  if (typeof window === 'undefined') return;
  favoriteCache = snapshot;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function emitFavoriteUpdate(productId: number, saved: boolean) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { productId, saved },
    }),
  );
}

export function subscribeToFavoriteUpdates(callback: (productId: number, saved: boolean) => void) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ productId: number; saved: boolean }>;
    callback(customEvent.detail.productId, customEvent.detail.saved);
  };

  window.addEventListener(EVENT_NAME, handler as EventListener);
  return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
}

export function getStoredFavoriteIds(userId: number) {
  const snapshot = favoriteCache && favoriteCache.userId === userId ? favoriteCache : readStorage();
  if (!snapshot || snapshot.userId !== userId) return [];
  favoriteCache = snapshot;
  return snapshot.ids;
}

export async function loadFavoriteIds(userId: number): Promise<number[]> {
  const stored = getStoredFavoriteIds(userId);
  if (stored.length > 0) return stored;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch(`/api/favorites?user_id=${userId}`, { cache: 'no-store' })
    .then(async (response) => {
      if (!response.ok) return [];
      const data = await response.json();
      const ids = Array.isArray(data)
        ? data
            .map((item: any) => Number(item.product_id || item.id))
            .filter((value: number) => Number.isFinite(value))
        : [];
      writeStorage({ userId, ids });
      return ids;
    })
    .catch(() => [])
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
}

export async function toggleFavorite(userId: number, productId: number) {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, product_id: productId }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || 'Не успеа зачувувањето.');
  }

  const saved = response.status === 201;
  const current = new Set(getStoredFavoriteIds(userId));

  if (saved) {
    current.add(productId);
  } else {
    current.delete(productId);
  }

  writeStorage({ userId, ids: Array.from(current) });
  emitFavoriteUpdate(productId, saved);

  return saved;
}
