import Link from 'next/link';
import { Logo, Wordmark } from './Logo';

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-violet-400/10 bg-ink-950/60">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <Wordmark />
          </div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-violet-100/45">
            Открытый каталог приложений от сообщества Cremnity. Все сборки лежат в открытом
            репозитории — без трекеров, без скрытых установок.
          </p>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-violet-300/70">
            Каталог
          </h4>
          <ul className="mt-4 space-y-2.5 text-[13px] text-violet-100/55">
            <li>
              <Link className="hover:text-violet-200" href="/">
                Все приложения
              </Link>
            </li>
            <li>
              <Link className="hover:text-violet-200" href="/categories">
                Категории
              </Link>
            </li>
            <li>
              <Link className="hover:text-violet-200" href="/?sort=newest">
                Новинки
              </Link>
            </li>
            <li>
              <Link className="hover:text-violet-200" href="/?sort=updated">
                Обновления
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-violet-300/70">
            Разработчикам
          </h4>
          <ul className="mt-4 space-y-2.5 text-[13px] text-violet-100/55">
            <li>
              <Link className="hover:text-violet-200" href="/docs">
                Формат метаданных
              </Link>
            </li>
            <li>
              <Link className="hover:text-violet-200" href="/docs#structure">
                Структура папки
              </Link>
            </li>
            <li>
              <Link className="hover:text-violet-200" href="/api/apps">
                Публичный API
              </Link>
            </li>
            <li>
              <Link className="hover:text-violet-200" href="/about">
                Политика каталога
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-violet-300/70">
            Ссылки
          </h4>
          <ul className="mt-4 space-y-2.5 text-[13px] text-violet-100/55">
            <li>
              <a
                className="hover:text-violet-200"
                href="https://github.com/littlelegsoff-dev/Cremnoty-Store"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a className="hover:text-violet-200" href="/feed.xml">
                RSS-лента
              </a>
            </li>
            <li>
              <Link className="hover:text-violet-200" href="/about#contact">
                Связаться
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-violet-400/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-[12px] text-violet-100/35 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} CremnityStore · CStore</span>
          <span>Сделано сообществом. Работает на открытых данных.</span>
        </div>
      </div>
    </footer>
  );
}
