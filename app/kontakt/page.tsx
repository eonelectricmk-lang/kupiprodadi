'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { Container } from '@/app/components/ui';
import { Mail, Phone, User, MessageSquare, ChevronDown } from 'lucide-react';

const PREDMETI = [
  'Одбери',
  'Проблем со оглас',
  'Заборавена лозинка',
  'Пријава на корисник',
  'Техничка поддршка',
  'Соработка и рекламирање',
  'Друго',
];

export default function KontaktPage() {
  const [predmet, setPredmet] = useState('Одбери');
  const [captchaVal, setCaptchaVal] = useState('');
  const [sent, setSent] = useState(false);

  const a = 7, b = 3;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (parseInt(captchaVal) !== a + b) {
      alert('Погрешен резултат. Обиди се повторно.');
      return;
    }
    setSent(true);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] text-white py-12">
        <Container>
          <div className="max-w-2xl mx-auto">

            <h1 className="text-4xl font-extrabold mb-3">Контактирајте не</h1>

            {/* Инфо порака */}
            <div className="rounded-xl border border-blue-800 bg-blue-950/40 p-5 mb-8 text-sm text-blue-200 leading-relaxed">
              <p className="mb-2">
                Пред да ни напишете, прочитајте ги изјавите и често поставуваните прашања. Можеби одговорот на Вашето прашање е тука.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <Link href="/pravila" className="underline hover:text-white transition">
                  Правила и изјави
                </Link>
                <Link href="/kako-da-objavam" className="underline hover:text-white transition">
                  Често поставувани прашања
                </Link>
                <Link href="/auth?reset=1" className="underline hover:text-white transition">
                  Заборавена лозинка? Кликнете тука
                </Link>
                <Link href="/sell" className="underline hover:text-white transition">
                  За да внесете оглас, кликнете тука
                </Link>
              </div>
            </div>

            {sent ? (
              <div className="rounded-xl border border-green-700 bg-green-950/40 p-8 text-center">
                <p className="text-2xl font-bold text-green-400 mb-2">✅ Пораката е испратена!</p>
                <p className="text-slate-300">Ќе ви одговориме во рок од 24 часа.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Ime */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Вашето Име</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="text"
                      placeholder="Марко Марковски"
                      className="w-full bg-[#081223] border border-[#1d2c43] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Вашиот Е-Маил</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="email"
                      placeholder="ime@primer.mk"
                      className="w-full bg-[#081223] border border-[#1d2c43] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Predmet */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Предмет</label>
                  <div className="relative">
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                    <select
                      required
                      value={predmet}
                      onChange={e => setPredmet(e.target.value)}
                      className="w-full bg-[#081223] border border-[#1d2c43] rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 transition"
                    >
                      {PREDMETI.map(p => (
                        <option key={p} value={p} disabled={p === 'Одбери'}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Вашиот Телефон <span className="text-slate-500">(незадолжително)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="+389 70 000 000"
                      className="w-full bg-[#081223] border border-[#1d2c43] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Poraka */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Текст на пораката</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <textarea
                      required
                      rows={5}
                      placeholder="Опишете го Вашето прашање или проблем..."
                      className="w-full bg-[#081223] border border-[#1d2c43] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition resize-none"
                    />
                  </div>
                </div>

                {/* Captcha */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Внесете го точниот резултат: <span className="text-white font-bold">{a} + {b} = ?</span>
                  </label>
                  <input
                    required
                    type="number"
                    value={captchaVal}
                    onChange={e => setCaptchaVal(e.target.value)}
                    placeholder="Вашиот одговор"
                    className="w-32 bg-[#081223] border border-[#1d2c43] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-lg transition"
                >
                  Испрати порака
                </button>

              </form>
            )}

          </div>
        </Container>
      </main>
    </>
  );
}
