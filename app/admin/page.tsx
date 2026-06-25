'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import { Button, Container, Input } from '@/app/components/ui';
import { useTheme } from '@/app/context/ThemeContext';
import { slugify } from '@/lib/slugify';

type AdminMe = {
  authenticated: boolean;
  setupRequired: boolean;
  admin?: { id: number; name: string; email: string } | null;
};

type ProductRow = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory: string | null;
  city: string | null;
  location: string | null;
  status: string;
  image_url: string | null;
  images: string[];
  seller_id: number;
  seller_name: string;
  seller_email: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  delivery: string | null;
  condition: string | null;
  created_at: string;
};

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcategories: Array<{ id: number; name: string; slug: string }>;
};

type BannerRow = {
  id: number;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  role: string;
  rating: number;
  reviews_count: number;
  created_at: string;
  is_active: number;
  ads_count: number;
};

type AdminComposeTarget = {
  id: number;
  name: string;
  email: string;
  is_active: number;
};

type AdminUserMessage = {
  id: number;
  sender_id: number;
  receiver_id: number;
  product_id: number | null;
  content: string;
  read: number;
  created_at: string;
  sender_name: string | null;
  receiver_name: string | null;
  product_title: string | null;
};

type HomepageTrustItem = {
  icon: 'shield-check' | 'badge-check' | 'zap' | 'users';
  color: string;
  title: string;
  subtitle: string;
};

type HomepageSectionsState = {
  headerCategorySlugs: string[];
  trustItems: HomepageTrustItem[];
  homeCategorySlugs: string[];
};

const TABS = [
  { id: 'products', label: 'Огласи' },
  { id: 'users', label: 'Корисници' },
  { id: 'categories', label: 'Категории' },
  { id: 'homepage', label: 'Уредување банери' },
  { id: 'banners', label: 'Голем банер' },
  { id: 'billing', label: 'Биллинг' },
] as const;

const CATEGORY_ICON_OPTIONS = [
  { value: 'car', label: 'Автомобил' },
  { value: 'house', label: 'Куќа / дом' },
  { value: 'sofa', label: 'Софа / дом и градина' },
  { value: 'shirt', label: 'Облека / мода' },
  { value: 'smartphone', label: 'Мобилен телефон' },
  { value: 'monitor', label: 'Компјутер / монитор' },
  { value: 'tv', label: 'Телевизор / видео' },
  { value: 'guitar', label: 'Гитара / музика' },
  { value: 'watch', label: 'Часовник' },
  { value: 'baby', label: 'Бебе / деца' },
  { value: 'heart', label: 'Здравје / убавина' },
  { value: 'disc', label: 'CD / DVD' },
  { value: 'book', label: 'Книги' },
  { value: 'paperclip', label: 'Канцеларија / училиште' },
  { value: 'gamepad', label: 'Хоби / игри' },
  { value: 'dumbbell', label: 'Спорт' },
  { value: 'palette', label: 'Уметност' },
  { value: 'briefcase', label: 'Бизнис' },
  { value: 'cooking', label: 'Готвење / храна' },
  { value: 'cart', label: 'Трговија' },
  { value: 'wrench', label: 'Алат / услуги' },
  { value: 'calendar', label: 'Настани' },
  { value: 'plane', label: 'Туризам' },
  { value: 'message', label: 'Контакти / пораки' },
  { value: 'package', label: 'Останато / пакет' },
] as const;

