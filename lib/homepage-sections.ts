type HomepageSectionRecord = {
  section_key: string;
  data: string;
};

export type HomepageTrustItem = {
  icon: 'shield-check' | 'badge-check' | 'zap' | 'users';
  color: string;
  title: string;
  subtitle: string;
};

export type HomepageSections = {
  headerCategorySlugs: string[];
  trustItems: HomepageTrustItem[];
  homeCategorySlugs: string[];
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSections = {
  headerCategorySlugs: [
    'motorni-vozila',
    'nedviznosti',
    'dom-gradina',
    'moda-obleka',
    'mobilni-telefoni',
  ],
  trustItems: [
    { icon: 'shield-check', color: 'text-blue-400', title: 'Безбедно купување', subtitle: 'Проверени продавачи' },
    { icon: 'badge-check', color: 'text-emerald-400', title: '100% Бесплатно', subtitle: 'Објави оглас без надомест' },
    { icon: 'zap', color: 'text-amber-400', title: 'Брзо и лесно', subtitle: 'Само неколку клика' },
    { icon: 'users', color: 'text-pink-400', title: '10,000+ активни', subtitle: 'Купувачи секој ден' },
  ],
  homeCategorySlugs: [
    'motorni-vozila',
    'nedviznosti',
    'dom-gradina',
    'moda-obleka',
    'mobilni-telefoni',
    'kompjuteri',
  ],
};

function parseSectionData<T>(row: HomepageSectionRecord | undefined, fallback: T): T {
  if (!row?.data) return fallback;
  try {
    return JSON.parse(row.data) as T;
  } catch {
    return fallback;
  }
}

export function seedHomepageSections(database: any) {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO homepage_sections (section_key, data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);

  insert.run('header_category_strip', JSON.stringify({ categorySlugs: DEFAULT_HOMEPAGE_SECTIONS.headerCategorySlugs }));
  insert.run('trust_bar', JSON.stringify({ items: DEFAULT_HOMEPAGE_SECTIONS.trustItems }));
  insert.run('home_category_strip', JSON.stringify({ categorySlugs: DEFAULT_HOMEPAGE_SECTIONS.homeCategorySlugs }));
}

export function getHomepageSections(database: any): HomepageSections {
  const rows = database.prepare(`
    SELECT section_key, data
    FROM homepage_sections
    WHERE section_key IN ('header_category_strip', 'trust_bar', 'home_category_strip')
  `).all() as HomepageSectionRecord[];

  const byKey = new Map(rows.map((row) => [row.section_key, row]));

  const headerData = parseSectionData<{ categorySlugs?: string[] }>(
    byKey.get('header_category_strip'),
    { categorySlugs: DEFAULT_HOMEPAGE_SECTIONS.headerCategorySlugs },
  );
  const trustData = parseSectionData<{ items?: HomepageTrustItem[] }>(
    byKey.get('trust_bar'),
    { items: DEFAULT_HOMEPAGE_SECTIONS.trustItems },
  );
  const homeData = parseSectionData<{ categorySlugs?: string[] }>(
    byKey.get('home_category_strip'),
    { categorySlugs: DEFAULT_HOMEPAGE_SECTIONS.homeCategorySlugs },
  );

  return {
    headerCategorySlugs: Array.isArray(headerData.categorySlugs) && headerData.categorySlugs.length
      ? headerData.categorySlugs
      : DEFAULT_HOMEPAGE_SECTIONS.headerCategorySlugs,
    trustItems: Array.isArray(trustData.items) && trustData.items.length
      ? trustData.items
      : DEFAULT_HOMEPAGE_SECTIONS.trustItems,
    homeCategorySlugs: Array.isArray(homeData.categorySlugs) && homeData.categorySlugs.length
      ? homeData.categorySlugs
      : DEFAULT_HOMEPAGE_SECTIONS.homeCategorySlugs,
  };
}
