import type { Metadata } from 'next';
import Link from 'next/link';
import { Code2, ShieldCheck, Zap, HeartHandshake, ArrowRight } from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';

export const metadata: Metadata = {
  title: 'О проекте',
  description: 'Что такое CStore (CremnityStore) и по каким правилам он работает.',
};

const VALUES = [
  {
    icon: <Code2 className="size-5" />,
    title: 'Только открытый код',
    text: 'В каталог попадают приложения с доступным исходным кодом и свободной лицензией. Ссылка на репозиторий указывается в метаданных.',
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: 'Прозрачные сборки',
    text: 'Каждый APK имеет контрольную сумму SHA-256, а метаданные лежат в том же репозитории, что и сам файл — проверить может кто угодно.',
  },
  {
    icon: <Zap className="size-5" />,
    title: 'Быстро и без трекеров',
    text: 'Никакой аналитики, рекламы и скрытых разрешений. Только статичный каталог и прямые ссылки на файлы.',
  },
  {
    icon: <HeartHandshake className="size-5" />,
    title: 'Сообщество',
    text: 'Публикация — это pull request в репозиторий. Любой может предложить приложение, исправить описание или обновить версию.',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-12 sm:pt-16">
      <div className="flex items-center gap-2 text-[12px] text-violet-300/45">
        <Link href="/" className="hover:text-violet-200">
          Каталог
        </Link>
        <span>/</span>
        <span className="text-violet-200/80">О проекте</span>
      </div>

      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
        CremnityStore — открытая альтернатива магазинам приложений
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-violet-100/60">
        CStore — это каталог Android-приложений, который целиком живёт в Git-репозитории. Каждое
        приложение — папка с метаданными, иконкой, скриншотами и APK-файлом. Сайт просто читает
        эти папки и превращает их в удобный каталог.
      </p>

      <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
        {VALUES.map((value) => (
          <div key={value.title} className="glass rounded-3xl p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
              {value.icon}
            </span>
            <h2 className="mt-3.5 text-[15px] font-semibold text-violet-50">{value.title}</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-violet-100/55">{value.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 grid gap-3.5 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-violet-50">Как это работает</h2>
          <ol className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-violet-100/60">
            {[
              'Разработчик добавляет папку приложения в projects/ и заполняет app.json.',
              'Кладёт рядом иконку, скриншоты и собранный APK.',
              'Открывает pull request — после ревью каталог автоматически обновляется.',
              'Пользователь открывает сайт и скачивает APK напрямую из репозитория.',
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-violet-500/20 text-[11.5px] font-semibold text-violet-200">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Link
            href="/docs"
            className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-violet-300 hover:text-violet-100"
          >
            Формат метаданных <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-violet-50">Правила каталога</h2>
          <ul className="mt-4 space-y-2.5 text-[13.5px] leading-relaxed text-violet-100/60">
            {[
              'Приложение должно распространяться по свободной лицензии.',
              'Сборка должна соответствовать опубликованному исходному коду.',
              'Запрещены трекеры, скрытая реклама и вредоносный код.',
              'Название, описание и иконка заполняются на русском или английском.',
              'Разработчик подтверждает право на публикацию сборки.',
            ].map((rule) => (
              <li key={rule} className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="mt-12 scroll-mt-24">
        <div className="relative overflow-hidden rounded-4xl border border-violet-400/15 bg-gradient-to-br from-violet-600/25 via-ink-900/70 to-ink-950 p-7 sm:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-violet-500/25 blur-[90px]"
            aria-hidden
          />
          <h2 className="relative font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-violet-50">
            Связаться с командой
          </h2>
          <p className="relative mt-2 max-w-lg text-[14px] text-violet-100/60">
            Вопросы по публикации, жалобы на приложения и предложения — через issues в GitHub
            репозитории.
          </p>
          <a
            href="https://github.com/littlelegsoff-dev/Cremnoty-Store/issues"
            target="_blank"
            rel="noreferrer"
            className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            <GithubIcon className="size-4" />
            Открыть GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
