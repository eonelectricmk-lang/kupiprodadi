import Header from '@/app/components/Header';
import { Container } from '@/app/components/ui';
import { ShieldCheck, Zap, Users, BadgeCheck } from 'lucide-react';

export default function ZaNasPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] text-white py-12">
        <Container>
          <div className="max-w-3xl mx-auto">

            <h1 className="text-4xl font-extrabold mb-4">За КупиПродади</h1>
            <p className="text-slate-400 text-lg mb-10">
              Македонска платформа за купување и продавање — бесплатно, безбедно и лесно.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {[
                { icon: ShieldCheck, color: 'text-blue-400', title: 'Безбедност', text: 'Верифицирани продавачи и заштита на купувачите при секоја трансакција.' },
                { icon: Zap, color: 'text-yellow-400', title: 'Брзина', text: 'Постави оглас за помалку од 2 минути. Без компликации.' },
                { icon: Users, color: 'text-green-400', title: 'Заедница', text: 'Повеќе од 10.000 активни корисници ширум Македонија секој ден.' },
                { icon: BadgeCheck, color: 'text-red-400', title: 'Бесплатно', text: 'Огласувањето е целосно бесплатно. Без скриени трошоци.' },
              ].map(({ icon: Icon, color, title, text }) => (
                <div key={title} className="rounded-xl border border-[#1d2c43] bg-[#081223] p-6">
                  <Icon className={`h-8 w-8 mb-3 ${color}`} />
                  <h2 className="text-lg font-bold mb-2">{title}</h2>
                  <p className="text-slate-400 text-sm">{text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Нашата мисија</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                КупиПродади е создадена со цел да им овозможи на граѓаните на Македонија едноставен и безбеден начин за купување и продавање на производи локално.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                Веруваме дека секој треба да може да продаде непотребна ствар или да најде добра понуда — без да плати провизија, без да чека со денови и без да се грижи за безбедноста.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Платформата е отворена за сите — поединци, мали бизниси и трговци. Доколку имаш нешто за продавање, ние сме тука за тебе.
              </p>
            </div>

            <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-8">
              <h2 className="text-2xl font-bold mb-4">Контактирај не</h2>
              <p className="text-slate-300 mb-2">📧 info@kupiprodadi.mk</p>
              <p className="text-slate-300 mb-2">📍 Скопје, Македонија</p>
              <p className="text-slate-400 text-sm mt-4">Работно време: Понеделник — Петок, 09:00 — 17:00</p>
            </div>

          </div>
        </Container>
      </main>
    </>
  );
}