export default function AdminPage() {
  const { dark } = useTheme();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('products');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [productSort, setProductSort] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'title_asc'>('newest');
  const [adminPerPage, setAdminPerPage] = useState(30);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userSort, setUserSort] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'ads_high' | 'ads_low'>('newest');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [userCounts, setUserCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [composeUser, setComposeUser] = useState<AdminComposeTarget | null>(null);
  const [auditUser, setAuditUser] = useState<AdminComposeTarget | null>(null);
  const [auditMessages, setAuditMessages] = useState<AdminUserMessage[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [adminMessageText, setAdminMessageText] = useState('');
  const [categorySort, setCategorySort] = useState<'name_asc' | 'name_desc' | 'newest'>('newest');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [setup, setSetup] = useState({ name: '', email: '', password: '', phone: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', icon: 'layout-grid', isActive: true });
  const [subcategoryForm, setSubcategoryForm] = useState({ parentId: '', name: '', slug: '', isActive: true });
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [categorySlugTouched, setCategorySlugTouched] = useState(false);
  const [subcategorySlugTouched, setSubcategorySlugTouched] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState({
    image_url: '',
    link_url: '',
    sort_order: '',
    is_active: true,
  });
  const [billingConfig, setBillingConfig] = useState({
    refresh_cost: 10, promote_cost: 50, promote_duration: 7, monthly_refresh_limit: 50, default_balance: 0, default_bonus: 0, currency: 'МКД',
  });
  const [billingUsers, setBillingUsers] = useState<any[]>([]);
  const [billingAdjustForm, setBillingAdjustForm] = useState({ user_id: '', amount: '', type: 'balance', description: '' });
  const [billingConfigForm, setBillingConfigForm] = useState({
    refresh_cost: '10', promote_cost: '50', promote_duration: '7', monthly_refresh_limit: '50', default_balance: '0', default_bonus: '0', currency: 'МКД',
  });
  const [homepageSections, setHomepageSections] = useState<HomepageSectionsState>({
    headerCategorySlugs: [],
    trustItems: [
      { icon: 'shield-check', color: 'text-blue-400', title: 'Безбедно купување', subtitle: 'Проверени продавачи' },
      { icon: 'badge-check', color: 'text-emerald-400', title: '100% Бесплатно', subtitle: 'Објави оглас без надомест' },
      { icon: 'zap', color: 'text-amber-400', title: 'Брзо и лесно', subtitle: 'Само неколку клика' },
      { icon: 'users', color: 'text-pink-400', title: '10,000+ активни', subtitle: 'Купувачи секој ден' },
    ],
    homeCategorySlugs: [],
  });

  const refreshMe = async () => {
    const response = await fetch('/api/admin/me', { cache: 'no-store' });
    const data = await response.json();
    setMe(data);
    return data;
  };

  const refreshProducts = async (nextStatus = statusFilter, nextSort = productSort) => {
    const response = await fetch(`/api/admin/products?status=${encodeURIComponent(nextStatus)}&sort=${encodeURIComponent(nextSort)}`, { cache: 'no-store' });
    const data = await response.json();
    setProducts(Array.isArray(data?.products) ? data.products : []);
  };

  const refreshCategories = async () => {
    const response = await fetch('/api/categories?all=1', { cache: 'no-store' });
    const data = await response.json();
    setCategories(Array.isArray(data?.categories) ? data.categories : []);
  };

  const refreshBanners = async () => {
    const response = await fetch('/api/admin/banners', { cache: 'no-store' });
    const data = await response.json();
    setBanners(Array.isArray(data?.banners) ? data.banners : []);
  };

  const refreshHomepageSections = async () => {
    const response = await fetch('/api/admin/homepage-sections', { cache: 'no-store' });
    const data = await response.json();
    setHomepageSections({
      headerCategorySlugs: Array.isArray(data?.headerCategorySlugs) ? data.headerCategorySlugs : [],
      trustItems: Array.isArray(data?.trustItems) ? data.trustItems : homepageSections.trustItems,
      homeCategorySlugs: Array.isArray(data?.homeCategorySlugs) ? data.homeCategorySlugs : [],
    });
  };

  const refreshBilling = async () => {
    const response = await fetch('/api/admin/billing', { cache: 'no-store' });
    const data = await response.json();
    if (data?.config) {
      setBillingConfig(data.config);
      setBillingConfigForm({
        refresh_cost: String(data.config.refresh_cost ?? 10),
        promote_cost: String(data.config.promote_cost ?? 50),
        promote_duration: String(data.config.promote_duration ?? 7),
        monthly_refresh_limit: String(data.config.monthly_refresh_limit ?? 50),
        default_balance: String(data.config.default_balance ?? 0),
        default_bonus: String(data.config.default_bonus ?? 0),
        currency: data.config.currency || 'МКД',
      });
    }
    setBillingUsers(Array.isArray(data?.users) ? data.users : []);
  };

  const refreshUsers = async (
    nextSearch = userSearch,
    nextSort = userSort,
    nextStatus = userStatusFilter
  ) => {
    const params = new URLSearchParams({
      sort: nextSort,
      status: nextStatus,
    });
    if (nextSearch.trim()) params.set('search', nextSearch.trim());
    const response = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
    const data = await response.json();
    setUsers(Array.isArray(data?.users) ? data.users : []);
    setUserCounts({
      total: Number(data?.counts?.total || 0),
      active: Number(data?.counts?.active || 0),
      inactive: Number(data?.counts?.inactive || 0),
    });
  };

  useEffect(() => {
    refreshMe().catch(() => setMe({ authenticated: false, setupRequired: false }));
  }, []);

  useEffect(() => {
    if (!me?.authenticated) return;
    refreshProducts().catch(() => {});
    refreshUsers().catch(() => {});
    refreshCategories().catch(() => {});
    refreshBanners().catch(() => {});
    refreshHomepageSections().catch(() => {});
  }, [me?.authenticated]);

  useEffect(() => {
    if (!me?.authenticated || activeTab !== 'products') return;
    refreshProducts(statusFilter, productSort).catch(() => {});
  }, [statusFilter, productSort, activeTab, me?.authenticated]);

  useEffect(() => {
    if (!me?.authenticated || activeTab !== 'users') return;
    refreshUsers(userSearch, userSort, userStatusFilter).catch(() => {});
  }, [userSearch, userSort, userStatusFilter, activeTab, me?.authenticated]);

  useEffect(() => {
    if (!me?.authenticated || activeTab !== 'billing') return;
    refreshBilling().catch(() => {});
  }, [activeTab, me?.authenticated]);

  const submitSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setup),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа setup');
      await refreshMe();
      setMessage('Admin профилот е креиран и најавен.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при setup.');
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа најавата');
      await refreshMe();
      setMessage('Успешна admin најава.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при најава.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setProducts([]);
    setCategories([]);
    setBanners([]);
    await refreshMe();
  };

  const changeProductStatus = async (id: number, status: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа менување статус');
      await refreshProducts(statusFilter);
      setMessage(`Огласот е сменет во ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при менување статус.');
    } finally {
      setBusy(false);
    }
  };

  const toggleUserActive = async (user: UserRow) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !Boolean(user.is_active) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа менување статус на корисник');
      await refreshUsers(userSearch, userSort, userStatusFilter);
      setMessage(user.is_active ? 'Корисникот е деактивиран.' : 'Корисникот е повторно активиран.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при менување статус на корисник.');
    } finally {
      setBusy(false);
    }
  };

  const sendAdminMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const targetIds = composeUser ? [composeUser.id] : selectedUserIds;
    if (!targetIds.length) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_ids: targetIds,
          content: adminMessageText,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа испраќање порака');
      setAdminMessageText('');
      setComposeUser(null);
      setSelectedUserIds([]);
      setMessage(targetIds.length === 1 ? 'Пораката е испратена до корисникот.' : `Пораката е испратена до ${targetIds.length} корисници.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при испраќање порака.');
    } finally {
      setBusy(false);
    }
  };

  const openUserMessages = async (user: AdminComposeTarget) => {
    setComposeUser(null);
    setAuditUser(user);
    setAuditMessages([]);
    setAuditLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/messages`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеав да ги вчитам пораките.');
      setAuditMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не успеав да ги вчитам пораките.');
      setAuditUser(null);
    } finally {
      setAuditLoading(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    setComposeUser(null);
  };

  const allVisibleUserIds = users.filter((user) => user.role !== 'admin').map((user) => user.id);
  const allVisibleSelected = allVisibleUserIds.length > 0 && allVisibleUserIds.every((id) => selectedUserIds.includes(id));

  const toggleSelectAllVisibleUsers = () => {
    setComposeUser(null);
    setSelectedUserIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !allVisibleUserIds.includes(id));
      }
      return Array.from(new Set([...prev, ...allVisibleUserIds]));
    });
  };

  const submitCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories', {
        method: editingCategoryId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          slug: categoryForm.slug,
          icon: categoryForm.icon,
          isActive: categoryForm.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа зачувување категорија');
      setCategoryForm({ name: '', slug: '', icon: 'layout-grid', isActive: true });
      setCategorySlugTouched(false);
      setEditingCategoryId(null);
      await refreshCategories();
      setMessage(editingCategoryId ? 'Категоријата е ажурирана.' : 'Категоријата е додадена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при зачувување категорија.');
    } finally {
      setBusy(false);
    }
  };

  const submitSubcategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(editingSubcategoryId ? `/api/categories/${editingSubcategoryId}` : '/api/categories', {
        method: editingSubcategoryId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: Number(subcategoryForm.parentId),
          name: subcategoryForm.name,
          slug: subcategoryForm.slug,
          isActive: subcategoryForm.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа зачувување подкатегорија');
      setSubcategoryForm({ parentId: '', name: '', slug: '', isActive: true });
      setSubcategorySlugTouched(false);
      setEditingSubcategoryId(null);
      await refreshCategories();
      setMessage(editingSubcategoryId ? 'Подкатегоријата е ажурирана.' : 'Подкатегоријата е додадена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при зачувување подкатегорија.');
    } finally {
      setBusy(false);
    }
  };

  const toggleCategory = async (id: number, isActive: boolean) => {
    setBusy(true);
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      await refreshCategories();
    } finally {
      setBusy(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setBusy(true);
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      await refreshCategories();
    } finally {
      setBusy(false);
    }
  };

  const startEditCategory = (category: CategoryNode) => {
    setEditingCategoryId(category.id);
    setEditingSubcategoryId(null);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon || 'layout-grid',
      isActive: true,
    });
    setCategorySlugTouched(false);
    setSubcategoryForm({ parentId: '', name: '', slug: '', isActive: true });
    setSubcategorySlugTouched(false);
    setActiveTab('categories');
    setMessage(null);
  };

  const startEditSubcategory = (parent: CategoryNode, subcategory: CategoryNode['subcategories'][number]) => {
    setEditingSubcategoryId(subcategory.id);
    setEditingCategoryId(null);
    setSubcategoryForm({
      parentId: String(parent.id),
      name: subcategory.name,
      slug: subcategory.slug,
      isActive: true,
    });
    setSubcategorySlugTouched(false);
    setCategoryForm({ name: '', slug: '', icon: 'layout-grid', isActive: true });
    setCategorySlugTouched(false);
    setActiveTab('categories');
    setMessage(null);
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', slug: '', icon: 'layout-grid', isActive: true });
    setCategorySlugTouched(false);
  };

  const cancelSubcategoryEdit = () => {
    setEditingSubcategoryId(null);
    setSubcategoryForm({ parentId: '', name: '', slug: '', isActive: true });
    setSubcategorySlugTouched(false);
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerForm({
      image_url: '',
      link_url: '',
      sort_order: '',
      is_active: true,
    });
  };

  const handleBannerImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    setBannerForm((prev) => ({ ...prev, image_url: dataUrl }));
    event.target.value = '';
  };

  const submitBanner = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const url = editingBannerId ? `/api/admin/banners/${editingBannerId}` : '/api/admin/banners';
      const method = editingBannerId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: bannerForm.image_url,
          link_url: bannerForm.link_url,
          sort_order: bannerForm.sort_order === '' ? undefined : Number(bannerForm.sort_order),
          is_active: bannerForm.is_active,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа зачувување банер');
      await refreshBanners();
      resetBannerForm();
      setMessage(editingBannerId ? 'Банерот е ажуриран.' : 'Банерот е додаден.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при зачувување банер.');
    } finally {
      setBusy(false);
    }
  };

  const startEditBanner = (banner: BannerRow) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      sort_order: String(banner.sort_order),
      is_active: Boolean(banner.is_active),
    });
    setActiveTab('banners');
    setMessage(null);
  };

  const toggleBannerActive = async (banner: BannerRow) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...banner,
          is_active: !banner.is_active,
          image_url: banner.image_url,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа промена на банер');
      await refreshBanners();
      setMessage(!banner.is_active ? 'Банерот е активиран.' : 'Банерот е сокриен.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при менување банер.');
    } finally {
      setBusy(false);
    }
  };

  const deleteBanner = async (id: number) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа бришење банер');
      if (editingBannerId === id) resetBannerForm();
      await refreshBanners();
      setMessage('Банерот е избришан.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при бришење банер.');
    } finally {
      setBusy(false);
    }
  };

  const updateHomepageCategorySlug = (
    section: 'headerCategorySlugs' | 'homeCategorySlugs',
    index: number,
    value: string,
  ) => {
    setHomepageSections((prev) => {
      const next = [...prev[section]];
      next[index] = value;
      return { ...prev, [section]: next };
    });
  };

  const updateTrustItem = (index: number, field: 'title' | 'subtitle', value: string) => {
    setHomepageSections((prev) => ({
      ...prev,
      trustItems: prev.trustItems.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const submitHomepageSections = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/homepage-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageSections),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа зачувување на почетните банери');
      await refreshHomepageSections();
      setMessage('Почетните банери се ажурирани.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при зачувување на почетните банери.');
    } finally {
      setBusy(false);
    }
  };

  const handleCategoryNameChange = (value: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      name: value,
      slug: categorySlugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSubcategoryNameChange = (value: string) => {
    setSubcategoryForm((prev) => ({
      ...prev,
      name: value,
      slug: subcategorySlugTouched ? prev.slug : slugify(value),
    }));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-2.5 text-white md:py-3">
        <Container>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[2.1rem] font-bold leading-none">Admin Panel</h1>
              <p className="mt-0.5 text-sm leading-snug text-slate-400">Од тука ќе одобруваш огласи, ќе управуваш со категории и ќе поставуваш промотивни позиции за поголема видливост.</p>
            </div>
            {me?.authenticated && (
              <div className="flex items-center gap-2">
                <select
                  value={adminPerPage}
                  onChange={(e) => setAdminPerPage(Number(e.target.value))}
                  className="rounded-lg border border-[#223653] bg-[#0b1727] px-3 py-2 text-sm text-white"
                >
                  <option value={30}>Прикажи по 30</option>
                  <option value={50}>Прикажи по 50</option>
                  <option value={70}>Прикажи по 70</option>
                  <option value={100}>Прикажи по 100</option>
                </select>
                <Button onClick={logout} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                  Одјава
                </Button>
              </div>
            )}
          </div>

          {message && (
            <div className={`mb-3 rounded-lg border px-4 py-2.5 text-sm ${
              dark
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-100'
                : 'border-blue-400/50 bg-blue-50 text-blue-900'
            }`}>
              {message}
            </div>
          )}

          {!me?.authenticated && me?.setupRequired && (
            <form onSubmit={submitSetup} className="max-w-xl space-y-4 rounded-xl border border-[#1d2c43] bg-[#081223] p-6">
              <h2 className="text-xl font-bold">Постави прв admin</h2>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Admin име</label>
                <Input placeholder="на пр. Admin" value={setup.name} onChange={(e) => setSetup((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Admin email</label>
                <Input placeholder="на пр. admin@kupiprodadi.mk" type="email" value={setup.email} onChange={(e) => setSetup((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Лозинка</label>
                <Input placeholder="Внеси сигурна лозинка" type="password" value={setup.password} onChange={(e) => setSetup((prev) => ({ ...prev, password: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Телефон</label>
                <Input placeholder="на пр. 070123456" value={setup.phone} onChange={(e) => setSetup((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">{busy ? 'Се креира...' : 'Креирај admin'}</Button>
            </form>
          )}

          {!me?.authenticated && !me?.setupRequired && (
            <form onSubmit={submitLogin} className="max-w-xl space-y-4 rounded-xl border border-[#1d2c43] bg-[#081223] p-6">
              <h2 className="text-xl font-bold">Admin најава</h2>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Admin email</label>
                <Input placeholder="на пр. admin@kupiprodadi.mk" type="email" value={login.email} onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Лозинка</label>
                <Input placeholder="Внеси лозинка" type="password" value={login.password} onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))} />
              </div>
              <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">{busy ? 'Најава...' : 'Најави се'}</Button>
            </form>
          )}

          {me?.authenticated && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`admin-dark-button rounded-lg px-4 py-1.5 text-sm font-semibold ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-[#0c1628] text-slate-300'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'products' && (
                <section className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Одобрување огласи</h2>
                    <div className="flex gap-2">
                      <select
                        value={productSort}
                        onChange={(e) => setProductSort(e.target.value as 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'title_asc')}
                        className="rounded-lg border border-[#223653] bg-[#0b1727] px-3 py-2 text-sm text-white"
                      >
                        <option value="newest">Најнови</option>
                        <option value="oldest">Најстари</option>
                        <option value="price_asc">Цена растечка</option>
                        <option value="price_desc">Цена опаѓачка</option>
                        <option value="title_asc">По име (А-Ш)</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-[#223653] bg-[#0b1727] px-3 py-2 text-sm text-white"
                      >
                        <option value="">Сите</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {products.slice(0, adminPerPage).map((product) => (
                      <div key={product.id} className="rounded-lg border-2 border-[#2d4a6a] bg-[#0b1727] p-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{product.title} <span className="ml-1.5 rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs font-mono text-yellow-400">KP-{String(product.id).padStart(6, '0')}</span></h3>
                              <p className="mt-1 text-sm text-slate-300">
                                <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs font-mono text-yellow-400">ID#{product.seller_id}</span> {product.seller_name} · {product.contact_name || 'Нема контакт име'} · {product.contact_phone || 'Нема телефон'}
                              </p>
                              <p className="mt-1 text-sm text-slate-400">
                                {product.price} {product.currency} · {product.city || product.location || 'Нема град'} · {product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {product.condition || 'Нема состојба'} · {product.delivery || 'Нема достава'} · {product.contact_email || product.seller_email}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => changeProductStatus(product.id, 'active')} className="admin-dark-button bg-green-600 hover:bg-green-500 text-white">Одобри</Button>
                              <Button onClick={() => changeProductStatus(product.id, 'rejected')} className="admin-dark-button bg-red-700 hover:bg-red-600 text-white">Одбиј</Button>
                              {product.status !== 'pending' && (
                                <Button onClick={() => changeProductStatus(product.id, 'pending')} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Врати pending</Button>
                              )}
                            </div>
                          </div>

                          {product.description && (
                            <div className="rounded-lg border border-[#223653] bg-[#081223] p-4">
                              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{product.description}</p>
                            </div>
                          )}

                          {product.images?.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {product.images.map((image, index) => (
                                <a key={`${product.id}-${index}`} href={image} target="_blank" rel="noopener noreferrer" className="block">
                                  <img
                                    src={image}
                                    alt={`${product.title} ${index + 1}`}
                                    className="h-28 w-36 rounded-lg border border-[#223653] bg-[#081223] object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && <p className="text-sm text-slate-400">Нема огласи во овој статус.</p>}
                  </div>
                </section>
              )}

              {activeTab === 'users' && (
                <section className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                      <p className="text-sm font-medium text-slate-400">Вкупно корисници</p>
                      <p className="mt-3 text-3xl font-bold text-white">{userCounts.total}</p>
                    </div>
                    <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                      <p className="text-sm font-medium text-slate-400">Активни профили</p>
                      <p className="mt-3 text-3xl font-bold text-emerald-400">{userCounts.active}</p>
                    </div>
                    <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                      <p className="text-sm font-medium text-slate-400">Деактивирани профили</p>
                      <p className="mt-3 text-3xl font-bold text-rose-400">{userCounts.inactive}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Корисници</h2>
                        <p className="mt-2 text-sm text-slate-400">
                          Пребарувај, сортирај и деактивирај профили ако забележиш злоупотреба или scam однесување.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[760px]">
                        <div className="sm:col-span-1">
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Пребарување</label>
                          <Input
                            placeholder="Име, email, телефон или ID"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className={`admin-dark-input h-10 !py-2 ${
                              dark
                                ? '!bg-[#0b1727] !border-[#223653] !text-white placeholder:!text-slate-500'
                                : '!bg-white !border-[#4b5d78] !text-slate-900 placeholder:!text-slate-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Сортирање</label>
                          <select
                            value={userSort}
                            onChange={(e) => setUserSort(e.target.value as 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'ads_high' | 'ads_low')}
                            className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white"
                          >
                            <option value="newest">Најново регистрирани</option>
                            <option value="oldest">Најстари профили</option>
                            <option value="rating_high">Највисок рејтинг</option>
                            <option value="rating_low">Најнизок рејтинг</option>
                            <option value="ads_high">Најмногу огласи</option>
                            <option value="ads_low">Најмалку огласи</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Статус</label>
                          <select
                            value={userStatusFilter}
                            onChange={(e) => setUserStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                            className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white"
                          >
                            <option value="all">Сите корисници</option>
                            <option value="active">Само активни</option>
                            <option value="inactive">Само деактивирани</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {(composeUser || selectedUserIds.length > 0) && (
                      <form onSubmit={sendAdminMessage} className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">Прати порака до корисник</h3>
                            {composeUser ? (
                              <p className="mt-1 text-sm text-slate-300">
                                {composeUser.name} · {composeUser.email} · ID #{composeUser.id}
                              </p>
                            ) : (
                              <p className="mt-1 text-sm text-slate-300">
                                Избрани корисници: {selectedUserIds.length}
                              </p>
                            )}
                            {composeUser && !composeUser.is_active && (
                              <p className="mt-2 text-xs font-medium text-amber-300">Овој профил е моментално деактивиран, но пораката сепак може да биде испратена.</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              setComposeUser(null);
                              setSelectedUserIds([]);
                              setAdminMessageText('');
                            }}
                            className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            Затвори
                          </Button>
                        </div>

                        <div className="mt-4 space-y-2">
                          <label className="block text-sm font-semibold text-slate-200">Порака</label>
                          <textarea
                            value={adminMessageText}
                            onChange={(e) => setAdminMessageText(e.target.value)}
                            placeholder="Напиши предупредување, информација, барање за корекција или порака поврзана со профилот."
                            rows={5}
                            className="w-full rounded-lg border border-[#223653] bg-[#0b1727] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                          />
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button disabled={busy || !adminMessageText.trim()} className="admin-dark-button bg-cyan-600 hover:bg-cyan-500 text-white">
                            {busy ? 'Се праќа...' : 'Испрати порака'}
                          </Button>
                        </div>
                      </form>
                    )}

                    <div className="mt-5 space-y-3">
                      <div className="flex flex-col gap-3 rounded-xl border border-[#223653] bg-[#0b1727] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={toggleSelectAllVisibleUsers}
                              className="h-4 w-4 rounded border border-[#3a5276] bg-[#081223]"
                            />
                            Select all
                          </label>
                          <span className="text-sm text-slate-400">
                            Избрани: {selectedUserIds.length}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            disabled={!selectedUserIds.length}
                            onClick={() => setComposeUser(null)}
                            className="admin-dark-button bg-cyan-700 hover:bg-cyan-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Прати известување
                          </Button>
                          {!!selectedUserIds.length && (
                            <Button
                              type="button"
                              onClick={() => setSelectedUserIds([])}
                              className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              Исчисти избор
                            </Button>
                          )}
                        </div>
                      </div>

                      {users.slice(0, adminPerPage).map((user) => (
                        <div key={user.id} className="rounded-xl border-2 border-[#2d4a6a] bg-[#0b1727] p-4">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {user.role !== 'admin' && (
                                    <label className="mr-1 flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => toggleUserSelection(user.id)}
                                        className="h-4 w-4 rounded border border-[#3a5276] bg-[#081223]"
                                      />
                                    </label>
                                  )}
                                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                                  <span className="rounded-full border border-[#314867] bg-[#122038] px-2.5 py-1 text-xs font-semibold text-slate-200">
                                    ID #{user.id}
                                  </span>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      user.role === 'admin'
                                        ? dark
                                          ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                                          : 'border border-amber-400/80 bg-amber-50 text-amber-900'
                                        : user.is_active
                                          ? dark
                                            ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                            : 'border border-emerald-400/80 bg-emerald-50 text-emerald-900'
                                          : dark
                                            ? 'border border-rose-500/40 bg-rose-500/10 text-rose-300'
                                            : 'border border-rose-400/80 bg-rose-50 text-rose-900'
                                    }`}
                                  >
                                    {user.role === 'admin' ? 'Admin' : user.is_active ? 'Активен' : 'Деактивиран'}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-300">{user.email}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {user.phone || 'Нема телефон'}{user.location ? ` · ${user.location}` : ''}
                                </p>
                              </div>

                              <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                                <div className="rounded-lg border border-[#1d2c43] bg-[#081223] px-3 py-2">
                                  <p className="text-xs uppercase tracking-wide text-slate-500">Регистрација</p>
                                  <p className="mt-1 font-medium text-white">{new Date(user.created_at).toLocaleString('mk-MK')}</p>
                                </div>
                                <div className="rounded-lg border border-[#1d2c43] bg-[#081223] px-3 py-2">
                                  <p className="text-xs uppercase tracking-wide text-slate-500">Огласи</p>
                                  <p className="mt-1 font-medium text-white">{user.ads_count}</p>
                                </div>
                              </div>

                              <div className="rounded-lg border border-[#1d2c43] bg-[#081223] px-3 py-2 text-sm">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Рејтинг</p>
                                <p className="mt-1 font-medium text-white">
                                  {(user.rating ?? 5).toFixed(1)} / 5
                                  <span className="ml-2 text-slate-500">({user.reviews_count || 0} рецензии)</span>
                                </p>
                              </div>
                            </div>

                            <div className="-mt-1 grid shrink-0 grid-cols-2 gap-2 self-start">
                              <Button
                                type="button"
                                onClick={() => {
                                  setAuditUser(null);
                                  setAuditMessages([]);
                                  setComposeUser({
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    is_active: user.is_active,
                                  });
                                  setAdminMessageText('');
                                }}
                                className="admin-dark-button bg-cyan-700 px-3 py-2 hover:bg-cyan-600 text-white"
                              >
                                Прати порака
                              </Button>
                              <Button
                                type="button"
                                disabled={busy || user.role === 'admin'}
                                onClick={() => toggleUserActive(user)}
                                className={`admin-dark-button px-3 py-2 text-white ${
                                  user.role === 'admin'
                                    ? 'cursor-not-allowed bg-slate-700 opacity-60'
                                    : user.is_active
                                      ? 'bg-rose-700 hover:bg-rose-600'
                                      : 'bg-emerald-700 hover:bg-emerald-600'
                                }`}
                              >
                                {user.role === 'admin' ? 'Admin профил' : user.is_active ? 'Деактивирај' : 'Активирај'}
                              </Button>
                              <Button
                                type="button"
                                onClick={() =>
                                  openUserMessages({
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    is_active: user.is_active,
                                  })
                                }
                                className="admin-dark-button col-start-2 bg-indigo-700 px-3 py-2 hover:bg-indigo-600 text-white"
                              >
                                Пораки
                              </Button>
                            </div>
                          </div>

                          {auditUser?.id === user.id && (
                            <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-white">Пораки од и до корисник</h3>
                                  <p className="mt-1 text-sm text-slate-300">
                                    {auditUser.name} · {auditUser.email} · ID #{auditUser.id}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => {
                                    setAuditUser(null);
                                    setAuditMessages([]);
                                  }}
                                  className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                  Затвори
                                </Button>
                              </div>

                              <div className="mt-4 space-y-3">
                                {auditLoading ? (
                                  <div className="rounded-xl border border-[#223653] bg-[#0b1727] px-5 py-8 text-center text-sm text-slate-300">
                                    Се вчитуваат пораките...
                                  </div>
                                ) : auditMessages.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-[#223653] bg-[#0b1727] px-5 py-8 text-center text-sm text-slate-400">
                                    Овој корисник сè уште нема пораки за преглед.
                                  </div>
                                ) : (
                                  auditMessages.map((item) => {
                                    const isOutgoing = item.sender_id === auditUser.id;
                                    return (
                                      <div key={item.id} className="rounded-xl border border-[#223653] bg-[#0b1727] px-4 py-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                          <div>
                                            <p className="text-sm font-semibold text-white">
                                              {isOutgoing ? 'Пратена порака' : 'Примена порака'}
                                              <span className="ml-2 text-xs font-medium text-slate-400">
                                                {isOutgoing
                                                  ? `до ${item.receiver_name || 'непознат корисник'}`
                                                  : `од ${item.sender_name || 'непознат корисник'}`}
                                              </span>
                                            </p>
                                            {item.product_title && (
                                              <p className="mt-1 text-xs text-cyan-300">Оглас: {item.product_title}</p>
                                            )}
                                          </div>
                                          <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString('mk-MK')}</p>
                                        </div>
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.content}</p>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {users.length === 0 && (
                        <div className="rounded-xl border border-dashed border-[#223653] bg-[#0b1727] px-5 py-10 text-center text-sm text-slate-400">
                          Нема корисници што одговараат на пребарувањето или филтерот.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'categories' && (
                <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
                  <div className="space-y-5">
                    <form onSubmit={submitCategory} className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5 space-y-3">
                      <div>
                        <h2 className="text-lg font-bold">{editingCategoryId ? 'Уреди категорија' : 'Нова категорија'}</h2>
                        {editingCategoryId && <p className="mt-1 text-xs text-slate-400">Кога ќе го смениш slug-от, системот ќе ги префрли и огласите што ја користат оваа категорија.</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Име</label>
                        <Input placeholder="на пр. Електрични возила" value={categoryForm.name} onChange={(e) => handleCategoryNameChange(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Slug</label>
                        <Input
                          placeholder="се пополнува автоматски, на пр. elektricni-vozila"
                          value={categoryForm.slug}
                          onChange={(e) => {
                            setCategorySlugTouched(true);
                            setCategoryForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                          }}
                        />
                        <p className="text-xs text-slate-400">Ова е адресата во линкот. Системот сам го прави од името, а можеш и рачно да го смениш.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Икона</label>
                        <select
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))}
                          className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white"
                        >
                          <option value="layout-grid">Основна икона</option>
                          {CATEGORY_ICON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-400">Избери ја иконата што најмногу одговара на категоријата.</p>
                      </div>
                      {editingCategoryId && (
                        <label className="flex items-center gap-3 rounded-lg border border-[#223653] bg-[#0b1727] px-4 py-3 text-sm text-slate-200">
                          <input
                            type="checkbox"
                            checked={categoryForm.isActive}
                            onChange={(e) => setCategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                          />
                          Категоријата да биде активна
                        </label>
                      )}
                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          {editingCategoryId ? 'Зачувај измени' : 'Додај категорија'}
                        </Button>
                        {editingCategoryId && (
                          <Button type="button" onClick={cancelCategoryEdit} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                            Откажи
                          </Button>
                        )}
                      </div>
                    </form>

                    <form onSubmit={submitSubcategory} className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5 space-y-3">
                      <div>
                        <h2 className="text-lg font-bold">{editingSubcategoryId ? 'Уреди подкатегорија' : 'Нова подкатегорија'}</h2>
                        {editingSubcategoryId && <p className="mt-1 text-xs text-slate-400">Slug промената ќе се префрли и на огласите што ја користат оваа подкатегорија.</p>}
                      </div>
                      <select
                        value={subcategoryForm.parentId}
                        onChange={(e) => setSubcategoryForm((prev) => ({ ...prev, parentId: e.target.value }))}
                        disabled={Boolean(editingSubcategoryId)}
                        className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Избери parent категорија</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {editingSubcategoryId && (
                        <p className="text-xs text-slate-400">Parent категоријата не се менува тука. Ако треба да се премести, прво креирај ја под новата категорија.</p>
                      )}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Име</label>
                        <Input placeholder="на пр. Скутери електрични" value={subcategoryForm.name} onChange={(e) => handleSubcategoryNameChange(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Slug</label>
                        <Input
                          placeholder="се пополнува автоматски, на пр. skuteri-elektricni"
                          value={subcategoryForm.slug}
                          onChange={(e) => {
                            setSubcategorySlugTouched(true);
                            setSubcategoryForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                          }}
                        />
                        <p className="text-xs text-slate-400">Исто како категоријата, ова е URL името за подкатегоријата.</p>
                      </div>
                      {editingSubcategoryId && (
                        <label className="flex items-center gap-3 rounded-lg border border-[#223653] bg-[#0b1727] px-4 py-3 text-sm text-slate-200">
                          <input
                            type="checkbox"
                            checked={subcategoryForm.isActive}
                            onChange={(e) => setSubcategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                          />
                          Подкатегоријата да биде активна
                        </label>
                      )}
                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          {editingSubcategoryId ? 'Зачувај измени' : 'Додај подкатегорија'}
                        </Button>
                        {editingSubcategoryId && (
                          <Button type="button" onClick={cancelSubcategoryEdit} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                            Откажи
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h2 className="text-lg font-bold">Постоечки категории</h2>
                      <select
                        value={categorySort}
                        onChange={(e) => setCategorySort(e.target.value as 'name_asc' | 'name_desc' | 'newest')}
                        className="rounded-lg border border-[#223653] bg-[#0b1727] px-3 py-1.5 text-sm text-white"
                      >
                        <option value="newest">Најнови</option>
                        <option value="name_asc">Име (А-Ш)</option>
                        <option value="name_desc">Име (Ш-А)</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      {[...categories].sort((a, b) => {
                        if (categorySort === 'name_asc') return a.name.localeCompare(b.name, 'mk');
                        if (categorySort === 'name_desc') return b.name.localeCompare(a.name, 'mk');
                        return b.id - a.id;
                      }).slice(0, adminPerPage).map((category) => (
                        <div key={category.id} className="rounded-lg border border-[#223653] bg-[#0b1727] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              <p className="text-sm text-slate-400">{category.slug}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" onClick={() => startEditCategory(category)} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Уреди</Button>
                              <Button type="button" onClick={() => toggleCategory(category.id, false)} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Сокриј</Button>
                              <Button type="button" onClick={() => deleteCategory(category.id)} className="admin-dark-button bg-red-700 hover:bg-red-600 text-white">Избриши</Button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center gap-2 rounded-full border border-[#2c4264] bg-[#122038] px-3 py-1 text-xs text-slate-200">
                                <span>{subcategory.name}</span>
                                <button
                                  type="button"
                                  onClick={() => startEditSubcategory(category, subcategory)}
                                  className={`font-semibold ${dark ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-800 hover:text-blue-900'}`}
                                >
                                  Уреди
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'homepage' && (
                <section className="grid gap-5 lg:grid-cols-[440px_1fr]">
                  <div className="space-y-5">
                    <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                      <h2 className="text-lg font-bold">Уредување банери</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Овде се уредуваат трите live секции на почетната: горниот банер со категории, долниот info банер и долниот банер со категории под info банерот.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-300">
                        <li>• Избери кои категории да се прикажуваат горе над големиот банер</li>
                        <li>• Смени наслови и поднаслови во info банерот</li>
                        <li>• Избери кои категории да се прикажуваат во долниот банер под info делот</li>
                      </ul>
                    </div>

                    <form onSubmit={submitHomepageSections} className="space-y-5 rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-bold">Горен банер со категории</h3>
                          <p className="mt-1 text-xs text-slate-400">Овие 5 категории се прикажуваат над големиот банер, до копчето „Сите категории“.</p>
                        </div>
                        <div className="grid gap-3">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={`header-cat-${index}`} className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Позиција {index + 1}</label>
                              <select
                                value={homepageSections.headerCategorySlugs[index] || ''}
                                onChange={(e) => updateHomepageCategorySlug('headerCategorySlugs', index, e.target.value)}
                                className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white"
                              >
                                <option value="">Избери категорија</option>
                                {categories.map((category) => (
                                  <option key={`header-option-${category.id}`} value={category.slug}>{category.name}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-bold">Долен info банер</h3>
                          <p className="mt-1 text-xs text-slate-400">Смени го текстот што се прикажува во четирите info картички под големиот банер.</p>
                        </div>
                        <div className="grid gap-3">
                          {homepageSections.trustItems.map((item, index) => (
                            <div key={`${item.icon}-${index}`} className="rounded-lg border border-[#223653] bg-[#0b1727] p-4">
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Info картичка {index + 1}</p>
                              <div className="space-y-3">
                                <Input
                                  placeholder="Наслов"
                                  value={item.title}
                                  onChange={(e) => updateTrustItem(index, 'title', e.target.value)}
                                />
                                <Input
                                  placeholder="Поднаслов"
                                  value={item.subtitle}
                                  onChange={(e) => updateTrustItem(index, 'subtitle', e.target.value)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-bold">Долен банер со категории</h3>
                          <p className="mt-1 text-xs text-slate-400">Овие 6 категории се прикажуваат под info банерот како category банер.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <div key={`home-cat-${index}`} className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Позиција {index + 1}</label>
                              <select
                                value={homepageSections.homeCategorySlugs[index] || ''}
                                onChange={(e) => updateHomepageCategorySlug('homeCategorySlugs', index, e.target.value)}
                                className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white"
                              >
                                <option value="">Избери категорија</option>
                                {categories.map((category) => (
                                  <option key={`home-option-${category.id}`} value={category.slug}>{category.name}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          Зачувај уредување на банери
                        </Button>
                      </div>
                    </form>
                  </div>

                  <div className="space-y-5 rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                    <div>
                      <h2 className="text-lg font-bold">Преглед на секциите</h2>
                      <p className="mt-1 text-sm text-slate-400">Ова е брз преглед на моменталната структура на почетната страница.</p>
                    </div>

                    <div className="rounded-xl border border-[#223653] bg-[#0b1727] p-4">
                      <h3 className="text-sm font-bold text-slate-200">Горен банер со категории</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {homepageSections.headerCategorySlugs.map((slug, index) => {
                          const category = categories.find((item) => item.slug === slug);
                          return (
                            <span key={`header-preview-${slug || index}`} className="rounded-full border border-[#2c4264] bg-[#122038] px-3 py-1 text-xs text-slate-200">
                              {category?.name || `Празна позиција ${index + 1}`}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#223653] bg-[#0b1727] p-4">
                      <h3 className="text-sm font-bold text-slate-200">Долен info банер</h3>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {homepageSections.trustItems.map((item, index) => (
                          <div key={`trust-preview-${index}`} className="rounded-lg border border-[#2c4264] bg-[#122038] p-3">
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#223653] bg-[#0b1727] p-4">
                      <h3 className="text-sm font-bold text-slate-200">Долен банер со категории</h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {homepageSections.homeCategorySlugs.map((slug, index) => {
                          const category = categories.find((item) => item.slug === slug);
                          return (
                            <div key={`home-preview-${slug || index}`} className="rounded-lg border border-[#2c4264] bg-[#122038] px-3 py-2 text-xs text-slate-200">
                              {category?.name || `Празна позиција ${index + 1}`}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'billing' && (
                <section className="grid gap-5 lg:grid-cols-[460px_1fr]">
                  <div className="space-y-5">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setBusy(true);
                        setMessage(null);
                        try {
                          const res = await fetch('/api/admin/billing', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'update_config', ...billingConfigForm, refresh_cost: Number(billingConfigForm.refresh_cost), promote_cost: Number(billingConfigForm.promote_cost), promote_duration: Number(billingConfigForm.promote_duration), monthly_refresh_limit: Number(billingConfigForm.monthly_refresh_limit), default_balance: Number(billingConfigForm.default_balance), default_bonus: Number(billingConfigForm.default_bonus) }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Грешка');
                          await refreshBilling();
                          setMessage('Конфигурацијата е зачувана.');
                        } catch (error) {
                          setMessage(error instanceof Error ? error.message : 'Грешка при зачувување.');
                        } finally { setBusy(false); }
                      }}
                      className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5 space-y-4"
                    >
                      <h2 className="text-lg font-bold">Подесувања на биллинг</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-200">Цена на обновување ({billingConfigForm.currency})</label>
                          <input type="number" step="0.01" value={billingConfigForm.refresh_cost} onChange={(e) => setBillingConfigForm((prev) => ({ ...prev, refresh_cost: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-200">Цена на промоција ({billingConfigForm.currency})</label>
                          <input type="number" step="0.01" value={billingConfigForm.promote_cost} onChange={(e) => setBillingConfigForm((prev) => ({ ...prev, promote_cost: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-200">Траење на промоција (денови)</label>
                          <input type="number" value={billingConfigForm.promote_duration} onChange={(e) => setBillingConfigForm((prev) => ({ ...prev, promote_duration: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-200">Месечен лимит на обновувања</label>
                          <input type="number" value={billingConfigForm.monthly_refresh_limit} onChange={(e) => setBillingConfigForm((prev) => ({ ...prev, monthly_refresh_limit: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-200">Default balance (нов user)</label>
                          <input type="number" step="0.01" value={billingConfigForm.default_balance} onChange={(e) => setBillingConfigForm((prev) => ({ ...prev, default_balance: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-200">Default бонус (нов user)</label>
                          <input type="number" step="0.01" value={billingConfigForm.default_bonus} onChange={(e) => setBillingConfigForm((prev) => ({ ...prev, default_bonus: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">Валута</label>
                        <input value={billingConfigForm.currency} onChange={(e) => setBillingConfigForm((prev) => ({ ...prev, currency: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                      </div>
                      <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">Зачувај подесувања</Button>
                    </form>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setBusy(true);
                        setMessage(null);
                        try {
                          const res = await fetch('/api/admin/billing', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'adjust_balance',
                              user_id: Number(billingAdjustForm.user_id),
                              amount: Number(billingAdjustForm.amount),
                              type: billingAdjustForm.type,
                              description: billingAdjustForm.description,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Грешка');
                          await refreshBilling();
                          setBillingAdjustForm({ user_id: '', amount: '', type: 'balance', description: '' });
                          setMessage('Состојбата е прилагодена.');
                        } catch (error) {
                          setMessage(error instanceof Error ? error.message : 'Грешка при прилагодување.');
                        } finally { setBusy(false); }
                      }}
                      className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5 space-y-4"
                    >
                      <h2 className="text-lg font-bold">Прилагоди состојба на корисник</h2>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">User ID</label>
                        <input type="number" value={billingAdjustForm.user_id} onChange={(e) => setBillingAdjustForm((prev) => ({ ...prev, user_id: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">Износ (позитивен +, негативен -)</label>
                        <input type="number" step="0.01" value={billingAdjustForm.amount} onChange={(e) => setBillingAdjustForm((prev) => ({ ...prev, amount: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">Тип</label>
                        <select value={billingAdjustForm.type} onChange={(e) => setBillingAdjustForm((prev) => ({ ...prev, type: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white">
                          <option value="balance">Balance (главна сметка)</option>
                          <option value="bonus">Bonus (бонус сметка)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-200">Опис (за трансакција)</label>
                        <input value={billingAdjustForm.description} onChange={(e) => setBillingAdjustForm((prev) => ({ ...prev, description: e.target.value }))} className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white" />
                      </div>
                      <Button disabled={busy} className="admin-dark-button bg-amber-600 hover:bg-amber-700 text-white">Прилагоди</Button>
                    </form>

                    <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                      <h2 className="text-lg font-bold">Брзи дејства</h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            try {
                              const res = await fetch('/api/admin/billing', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'reset_refresh_limits' }),
                              });
                              if (!res.ok) throw new Error();
                              await refreshBilling();
                              setMessage('Лимитите за обновување се ресетирани за сите корисници.');
                            } catch { setMessage('Грешка при ресетирање.'); }
                            finally { setBusy(false); }
                          }}
                          className="admin-dark-button bg-rose-700 hover:bg-rose-600 text-white"
                        >
                          Ресетирај месечни лимити (сите)
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                    <h2 className="mb-4 text-lg font-bold">Состојби на корисници ({billingUsers.length})</h2>
                    <div className="space-y-3">
                      {billingUsers.map((u: any) => (
                        <div key={u.id} className="rounded-lg border border-[#223653] bg-[#0b1727] p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white">{u.name || u.email} <span className="text-xs text-slate-400">ID #{u.id}</span></p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:flex sm:gap-4">
                              <span className="text-emerald-400"><span className="text-slate-500">Balance:</span> {Number(u.balance).toFixed(2)}</span>
                              <span className="text-amber-400"><span className="text-slate-500">Бонус:</span> {Number(u.bonus_balance).toFixed(2)}</span>
                              <span className="text-slate-300"><span className="text-slate-500">Денес:</span> {Number(u.spent_today).toFixed(2)}</span>
                              <span className="text-slate-300"><span className="text-slate-500">Месец:</span> {Number(u.spent_month).toFixed(2)}</span>
                              <span className="text-cyan-300"><span className="text-slate-500">Обновувања:</span> {u.monthly_refreshes ?? 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {billingUsers.length === 0 && <p className="text-sm text-slate-400">Нема корисници со биллинг податоци.</p>}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'banners' && (
                <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
                  <div className="space-y-5">
                    <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                      <h2 className="text-lg font-bold">Голем банер</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Овој дел е наменет за промотивни банери што добиваат приоритетен простор на почетната страница и служат за поголема видливост на бренд, категорија, понуда или специјална кампања.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-300">
                        <li>• Топ прикажување на почетна страница</li>
                        <li>• Поголема изложеност пред сите посетители</li>
                        <li>• Идеално за истакнати понуди, промоции и рекламни кампањи</li>
                        <li>• Редоследот одредува кој банер добива прв приоритет</li>
                      </ul>
                    </div>

                    <form onSubmit={submitBanner} className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold">{editingBannerId ? 'Уреди промотивен банер' : 'Нов промотивен банер'}</h2>
                        <p className="mt-1 text-sm text-slate-400">Препорачана димензија: 1600 x 400 px, JPG или PNG. Овие банери се користат за истакнување, рекламирање и приоритетно позиционирање на почетната страница.</p>
                        <p className="mt-1 text-xs text-slate-500">Правило: минимум 1 активен банер, максимум 10 активни банери. Помал редослед значи повисок приоритет.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Промотивна слика *</label>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleBannerImageChange}
                          className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                        />
                        <Input
                          placeholder="или стави директен image URL"
                          value={bannerForm.image_url}
                          onChange={(e) => setBannerForm((prev) => ({ ...prev, image_url: e.target.value }))}
                        />
                      </div>

                      {bannerForm.image_url && (
                        <div className="overflow-hidden rounded-lg border border-[#223653] bg-[#0b1727]">
                          <img src={bannerForm.image_url} alt="Preview банер" className="h-32 w-full object-cover" />
                        </div>
                      )}

                      <Input placeholder="Линк при клик, на пр. /products?category=motorni-vozila или /sell (опционално)" value={bannerForm.link_url} onChange={(e) => setBannerForm((prev) => ({ ...prev, link_url: e.target.value }))} />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Приоритетен редослед</label>
                        <Input placeholder="на пр. 0 = прв, 1 = втор, 2 = трет" value={bannerForm.sort_order} onChange={(e) => setBannerForm((prev) => ({ ...prev, sort_order: e.target.value }))} />
                        <p className="text-xs text-slate-400">Колку е помал бројот, толку порано и поприоритетно ќе се прикаже банерот на почетна.</p>
                      </div>

                      <label className="flex items-center gap-3 rounded-lg border border-[#223653] bg-[#0b1727] px-4 py-3 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={bannerForm.is_active}
                          onChange={(e) => setBannerForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                        />
                        Банерот да биде активен и видлив како промотивна позиција на почетна
                      </label>

                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          {editingBannerId ? 'Зачувај измени' : 'Додај промотивен банер'}
                        </Button>
                        {editingBannerId && (
                          <Button type="button" onClick={resetBannerForm} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                            Откажи
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                    <h2 className="mb-4 text-lg font-bold">Активни и достапни промотивни позиции</h2>
                    <div className="space-y-4">
                      {banners.map((banner) => (
                        <div key={banner.id} className="rounded-lg border border-[#223653] bg-[#0b1727] p-4">
                          <div className="flex flex-col gap-4 xl:flex-row">
                            <div className="overflow-hidden rounded-lg border border-[#223653] bg-[#081223] xl:w-[320px]">
                              <img src={banner.image_url} alt={`Банер ${banner.id}`} className="h-28 w-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">Промотивен банер #{banner.id}</h3>
                                  <p className="mt-2 text-xs text-slate-500">Приоритет: {banner.sort_order} · {banner.is_active ? 'Активен и видлив' : 'Скриен'}</p>
                                  {banner.link_url && <p className="mt-1 text-xs text-slate-500">Линк: {banner.link_url}</p>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button type="button" onClick={() => startEditBanner(banner)} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Уреди</Button>
                                  <Button type="button" onClick={() => toggleBannerActive(banner)} className="admin-dark-button bg-emerald-700 hover:bg-emerald-600 text-white">
                                    {banner.is_active ? 'Сокриј' : 'Активирај'}
                                  </Button>
                                  <Button type="button" onClick={() => deleteBanner(banner.id)} className="admin-dark-button bg-red-700 hover:bg-red-600 text-white">Избриши</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {banners.length === 0 && <p className="text-sm text-slate-400">Сè уште нема додадени промотивни банери.</p>}
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </Container>
      </main>
    </>
  );
}
