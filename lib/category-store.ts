import { CATEGORIES, type Category, type Subcategory } from '@/lib/categories';
import { CATEGORY_SLUG_ALIASES } from '@/lib/category-aliases';

type DbCategoryRow = {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_active: number;
};

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcategories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

export function seedDefaultCategories(database: any) {
  const count = database.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (count.count > 0) return;

  const insert = database.prepare(`
    INSERT INTO categories (parent_id, name, slug, icon, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = database.transaction(() => {
    CATEGORIES.forEach((category: Category, categoryIndex: number) => {
      const parent = insert.run(null, category.name, category.slug, category.icon, categoryIndex, 1);
      const parentId = Number(parent.lastInsertRowid);
      category.subcategories.forEach((subcategory: Subcategory, subIndex: number) => {
        insert.run(parentId, subcategory.name, subcategory.slug, null, subIndex, 1);
      });
    });
  });

  transaction();
}

export function migrateCategorySlugs(database: any) {
  const updateCategorySlug = database.prepare('UPDATE categories SET slug = ? WHERE slug = ?');
  const updateProductCategory = database.prepare('UPDATE products SET category = ? WHERE category = ?');
  const updateProductSubcategory = database.prepare('UPDATE products SET subcategory = ? WHERE subcategory = ?');
  const updateBannerLinks = database.prepare('UPDATE banners SET link_url = REPLACE(link_url, ?, ?) WHERE link_url LIKE ?');

  const transaction = database.transaction(() => {
    Object.entries(CATEGORY_SLUG_ALIASES).forEach(([legacySlug, canonicalSlug]) => {
      if (!legacySlug || !canonicalSlug || legacySlug === canonicalSlug) {
        return;
      }

      updateCategorySlug.run(canonicalSlug, legacySlug);
      updateProductCategory.run(canonicalSlug, legacySlug);
      updateProductSubcategory.run(canonicalSlug, legacySlug);
      updateBannerLinks.run(legacySlug, canonicalSlug, `%${legacySlug}%`);
    });
  });

  transaction();
}

export function getCategoryTree(database: any, includeInactive = false): CategoryNode[] {
  const rows = database.prepare(`
    SELECT id, parent_id, name, slug, icon, sort_order, is_active
    FROM categories
    ${includeInactive ? '' : 'WHERE is_active = 1'}
    ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, sort_order ASC, id ASC
  `).all() as DbCategoryRow[];

  const parents = rows.filter((row) => row.parent_id === null);
  return parents.map((parent) => ({
    id: parent.id,
    name: parent.name,
    slug: parent.slug,
    icon: parent.icon || 'layout-grid',
    subcategories: rows
      .filter((row) => row.parent_id === parent.id)
      .map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
      })),
  }));
}
