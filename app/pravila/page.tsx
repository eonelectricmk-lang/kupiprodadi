import Header from '@/app/components/Header';
import { Container } from '@/app/components/ui';
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  Camera,
  CheckCircle2,
  FileText,
  MessageSquareWarning,
  ShieldCheck,
} from 'lucide-react';

const POSTING_RULES = [
  'Секој оглас мора да има јасен и точен наслов што го опишува производот или услугата.',
  'Описот треба да биде реален, разбирлив и да не содржи лажни тврдења, навреди или спам.',
  'Постави реална цена. Ако цената е по договор, тоа треба јасно да биде означено.',
  'Сликите треба да бидат поврзани со огласот и да ја прикажуваат реалната состојба на предметот.',
  'Не е дозволено да се објавува ист оглас повеќепати во иста или различна категорија.',
  'Секој оглас треба да биде поставен во најсоодветната категорија и локација.',
];

const FORBIDDEN = [
  'Лажни, измамнички или украдени производи.',
  'Оружје, опасни материјали или содржина спротивна на законите во Македонија.',
  'Навредлива, дискриминаторска, експлицитна или незаконска содржина.',
  'Огласи што собираат лични податоци без јасна потреба и согласност.',
  'Промоции што се претставуваат како нормални огласи, а немаат реален производ или услуга.',
  'Туѓи фотографии, брендови или описи користени без дозвола.',
];

const QUALITY = [
  {
    icon: Camera,
    color: 'text-sky-400',
    title: 'Слики',
    text: 'Користи јасни и реални фотографии. Огласи без слики добиваат значително помал интерес.',
  },
  {
    icon: FileText,
    color: 'text-emerald-400',
    title: 'Опис',
    text: 'Напиши состојба, големина, старост, гаранција и сè што е важно за купувачот.',
  },
  {
    icon: BadgeCheck,
    color: 'text-amber-400',
    title: 'Точност',
    text: 'Сите податоци во огласот треба да бидат точни и да одговараат на реалната понуда.',
  },
];

const SAFETY = [
  'Не праќај аванс на непознати лица без претходна проверка.',
  'Комуницирај преку пораките на платформата или преку јасно наведени контакти.',
  'Провери ја состојбата на производот пред купување кога е можно.',
  'Пријави сомнителен оглас или корисник веднаш ако забележиш измама.',
];

const SANCTIONS = [
  'Отстранување на оглас без претходна најава.',
  'Привремено ограничување на објавување нови огласи.',
  'Трајна забрана на корисничка сметка при сериозна или повторена злоупотреба.',
];

export default function PravilaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-12 text-white">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1d2c43] bg-[#081223] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Правила на платформата
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Правила за огласување</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
                За да остане KupiProdadi безбедно, корисно и професионално место за купување и продавање, секој оглас треба да ги следи правилата подолу.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {QUALITY.map(({ icon: Icon, color, title, text }) => (
                <div key={title} className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-6">
                  <Icon className={`mb-3 h-7 w-7 ${color}`} />
                  <h2 className="text-lg font-bold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                <div>
                  <h2 className="text-2xl font-bold">Што треба да содржи секој добар оглас?</h2>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                    {POSTING_RULES.map((rule) => (
                      <li key={rule} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#3a1d27] bg-[#081223] p-7">
              <div className="flex items-start gap-3">
                <Ban className="mt-1 h-6 w-6 flex-shrink-0 text-red-400" />
                <div>
                  <h2 className="text-2xl font-bold">Што не е дозволено?</h2>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                    {FORBIDDEN.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
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
                  <MessageSquareWarning className="mt-1 h-6 w-6 flex-shrink-0 text-sky-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Правила за комуникација и безбедност</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                      {SAFETY.map((tip) => (
                        <li key={tip} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Што следува ако се прекршат правилата?</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                      {SANCTIONS.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-sm leading-6 text-slate-400">
                      Администрацијата има право да прегледа, измени видливост или отстрани оглас ако е во спротивност со овие правила или со важечките закони.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
              <h2 className="text-2xl font-bold">Краток заклучок</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Биди точен, јасен и коректен. Добар оглас со реални фотографии, чесен опис и културна комуникација носи повеќе доверба, побрза продажба и подобро искуство за сите.
              </p>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
