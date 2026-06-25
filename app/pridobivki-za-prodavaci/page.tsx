import Header from '@/app/components/Header';
import { Container } from '@/app/components/ui';
import Link from 'next/link';
import {
  BadgeCheck,
  MessageSquare,
  MonitorSmartphone,
  ShieldCheck,
  Store,
  Users,
  Zap,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Store,
    color: 'text-emerald-400',
    title: 'Твоја дигитална продавница',
    text: 'Со профил на KupiProdadi не објавуваш само оглас, туку градиш свое препознатливо продажно место што купувачите можат повторно да го посетат.',
  },
  {
    icon: MessageSquare,
    color: 'text-sky-400',
    title: 'Побрза комуникација',
    text: 'Прашања, договори и интерес од купувачи стигаат на едно место, без губење време во расфрлани контакти.',
  },
  {
    icon: BadgeCheck,
    color: 'text-amber-400',
    title: 'Повеќе доверба',
    text: 'Полн профил, јасни огласи и добра комуникација му даваат на купувачот сигурност дека купува од сериозен продавач.',
  },
  {
    icon: Zap,
    color: 'text-red-400',
    title: 'Побрза продажба',
    text: 'Добро поставен профил и средени огласи носат поголема видливост, повеќе пораки и подобра шанса за побрза зделка.',
  },
  {
    icon: MonitorSmartphone,
    color: 'text-violet-400',
    title: 'Сè на едно место',
    text: 'Огласи, зачувани ставки, пораки, уредување профил и идни промоции се достапни од еден централен панел.',
  },
  {
    icon: Users,
    color: 'text-pink-400',
    title: 'Изгради публика',
    text: 'Со тек на време купувачите ќе те препознаваат, ќе ти се враќаат и полесно ќе ги следат новите огласи.',
  },
];

const SELLER_STEPS = [
  'Креирај профил со име, контакт и јасни податоци.',
  'Објави оглас со добри слики, наслов и реална цена.',
  'Одговарај брзо на пораки и гради доверба.',
  'Обновувај, уредувај и промовирај ги огласите кога ти е потребно.',
];

export default function PridobivkiZaProdavaciPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-12 text-white">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1d2c43] bg-[#081223] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                За продавачи
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Повеќе од обичен оглас.</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
                Со профил на KupiProdadi добиваш свое продажно присуство, подобра комуникација со купувачите и простор да изградиш доверба, препознатливост и дигитална продавница.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {BENEFITS.map(({ icon: Icon, color, title, text }) => (
                <div key={title} className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-6">
                  <Icon className={`mb-3 h-7 w-7 ${color}`} />
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
                <h2 className="text-2xl font-bold">Што добиваш со профил на KupiProdadi?</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Наместо секој оглас да биде изолиран, профилот ти помага да создадеш континуитет. Купувачот гледа дека си активен, може полесно да ти пише, да ги следи твоите други огласи и побрзо да донесе одлука за купување.
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Подоцна, истиот профил може да расте во уште посилно продавачко присуство: подобрени огласи, промоции, приоритетно позиционирање и јасно организирана понуда на едно место.
                </p>
              </section>

              <section className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
                <h2 className="text-2xl font-bold">Како изгледа добар почеток?</h2>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                  {SELLER_STEPS.map((step) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="mt-8 rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
              <h2 className="text-2xl font-bold">Почни денес</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Ако сакаш поорганизирано продавање, повеќе доверба и подобар контакт со купувачите, креирај профил и постави ги твоите огласи на едно професионално место.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/auth"
                  className="inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Креирај профил
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex rounded-xl border border-[#223653] bg-[#0b1423] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:text-white"
                >
                  Објави оглас
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
