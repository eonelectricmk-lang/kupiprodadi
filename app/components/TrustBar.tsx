'use client';

import { BadgeCheck, ShieldCheck, Users, Zap } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import type { HomepageTrustItem } from '@/lib/homepage-sections';

export const DEFAULT_TRUST_ITEMS: HomepageTrustItem[] = [
  { icon: 'shield-check', title: 'Безбедно купување', subtitle: 'Проверени продавачи', color: 'text-blue-400' },
  { icon: 'badge-check', title: '100% Бесплатно', subtitle: 'Објави оглас без надомест', color: 'text-emerald-400' },
  { icon: 'zap', title: 'Брзо и лесно', subtitle: 'Само неколку клика', color: 'text-amber-400' },
  { icon: 'users', title: '10,000+ активни', subtitle: 'Купувачи секој ден', color: 'text-pink-400' },
];

const TRUST_ICONS = {
  'shield-check': ShieldCheck,
  'badge-check': BadgeCheck,
  zap: Zap,
  users: Users,
} as const;

type TrustBarProps = {
  items?: HomepageTrustItem[];
};

export default function TrustBar({ items = DEFAULT_TRUST_ITEMS }: TrustBarProps) {
  const { dark } = useTheme();

  return (
    <div className={`overflow-hidden rounded-2xl border-2 ${dark ? 'border-[#1d2c43]' : 'border-gray-300'}`}>
      <div className={`grid grid-cols-2 divide-x-2 divide-y-2 md:grid-cols-4 md:divide-y-0 ${dark ? 'divide-[#1d2c43]' : 'divide-gray-300'}`}>
        {items.map((item) => {
          const Icon = TRUST_ICONS[item.icon] || ShieldCheck;
          return (
            <div key={`${item.title}-${item.subtitle}`} className={`flex items-center gap-2 px-2.5 py-2.5 ${dark ? 'bg-[#0b1423]' : 'bg-white'}`}>
              <Icon className={`h-4.5 w-4.5 shrink-0 ${item.color}`} />
              <div>
                <p className={`text-[13px] font-semibold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                <p className={`text-[11px] leading-tight ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
