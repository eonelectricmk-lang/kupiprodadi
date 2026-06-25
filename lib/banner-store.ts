type BannerRecord = {
  image_url: string;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  link_url?: string | null;
  sort_order: number;
  is_active?: number;
};

export const DEFAULT_BANNERS: BannerRecord[] = [
  {
    image_url: '/banners/brand-banner.jpg',
    eyebrow: null,
    title: null,
    subtitle: null,
    link_url: null,
    sort_order: 0,
    is_active: 1,
  },
  {
    image_url: '/banners/banner-mobile.jpg',
    eyebrow: null,
    title: null,
    subtitle: null,
    link_url: '/products?category=mobilni-telefoni',
    sort_order: 1,
    is_active: 1,
  },
  {
    image_url: '/banners/banner-realestate.jpg',
    eyebrow: null,
    title: null,
    subtitle: null,
    link_url: '/products?category=nedviznosti',
    sort_order: 2,
    is_active: 1,
  },
  {
    image_url: '/banners/banner-auto.jpg',
    eyebrow: null,
    title: null,
    subtitle: null,
    link_url: '/products?category=motorni-vozila',
    sort_order: 3,
    is_active: 1,
  },
];

export function seedDefaultBanners(database: any) {
  const row = database.prepare('SELECT COUNT(*) as count FROM banners').get() as { count: number };
  if (row.count > 0) return;

  const insert = database.prepare(`
    INSERT INTO banners (image_url, eyebrow, title, subtitle, link_url, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = database.transaction(() => {
    DEFAULT_BANNERS.forEach((banner) => {
      insert.run(
        banner.image_url,
        banner.eyebrow || null,
        banner.title || null,
        banner.subtitle || null,
        banner.link_url || null,
        banner.sort_order,
        banner.is_active ?? 1,
      );
    });
  });

  transaction();
}

export function getActiveBanners(database: any) {
  return database.prepare(`
    SELECT id, image_url, eyebrow, title, subtitle, link_url, sort_order
    FROM banners
    WHERE is_active = 1
    ORDER BY sort_order ASC, id ASC
  `).all();
}
