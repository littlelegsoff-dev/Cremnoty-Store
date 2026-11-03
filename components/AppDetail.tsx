'use client';

import { useEffect, useState } from 'react';
import type { AppRecord } from '@/lib/types';
import { formatBytes, formatDate } from '@/lib/format';
import { AppIcon } from './AppIcon';
import { Download, X, ExternalLink, ChevronDown, Copy, Check, Info, ShieldCheck } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

export function AppDetail({ app, onClose }: { app: AppRecord; onClose: () => void }) {
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const latest = app.releases[0];

  return (
    <div className="fixed inset-0 z-[80] flex justify-center overflow-y-auto bg-ink-950/80 p-3 backdrop-blur-md sm:p-6">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="fixed inset-0 -z-10 cursor-default"
      />
      <div className="animate-fade-up relative my-6 w-full max-w-3xl overflow-hidden rounded-4xl border border-violet-400/20 bg-ink-900/95 shadow-[0_40px_120px_-30px_rgba(124,58,237,0.6)]">
        <div className="relative border-b border-violet-400/10 bg-gradient-to-br from-violet-600/25 via-ink-900 to-ink-900 p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-violet-500/30 blur-[90px]"
            aria-hidden
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl border border-violet-400/20 bg-white/[0.04] text-violet-200 transition hover:bg-white/10"
            aria-label="Закрыть"
          >
            <X className="size-4" />
          </button>

          <div className="relative flex items-start gap-4 sm:gap-5">
            <AppIcon src={app.iconUrl} name={app.name} size={84} rounded="rounded-[22px]" />
            <div className="min-w-0 pt-1">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-violet-50">
                {app.name}
              </h2>
              <p className="mt-0.5 text-sm text-violet-200/70">{app.developer}</p>
              <p className="mt-1 font-mono text-[11.5px] text-violet-300/45">{app.packageId}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {app.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-2">
            <a
              href={latest?.downloadUrl ?? '#'}
              download
              className={`inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 ${
                latest?.downloadUrl ? '' : 'pointer-events-none opacity-50'
              }`}
            >
              <Download className="size-4" />
              Скачать APK · {formatBytes(app.size)}
            </a>
            {app.sourceCode && (
              <a
                href={app.sourceCode}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-white/[0.03] px-4 py-2.5 text-sm text-violet-100/80 transition hover:bg-white/[0.07]"
              >
                <GithubIcon className="size-4" />
                Исходный код
              </a>
            )}
            {app.website && (
              <a
                href={app.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-white/[0.03] px-4 py-2.5 text-sm text-violet-100/80 transition hover:bg-white/[0.07]"
              >
                <ExternalLink className="size-4" />
                Сайт
              </a>
            )}
          </div>
        </div>

        <div className="space-y-7 p-6 sm:p-8">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-300/60">
              Описание
            </h3>
            <p className="mt-2.5 whitespace-pre-line text-[14px] leading-relaxed text-violet-100/70">
              {app.description}
            </p>
          </section>

          {app.screenshots.length > 0 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-300/60">
                Скриншоты
              </h3>
              <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
                {app.screenshots.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={app.name}
                    loading="lazy"
                    className="h-64 w-auto snap-start rounded-2xl border border-violet-400/15 object-cover"
                  />
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="Лицензия" value={app.license} />
            <InfoTile label="Версия" value={`${app.version} (${app.versionCode})`} />
            <InfoTile label="Обновлено" value={formatDate(app.updatedAt)} />
            <InfoTile label="Добавлено" value={formatDate(app.addedAt)} />
            <InfoTile label="Минимальный Android" value={app.minSdk ? `API ${app.minSdk}` : '—'} />
            <InfoTile label="Целевой Android" value={app.targetSdk ? `API ${app.targetSdk}` : '—'} />
          </section>

          {app.permissions.length > 0 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-300/60">
                Разрешения
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {app.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-lg bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-violet-200/65"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <button
              type="button"
              onClick={() => setShowChangelog((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-violet-400/15 bg-white/[0.03] px-4 py-3 text-left text-[13px] font-medium text-violet-100/80 transition hover:bg-white/[0.06]"
            >
              <span>Все версии ({app.releases.length})</span>
              <ChevronDown
                className={`size-4 transition-transform ${showChangelog ? 'rotate-180' : ''}`}
              />
            </button>

            {showChangelog && (
              <ul className="mt-3 space-y-2">
                {app.releases.map((release) => (
                  <li
                    key={`${release.version}-${release.versionCode}`}
                    className="rounded-2xl border border-violet-400/10 bg-white/[0.02] p-3.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-violet-50">v{release.version}</span>
                      <span className="text-[11.5px] text-violet-300/50">
                        {formatDate(release.date)} · {formatBytes(release.size)}
                      </span>
                      {release.downloadUrl && (
                        <a
                          href={release.downloadUrl}
                          download
                          className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-violet-300 hover:text-violet-100"
                        >
                          <Download className="size-3.5" /> скачать
                        </a>
                      )}
                    </div>
                    {release.changelog && (
                      <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-violet-100/55">
                        {release.changelog}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {app.sha256 && <Checksum value={app.sha256} />}

          <section className="flex items-start gap-2.5 rounded-2xl border border-violet-400/10 bg-violet-500/[0.06] p-3.5 text-[12.5px] leading-relaxed text-violet-200/60">
            <Info className="mt-0.5 size-4 shrink-0 text-violet-300/70" />
            <span>
              Установка: скачайте APK на устройство и откройте файл. Для установки из сторонних
              источников разрешите установку для браузера в настройках Android.
            </span>
          </section>

          <div className="flex items-center gap-2 text-[11.5px] text-violet-300/40">
            <ShieldCheck className="size-3.5" />
            Данные взяты из открытого репозитория Cremnoty-Store
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-violet-400/10 bg-white/[0.02] px-3.5 py-2.5">
      <div className="text-[10.5px] uppercase tracking-[0.12em] text-violet-300/50">{label}</div>
      <div className="mt-0.5 truncate text-[13px] font-medium text-violet-50">{value}</div>
    </div>
  );
}

function Checksum({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-violet-300/60">
        SHA-256
      </h3>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-violet-400/10 bg-white/[0.02] px-3.5 py-2.5">
        <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-violet-200/60">
          {value}
        </code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="shrink-0 rounded-lg border border-violet-400/15 px-2 py-1 text-[11px] text-violet-200/70 hover:bg-white/5"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </section>
  );
}
