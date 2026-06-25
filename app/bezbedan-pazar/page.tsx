import Header from '@/app/components/Header';
import { Container } from '@/app/components/ui';
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CreditCard,
  MapPin,
  MessageSquareWarning,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

const BUYER_TIPS = [
  'Провери дали описот, сликите и цената изгледаат реално и логично.',
  'Постави дополнителни прашања ако нешто не е јасно пред да договориш купување.',
  'Секогаш барај реални фотографии од предметот, особено ако станува збор за поскап производ.',
  'Состани се на јавно и безбедно место кога е можно.',
];

const SELLER_TIPS = [
  'Опиши го производот искрено и наведи ги сите важни недостатоци.',
  'Не споделувај непотребни лични податоци со непознати лица.',
  'Задржи ја комуникацијата јасна и документирана.',
  'Ако некој притиска премногу брзо или бара необичен начин на плаќање, прекини ја зделката.',
];

const NEVER_DO = [
  'Не праќај аванс или депозит на непроверено лице.',
  'Не отворај сомнителни линкови испратени преку пораки.',
  'Не внесувај картички, лозинки или банкарски информации преку порака или надворешни форми.',
  'Не прифаќај „потврди за уплата“ без реална проверка.',
];

const RED_FLAGS = [
  'Премногу ниска цена без јасно објаснување.',
  'Продавачот или купувачот избегнува нормален разговор и одговори.',
  'Се бара итна уплата или аванс “за да не се пропушти понудата”.',
  'Комуникацијата се префрла на сомнителен линк или странска платформа.',
];

const REPORT_STEPS = [
  'Престани со комуникација ако се чувствуваш небезбедно.',
  'Направи screenshot од пораките, профилот и огласот.',
  'Пријави го огласот или корисникот преку платформата.',
  'Ако има финансиска измама, контактирај ја и банката и надлежните институции.',
];

export default function BezbedanPazarPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-12 text-white">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1d2c43] bg-[#081223] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Безбеден пазар
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Тргувај безбедно</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
                KupiProdadi е место за локално купување и продавање, но најдобрата заштита секогаш почнува од внимателноста на корисникот. Следи ги овие правила за побезбедно искуство.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <section className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
                <div className="flex items-start gap-3">
                  <UserCheck className="mt-1 h-6 w-6 flex-shrink-0 text-sky-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Совети за купувачи</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                      {BUYER_TIPS.map((tip) => (
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
                  <BadgeCheck className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Совети за продавачи</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                      {SELLER_TIPS.map((tip) => (
                        <li key={tip} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 rounded-2xl border border-[#3a1d27] bg-[#081223] p-7">
              <div className="flex items-start gap-3">
                <Ban className="mt-1 h-6 w-6 flex-shrink-0 text-red-400" />
                <div>
                  <h2 className="text-2xl font-bold">Што никогаш не треба да правиш?</h2>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                    {NEVER_DO.map((item) => (
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
                  <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Знаци на ризик</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                      {RED_FLAGS.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#1d2c43] bg-[#081223] p-7">
                <div className="flex items-start gap-3">
                  <MessageSquareWarning className="mt-1 h-6 w-6 flex-shrink-0 text-pink-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Ако се сомневаш на измама</h2>
                    <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                      {REPORT_STEPS.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: CreditCard,
                  color: 'text-sky-400',
                  title: 'Плаќање',
                  text: 'Секогаш проверувај реална трансакција, не screenshot или порака.',
                },
                {
                  icon: MapPin,
                  color: 'text-emerald-400',
                  title: 'Средба',
                  text: 'Избери јавно, осветлено и безбедно место за предавање.',
                },
                {
                  icon: ShieldCheck,
                  color: 'text-amber-400',
                  title: 'Проверка',
                  text: 'Ако нешто изгледа предобро за да биде вистинито, најчесто е ризично.',
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
              <h2 className="text-2xl font-bold">Краток совет</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Не брзај со одлука, поставувај прашања и внимавај на деталите. Безбедното купување и продавање значи помал ризик, повеќе доверба и подобро искуство за сите на платформата.
              </p>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
