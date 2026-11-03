import type { Metadata } from 'next';
import Link from 'next/link';
import { FolderTree, FileJson, Image as ImageIcon, Package, Terminal, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Добавить приложение',
  description: 'Структура папки приложения и формат app.json для каталога CStore.',
};

const FIELDS: { key: string; type: string; required?: boolean; description: string }[] = [
  { key: 'name', type: 'string', required: true, description: 'Название приложения в каталоге.' },
  { key: 'packageId', type: 'string', required: true, description: 'Идентификатор пакета, например com.example.notes.' },
  { key: 'summary', type: 'string', required: true, description: 'Короткое описание в одну строку для карточки.' },
  { key: 'description', type: 'string', description: 'Полное описание. Переносы строк сохраняются.' },
  { key: 'developer', type: 'string', description: 'Имя автора или команды.' },
  { key: 'developerUrl', type: 'url', description: 'Сайт разработчика.' },
  { key: 'license', type: 'string', description: 'Лицензия: GPL-3.0, MIT, Apache-2.0 и т.д.' },
  { key: 'categories', type: 'string[]', description: 'Категории для фильтров каталога.' },
  { key: 'tags', type: 'string[]', description: 'Дополнительные теги, участвуют в поиске.' },
  { key: 'icon', type: 'path', description: 'Путь к иконке. По умолчанию ищется icon.png.' },
  { key: 'screenshots', type: 'path[]', description: 'Список файлов скриншотов.' },
  { key: 'website', type: 'url', description: 'Страница приложения.' },
  { key: 'sourceCode', type: 'url', description: 'Ссылка на репозиторий с исходным кодом.' },
  { key: 'issueTracker', type: 'url', description: 'Ссылка на трекер задач.' },
  { key: 'donate', type: 'url', description: 'Ссылка на донаты.' },
  { key: 'featured', type: 'boolean', description: 'Попадает в блок «Выбор редакции» на главной.' },
  { key: 'antiFeatures', type: 'string[]', description: 'Например: nonFreeAssets, tracking.' },
  { key: 'permissions', type: 'string[]', description: 'Список разрешений Android.' },
  { key: 'addedAt', type: 'date', description: 'Дата добавления (YYYY-MM-DD). Влияет на сортировку «Новинки».' },
  { key: 'releases', type: 'object[]', description: 'Список версий: version, versionCode, date, size, file, sha256, minSdk, targetSdk, changelog.' },
];

const TEMPLATE = `{
  "name": "CremNotes",
  "packageId": "com.cremnity.notes",
  "summary": "Лёгкие заметки с Markdown и синхронизацией по Wi-Fi",
  "description": "CremNotes — быстрые заметки без аккаунтов и облака.\\n\\n• Markdown и задачи\\n• Локальное шифрование\\n• Экспорт в файл",
  "developer": "Cremnity Labs",
  "developerUrl": "https://github.com/littlelegsoff-dev",
  "license": "GPL-3.0",
  "categories": ["Заметки", "Продуктивность"],
  "tags": ["markdown", "офлайн", "без рекламы"],
  "icon": "icon.png",
  "screenshots": ["screenshots/1.png", "screenshots/2.png", "screenshots/3.png"],
  "sourceCode": "https://github.com/littlelegsoff-dev/Cremnoty-Store",
  "issueTracker": "https://github.com/littlelegsoff-dev/Cremnoty-Store/issues",
  "website": null,
  "donate": null,
  "featured": true,
  "antiFeatures": [],
  "permissions": ["android.permission.INTERNET", "android.permission.POST_NOTIFICATIONS"],
  "addedAt": "2026-11-03",
  "releases": [
    {
      "version": "1.2.0",
      "versionCode": 120,
      "date": "2026-11-03",
      "size": 1258291,
      "file": "cremnotes-1.2.0.apk",
      "sha256": "9f2c...e41d",
      "minSdk": 24,
      "targetSdk": 35,
      "changelog": "Новая тема оформления и экспорт в PDF."
    },
    {
      "version": "1.1.0",
      "versionCode": 110,
      "date": "2026-09-18",
      "size": 1211000,
      "file": "cremnotes-1.1.0.apk",
      "minSdk": 24,
      "targetSdk": 35,
      "changelog": "Исправлена синхронизация."
    }
  ]
}`;

const TREE = `projects/
├── info.txt              # заметка (необязательно)
└── cremnotes/            # ← папка приложения, отсюда берётся slug
    ├── app.json          # метаданные приложения
    ├── icon.png          # иконка 512×512
    ├── screenshots/
    │   ├── 1.png
    │   ├── 2.png
    │   └── 3.png
    ├── cremnotes-1.2.0.apk
    └── cremnotes-1.1.0.apk`;

