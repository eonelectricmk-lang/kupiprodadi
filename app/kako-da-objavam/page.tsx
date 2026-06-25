import Link from 'next/link';
import Header from '@/app/components/Header';
import { Container } from '@/app/components/ui';
import { Camera, FileText, MapPin, Phone, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    icon: FileText,
    color: 'text-blue-400',
    num: '01',
    title: 'Регистрирај се или најави се',
    text: 'Создај бесплатна сметка со твојот email. Трае само 30 секунди.',
  },
  {
    icon: Camera,
    color: 'text-yellow-400',
    num: '02',
    title: 'Додај слики',
    text: 'Прикачи до 8 слики со добра осветленост. Огласи со слики добиваат 5x повеќе пораки.',
  },
  {
    icon: FileText,
    color: 'text-green-400',
    num: '03',
    title: 'Пополни ги деталите',
    text: 'Напиши јасен наслов, реална цена и детален опис. Спомни состојба, старост и гаранција.',
  },
  {
    icon: MapPin,
    color: 'text-red-400',
    num: '04',
    title: 'Постави локација',
    text: 'Избери го твојот град и населба. Купувачите лесно ќе те пронајдат.',
  },
  {
    icon: Phone,
    color: 'text-purple-400',
    num: '05',
    title: 'Додај контакт',
    text: 'Внеси телефон или email за да можат купувачите да се јават директно.',
  },
  {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    num: '06',
    title: 'Објави!',
    text: 'Кликни "Објави оглас" и твојот оглас е веднаш видлив за илјадници купувачи.',
  },
];

const TIPS = [
  'Користи природна светлина при фотографирање',
  'Биди искрен за состојбата на производот',
  'Постави реална цена — провери слични огласи',
  'Одговарај брзо на пораки — купувачите не чекаат',
  'Обнови го огласот секои 7 дена за поголема видливост',
];

export default function KakoDaObjawamPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] text-white py-12">
        <Container>
          <div className="max-w-3xl mx-auto">

            <h1 className="text-4xl font-extrabold mb-4">Како да објавам оглас?</h1>
            <p className="text-slate-400 text-lg mb-10">
              За помалку од 2 минути твојот производ може да биде видлив за илјадници купувачи.
            </p>

            <div className="space-y-4 mb-12">
              {STEPS.map(({ icon: Icon, color, num, title, text }) => (
                <div key={num} className="flex gap-5 rounded-xl border border-[#1d2c43] bg-[#081223] p-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#0f1a2b] border border-[#1d2c43] flex items-center justify-center">
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold mb-1">ЧЕКОР {num}</p>
                    <h2 className="text-lg font-bold mb-1">{title}</h2>
                    <p className="text-slate-400 text-sm">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-8 mb-8">
              <h2 className="text-xl font-bold mb-4">💡 Совети за подобар оглас</h2>
              <ul className="space-y-3">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <Link href="/sell">
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition">
                  Објави оглас сега →
                </button>
              </Link>
            </div>

          </div>
        </Container>
      </main>
    </>
  );
}
