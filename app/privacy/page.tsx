import Header from '@/app/components/Header';
import { Container } from '@/app/components/ui';
import {
  BadgeCheck,
  Database,
  Eye,
  Lock,
  ShieldCheck,
  Share2,
  UserCheck,
} from 'lucide-react';

const DATA_TYPES = [
  'Основни кориснички податоци како име, е-пошта, телефон и локација.',
  'Податоци поврзани со огласите што ги објавуваш, уредуваш или зачувуваш.',
  'Пораки, контакт форми и комуникација што ја праќаш преку платформата.',
  'Технички информации како IP адреса, прелистувач и основни податоци за користење на страницата.',
];

const USAGE = [
  'За креирање и одржување на корисничка сметка.',
  'За објавување, прикажување и уредување на огласи.',
  'За комуникација меѓу корисници и поддршка од администрацијата.',
  'За подобрување на безбедноста, спречување злоупотреба и подобрување на платформата.',
];

const SHARING = [
  'Јавно прикажуваме само податоци што се потребни за огласот, како име на продавач, локација и контакт ако самиот корисник ги внел.',
  'Не продаваме лични податоци на трети страни.',
  'Податоци може да се споделат само кога тоа е законски потребно или за заштита од измама и злоупотреба.',
];

const RIGHTS = [
  'Право да побараш увид во податоците што ги чуваме за тебе.',
  'Право да побараш исправка на неточни податоци.',
  'Право да побараш бришење на сметка и поврзаните податоци кога тоа е возможно.',
  'Право да поставиш прашање или забелешка поврзана со приватноста.',
];

const RETENTION = [
  'Профилните податоци се чуваат додека сметката е активна или додека се потребни за законска и безбедносна цел.',
  'Огласите и комуникацијата може да се чуваат одреден период заради историја, поддршка и заштита од злоупотреба.',
  'По барање за бришење, ќе ги отстраниме или анонимизираме податоците кога тоа е технички и законски возможно.',
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-12 text-white">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1d2c43] bg-[#081223] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Политика за приватност
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Твојата приватност е важна.</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
                Оваа страница објаснува кои податоци ги собираме на KupiProdadi, како ги користиме и како ја штитиме твојата приватност додека ја користиш платформата.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Database,
                  color: 'text-sky-400',
                  title: 'Собирање податоци',
                  text: 'Ги земаме само податоците потребни за сметка, огласи и безбедно користење.',
                },
                {
                  icon: Lock,
                  color: 'text-emerald-400',
                  title: 'Заштита',
                  text: 'Пристапот до податоците е ограничен и се користи за работа и безбедност на платформата.',
                },
                {
                  icon: UserCheck,
                  color: 'text-amber-400',
                  title: 'Твои права',
                  text: 'Имаш право да прашаш, исправиш или побараш бришење на своите податоци.',
                },
              ].map(({ icon: Icon, color, title, text }) => (
                <div key={title} className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-6">
                  <Icon className={`mb-3 h-7 w-7 ${color}`} />
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
              <div className="flex items-start gap-3">
                <Database className="mt-1 h-6 w-6 flex-shrink-0 text-sky-400" />
                <div>
                  <h2 className="text-2xl font-bold">Кои податоци ги собираме?</h2>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                    {DATA_TYPES.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                <div>
                  <h2 className="text-2xl font-bold">Како ги користиме овие податоци?</h2>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                    {USAGE.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <section className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
                <div className="flex items-start gap-3">
                  <Share2 className="mt-1 h-6 w-6 flex-shrink-0 text-pink-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Кога податоците може да се споделат?</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                      {SHARING.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
                <div className="flex items-start gap-3">
                  <Eye className="mt-1 h-6 w-6 flex-shrink-0 text-amber-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Твои права</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                      {RIGHTS.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
              <div className="flex items-start gap-3">
                <Lock className="mt-1 h-6 w-6 flex-shrink-0 text-violet-400" />
                <div>
                  <h2 className="text-2xl font-bold">Колку долго ги чуваме податоците?</h2>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                    {RETENTION.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
              <h2 className="text-2xl font-bold">Контакт за приватност</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Ако имаш прашање, барање или забелешка поврзана со приватноста и твоите податоци, можеш да ни пишеш преку контакт формата на платформата. Ќе одговориме во разумен рок.
              </p>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