export default function DocsPage() {
  return (
    <div className="pt-12 sm:pt-16">
      <div className="flex items-center gap-2 text-[12px] text-violet-300/45">
        <Link href="/" className="hover:text-violet-200">
          Каталог
        </Link>
        <span>/</span>
        <span className="text-violet-200/80">Документация</span>
      </div>

      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
        Как добавить приложение
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-violet-100/60">
        Каталог собирается автоматически из папки <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12.5px] text-violet-200">projects/</code>.
        Достаточно создать папку, положить <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12.5px] text-violet-200">app.json</code>,
        иконку, скриншоты и APK — приложение появится на сайте после деплоя.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { icon: <FolderTree className="size-3.5" />, label: 'Структура папки', href: '#structure' },
          { icon: <FileJson className="size-3.5" />, label: 'Шаблон app.json', href: '#template' },
          { icon: <ImageIcon className="size-3.5" />, label: 'Медиа', href: '#media' },
          { icon: <Package className="size-3.5" />, label: 'Публикация', href: '#publish' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/15 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-violet-100/70 hover:border-violet-400/35 hover:text-violet-50"
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>

      <section id="structure" className="mt-10 scroll-mt-24">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-violet-50">
          1. Структура папки
        </h2>
        <p className="mt-2 text-[13.5px] text-violet-100/55">
          Имя папки становится идентификатором (slug) и используется в ссылках и API. Используйте
          латиницу в нижнем регистре, цифры и дефисы.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-3xl border border-violet-400/15 bg-ink-900/80 p-5 font-mono text-[12.5px] leading-relaxed text-violet-200/80">
          <code>{TREE}</code>
        </pre>
      </section>

      <section id="template" className="mt-12 scroll-mt-24">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-violet-50">
          2. Шаблон app.json
        </h2>
        <p className="mt-2 text-[13.5px] text-violet-100/55">
          Полностью заполненный пример — можно скопировать и заменить значения. Формат
          поддерживает и YAML: <code className="font-mono text-violet-200/80">app.yml</code>.
        </p>
        <pre className="mt-4 max-h-[520px] overflow-auto rounded-3xl border border-violet-400/15 bg-ink-900/80 p-5 font-mono text-[12.5px] leading-relaxed text-violet-200/80">
          <code>{TEMPLATE}</code>
        </pre>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-violet-50">
          Поля метаданных
        </h2>
        <div className="mt-4 overflow-hidden rounded-3xl border border-violet-400/12">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wide text-violet-300/60">
              <tr>
                <th className="px-4 py-2.5 font-medium">Поле</th>
                <th className="px-4 py-2.5 font-medium">Тип</th>
                <th className="px-4 py-2.5 font-medium">Описание</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-400/8">
              {FIELDS.map((field) => (
                <tr key={field.key} className="align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-violet-100">
                    {field.key}
                    {field.required && <span className="ml-1 text-violet-400">*</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11.5px] text-violet-300/50">
                    {field.type}
                  </td>
                  <td className="px-4 py-2.5 text-violet-100/55">{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-violet-300/40">* — обязательные поля.</p>
      </section>

      <section id="media" className="mt-12 scroll-mt-24">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-violet-50">
          3. Медиа и APK
        </h2>
        <ul className="mt-3 space-y-2 text-[13.5px] text-violet-100/60">
          <li>• Иконка: PNG/SVG, 512×512, имя по умолчанию — <code className="font-mono text-violet-200/80">icon.png</code>.</li>
          <li>• Скриншоты: PNG/JPG, портретные, шириной 1080 px.</li>
          <li>• APK: кладётся прямо в папку приложения; имя указывается в поле <code className="font-mono text-violet-200/80">file</code> у релиза.</li>
          <li>• Если файл APK большой, положите его в Releases GitHub и укажите полный <code className="font-mono text-violet-200/80">url</code> в релизе.</li>
        </ul>
      </section>

      <section id="publish" className="mt-12 scroll-mt-24">
        <div className="relative overflow-hidden rounded-4xl border border-violet-400/15 bg-gradient-to-br from-violet-600/25 via-ink-900/70 to-ink-950 p-7 sm:p-9">
          <div
            className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-violet-500/25 blur-[90px]"
            aria-hidden
          />
          <h2 className="relative flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-bold text-violet-50">
            <Terminal className="size-5 text-violet-300" />
            4. Публикация
          </h2>
          <pre className="relative mt-4 overflow-x-auto rounded-2xl bg-ink-950/80 p-4 font-mono text-[12.5px] leading-relaxed text-violet-200/80">
            <code>{`git checkout -b app/cremnotes
git add projects/cremnotes
git commit -m "Add CremNotes"
git push origin app/cremnotes`}</code>
          </pre>
          <p className="relative mt-3 text-[13.5px] text-violet-100/60">
            После пуша откройте pull request в репозиторий. После мержа Vercel пересоберёт сайт и
            приложение появится в каталоге автоматически.
          </p>
          <a
            href="https://github.com/littlelegsoff-dev/Cremnoty-Store"
            target="_blank"
            rel="noreferrer"
            className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Перейти в репозиторий <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-violet-50">
          Публичный API
        </h2>
        <p className="mt-2 text-[13.5px] text-violet-100/55">
          Каталог доступен в JSON — можно использовать для своего клиента или виджета.
        </p>
        <div className="mt-4 space-y-2">
          {[
            { method: 'GET', path: '/api/apps', text: 'Список всех приложений и категорий' },
            { method: 'GET', path: '/api/apps/cremnotes', text: 'Полные метаданные приложения по slug' },
            { method: 'GET', path: '/projects/cremnotes/icon.png', text: 'Файлы приложения (иконки, скриншоты, APK)' },
          ].map((route) => (
            <div
              key={route.path}
              className="flex flex-col gap-1 rounded-2xl border border-violet-400/12 bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="w-fit rounded-md bg-violet-500/20 px-2 py-0.5 font-mono text-[11px] text-violet-200">
                {route.method}
              </span>
              <code className="font-mono text-[12.5px] text-violet-100/80">{route.path}</code>
              <span className="text-[12.5px] text-violet-300/45 sm:ml-auto">{route.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
