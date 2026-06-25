export type HomeCategory = {
  title: string;
  slug: string;
  count: string;
  icon: 'car' | 'home' | 'phone' | 'computer' | 'sofa' | 'shirt' | 'dumbbell' | 'briefcase';
  color: string;
};

export const HOME_CATEGORIES: HomeCategory[] = [
  { title: 'Моторни возила', slug: 'motorni-vozila', count: '12,458', icon: 'car', color: 'text-red-400' },
  { title: 'Недвижности', slug: 'nedviznosti', count: '8,632', icon: 'home', color: 'text-emerald-400' },
  { title: 'Мобилни телефони', slug: 'mobilni-telefoni', count: '15,217', icon: 'phone', color: 'text-violet-400' },
  { title: 'Компјутери и техника', slug: 'kompjuteri', count: '9,315', icon: 'computer', color: 'text-sky-400' },
  { title: 'Дом и градина', slug: 'dom-i-gradina', count: '7,421', icon: 'sofa', color: 'text-amber-400' },
  { title: 'Мода и убавина', slug: 'moda', count: '5,218', icon: 'shirt', color: 'text-pink-400' },
  { title: 'Спорт и рекреација', slug: 'sport', count: '4,091', icon: 'dumbbell', color: 'text-cyan-400' },
  { title: 'Бизнис и индустрија', slug: 'biznis', count: '2,904', icon: 'briefcase', color: 'text-indigo-400' },
];
