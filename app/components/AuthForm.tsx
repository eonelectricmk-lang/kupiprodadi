'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from './ui';
import { useTheme } from '@/app/context/ThemeContext';

type AuthType = 'login' | 'register';

export default function AuthForm({ type }: { type: AuthType }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dark } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Грешка при обработка.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/profile');
    } catch {
      setError('Грешка при конекција.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className={`block text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Е-пошта</label>
        <Input
          type="email"
          name="email"
          placeholder="твоја@пошта.com"
          value={formData.email}
          onChange={handleChange}
          required
          className={
            dark
              ? '!border-[#223653] !bg-[#081223] !text-white placeholder:!text-slate-500 focus:!border-[#2d4f7d] focus:!ring-[#2d4f7d]/30'
              : '!border-slate-300 !bg-white !text-slate-900 placeholder:!text-slate-400 focus:!border-slate-400 focus:!ring-slate-200'
          }
        />
      </div>

      <div className="space-y-1.5">
        <label className={`block text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Лозинка</label>
        <Input
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          className={
            dark
              ? '!border-[#223653] !bg-[#081223] !text-white placeholder:!text-slate-500 focus:!border-[#2d4f7d] focus:!ring-[#2d4f7d]/30'
              : '!border-slate-300 !bg-white !text-slate-900 placeholder:!text-slate-400 focus:!border-slate-400 focus:!ring-slate-200'
          }
        />
      </div>

      {type === 'register' && (
        <>
          <div className="space-y-1.5">
            <label className={`block text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Име</label>
            <Input
              type="text"
              name="name"
              placeholder="Твоето име"
              value={formData.name}
              onChange={handleChange}
              required
              className={
                dark
                  ? '!border-[#223653] !bg-[#081223] !text-white placeholder:!text-slate-500 focus:!border-[#2d4f7d] focus:!ring-[#2d4f7d]/30'
                  : '!border-slate-300 !bg-white !text-slate-900 placeholder:!text-slate-400 focus:!border-slate-400 focus:!ring-slate-200'
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className={`block text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Телефон</label>
            <Input
              type="tel"
              name="phone"
              placeholder="08x xxx xxx"
              value={formData.phone}
              onChange={handleChange}
              className={
                dark
                  ? '!border-[#223653] !bg-[#081223] !text-white placeholder:!text-slate-500 focus:!border-[#2d4f7d] focus:!ring-[#2d4f7d]/30'
                  : '!border-slate-300 !bg-white !text-slate-900 placeholder:!text-slate-400 focus:!border-slate-400 focus:!ring-slate-200'
              }
            />
          </div>
        </>
      )}

      <Button
        variant="primary"
        type="submit"
        className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700"
        disabled={loading}
      >
        {loading ? 'Се учитува...' : type === 'login' ? 'Најави се' : 'Регистрирај се'}
      </Button>
    </form>
  );
}
