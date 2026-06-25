export type Subcategory = {
  name: string;
  slug: string;
  count?: number;
};

export type Category = {
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
};

export const CATEGORIES: Category[] = [
  {
    name: 'Моторни Возила',
    slug: 'motorni-vozila',
    icon: 'car',
    subcategories: [
      { name: 'Автомобили', slug: 'avtomobili' },
      { name: 'Мотоцикли', slug: 'motocikli' },
      { name: 'Велосипеди', slug: 'velosipedi' },
      { name: 'Резервни делови', slug: 'rezervni-delovi' },
    ],
  },
  {
    name: 'Недвижности',
    slug: 'nedviznosti',
    icon: 'house',
    subcategories: [
      { name: 'Куќи', slug: 'kuki' },
      { name: 'Станови', slug: 'stanovi' },
      { name: 'Земјиште', slug: 'zemjiste' },
      { name: 'Гаражи', slug: 'garazi' },
    ],
  },
  {
    name: 'Дом и Градина',
    slug: 'dom-gradina',
    icon: 'sofa',
    subcategories: [
      { name: 'Намештај', slug: 'namestaj' },
      { name: 'Кујнски прибор', slug: 'kujnski' },
      { name: 'Бела техника', slug: 'bela-tehnika' },
      { name: 'Градински алати', slug: 'gradinski-alati' },
    ],
  },
  {
    name: 'Мода и Облека',
    slug: 'moda-obleka',
    icon: 'shirt',
    subcategories: [
      { name: 'Облека за мажи', slug: 'obleka-mazi' },
      { name: 'Облека за жени', slug: 'obleka-zeni' },
      { name: 'Обувки', slug: 'obuvki' },
      { name: 'Аксесоари', slug: 'aksesoari' },
    ],
  },
  {
    name: 'Мобилни Телефони',
    slug: 'mobilni-telefoni',
    icon: 'smartphone',
    subcategories: [
      { name: 'Мобилни телефони', slug: 'telefoni' },
      { name: 'Таблети', slug: 'tableti' },
      { name: 'Слушалки', slug: 'slusalki' },
      { name: 'Полначи и кабли', slug: 'polnaci-kabli' },
    ],
  },
  {
    name: 'Компјутери',
    slug: 'kompjuteri',
    icon: 'monitor',
    subcategories: [
      { name: 'Лаптопи', slug: 'laptopi' },
      { name: 'Десктоп компјутери', slug: 'desktop-kompjuteri' },
      { name: 'Монитори', slug: 'monitori' },
      { name: 'Периферни уреди', slug: 'periferni-uredi' },
    ],
  },
  {
    name: 'ТВ, Видео и Фото',
    slug: 'tv-video-foto',
    icon: 'tv',
    subcategories: [
      { name: 'Телевизори', slug: 'televizori' },
      { name: 'Видео камери', slug: 'video-kameri' },
      { name: 'Фотоапарати', slug: 'fotoaparati' },
      { name: 'Проектори', slug: 'projektori' },
    ],
  },
  {
    name: 'Музички Инструменти',
    slug: 'muzicki-instrumenti',
    icon: 'guitar',
    subcategories: [
      { name: 'Гитари', slug: 'gitari' },
      { name: 'Клавијатури', slug: 'klavijature' },
      { name: 'Тапани', slug: 'tapani' },
      { name: 'Звучна опрема', slug: 'zvucna-oprema' },
    ],
  },
  {
    name: 'Часовници и Накит',
    slug: 'casovnici-nakit',
    icon: 'watch',
    subcategories: [
      { name: 'Часовници', slug: 'casovnici' },
      { name: 'Прстени', slug: 'prsteni' },
      { name: 'Огрлици', slug: 'ogrlici' },
      { name: 'Наушници', slug: 'naushnici' },
    ],
  },
  {
    name: 'Беби и Деца',
    slug: 'bebi-deca',
    icon: 'baby',
    subcategories: [
      { name: 'Беби опрема', slug: 'bebi-oprema' },
      { name: 'Детска облека', slug: 'detska-obleka' },
      { name: 'Играчки', slug: 'igracki' },
      { name: 'Детски мебел', slug: 'detski-mebel' },
    ],
  },
  {
    name: 'Здравје и Убавина',
    slug: 'zdravje-ubavina',
    icon: 'heart',
    subcategories: [
      { name: 'Козметика', slug: 'kozmetika' },
      { name: 'Здравствена опрема', slug: 'zdravstvena-oprema' },
      { name: 'Фитнес опрема', slug: 'fitnes' },
      { name: 'Парфеми и масла', slug: 'parfemi-masla' },
    ],
  },
  {
    name: 'Музика, Филмови и Медија',
    slug: 'muzika-filmovi-medija',
    icon: 'disc',
    subcategories: [
      { name: 'CD музика', slug: 'cd-muzika' },
      { name: 'DVD филмови', slug: 'dvd-filmovi' },
      { name: 'Винилни плочи', slug: 'vinilni-ploci' },
      { name: 'VHS касети', slug: 'vhs-kaseti' },
    ],
  },
  {
    name: 'Книги и Литература',
    slug: 'knigi-literatura',
    icon: 'book',
    subcategories: [
      { name: 'Романи', slug: 'romani' },
      { name: 'Образовни книги', slug: 'obrazovni-knigi' },
      { name: 'Научна фантастика', slug: 'naucna-fantastika' },
      { name: 'Поезија', slug: 'poezija' },
    ],
  },
  {
    name: 'Канцелариски и Школски прибор',
    slug: 'kancelarijski-skolski',
    icon: 'paperclip',
    subcategories: [
      { name: 'Наливпери и пенкала', slug: 'nalivperi-penkala' },
      { name: 'Тетратки', slug: 'tetratki' },
      { name: 'Хартија', slug: 'hartija' },
      { name: 'Школски торби', slug: 'skolski-torbi' },
    ],
  },
  {
    name: 'Хоби и Животни',
    slug: 'hobi-zivotni',
    icon: 'gamepad',
    subcategories: [
      { name: 'Видеоигри', slug: 'videoigri' },
      { name: 'Колекционерски предмети', slug: 'kolekcionerski-predmeti' },
      { name: 'Хоби материјали', slug: 'hobi-materijali' },
      { name: 'Домашни миленици', slug: 'domashni-milenici' },
    ],
  },
  {
    name: 'Спортска Опрема',
    slug: 'sportska-oprema',
    icon: 'dumbbell',
    subcategories: [
      { name: 'Спортска облека', slug: 'sportska-obleka' },
      { name: 'Фитнес опрема', slug: 'fitnes-oprema' },
      { name: 'Наутичка опрема', slug: 'nauticka-oprema' },
      { name: 'Планинска опрема', slug: 'planinska-oprema' },
    ],
  },
  {
    name: 'Антиквитети и Уметност',
    slug: 'antikvar-umetnost',
    icon: 'palette',
    subcategories: [
      { name: 'Антички предмети', slug: 'anticki-predmeti' },
      { name: 'Уметнички слики', slug: 'umetnicki-sliki' },
      { name: 'Колекционерски монети', slug: 'kolekcionerski-moneti' },
      { name: 'Статуи и скулптури', slug: 'statui-skulpturi' },
    ],
  },
  {
    name: 'Бизнис, Машини и Алати',
    slug: 'biznis-masini-alati',
    icon: 'briefcase',
    subcategories: [
      { name: 'Машини', slug: 'masini' },
      { name: 'Алати', slug: 'alati' },
      { name: 'Работна опрема', slug: 'rabotna-oprema' },
      { name: 'Бизнис услуги', slug: 'biznis-uslugi' },
    ],
  },
  {
    name: 'Храна и Готвење',
    slug: 'hrana-gotvenje',
    icon: 'cooking',
    subcategories: [
      { name: 'Кујнски прибор', slug: 'kujnski-pribor' },
      { name: 'Хранливи суплементи', slug: 'hranlivi-suplemeti' },
      { name: 'Готови јадења', slug: 'gotovi-jadenja' },
      { name: 'Кулинарски рецепти', slug: 'kulinarski-recepti' },
    ],
  },
  {
    name: 'Продавници и Трговија',
    slug: 'prodavnici-trgovija',
    icon: 'cart',
    subcategories: [
      { name: 'Продажни места', slug: 'prodazni-mesta' },
      { name: 'Трговски производи', slug: 'trgovski-proizvodi' },
      { name: 'Комерцијална опрема', slug: 'komercijalna-oprema' },
      { name: 'Франшиза', slug: 'franshiza' },
    ],
  },
  {
    name: 'Услуги и Сервис',
    slug: 'uslugi-servis',
    icon: 'wrench',
    subcategories: [
      { name: 'Поправка електроника', slug: 'popravka-elektronika' },
      { name: 'Одржување на дом', slug: 'odrzuvanje-dom' },
      { name: 'Транспорт услуги', slug: 'transport-uslugi' },
      { name: 'Компјутерски услуги', slug: 'kompjuterski-uslugi' },
    ],
  },
  {
    name: 'Вработување',
    slug: 'vrabotuvanje',
    icon: 'briefcase',
    subcategories: [
      { name: 'Полно работно време', slug: 'polno-vreme' },
      { name: 'Скратено работно време', slug: 'skrateno-vreme' },
      { name: 'Практикантура', slug: 'praktikatura' },
      { name: 'Волонтерство', slug: 'volontiranje' },
    ],
  },
  {
    name: 'Настани и Ноќен Живот',
    slug: 'nastani-nocen-zivot',
    icon: 'calendar',
    subcategories: [
      { name: 'Концерти', slug: 'koncerti' },
      { name: 'Театар', slug: 'teatar' },
      { name: 'Ноќни клубови', slug: 'nocni-klubovi' },
      { name: 'Изложби', slug: 'izlozbi' },
    ],
  },
  {
    name: 'Патувања и Туризам',
    slug: 'patuvanja-turizam',
    icon: 'plane',
    subcategories: [
      { name: 'Авионски билети', slug: 'avionski-bileti' },
      { name: 'Хотели', slug: 'hoteli' },
      { name: 'Туристички пакети', slug: 'turisticki-paketi' },
      { name: 'Изнајмување возила', slug: 'iznajmuvanje-vozila' },
    ],
  },
  {
    name: 'Лични Контакти',
    slug: 'lichni-kontakti',
    icon: 'message',
    subcategories: [
      { name: 'Пријателства', slug: 'prijatelstva' },
      { name: 'Познанство', slug: 'poznanstvo' },
      { name: 'Врски', slug: 'vrski' },
      { name: 'Сместување', slug: 'smestuvanje' },
    ],
  },
  {
    name: 'Останато',
    slug: 'ostatno',
    icon: 'package',
    subcategories: [
      { name: 'Разни производи', slug: 'razni-proizvodi' },
      { name: 'Некласифицирано', slug: 'neklasificirano' },
      { name: 'Други услуги', slug: 'drugi-uslugi' },
      { name: 'Издавање', slug: 'izdavanje' },
    ],
  },
];
