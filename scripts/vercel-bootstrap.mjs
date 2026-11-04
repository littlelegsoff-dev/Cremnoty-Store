/**
 * Подготовка сборки на Vercel.
 *
 * Vercel-проект cremnity-store собирается из минимального «загрузчика»
 * (package.json + этот скрипт): перед сборкой сюда скачивается публичный
 * репозиторий Cremnoty-Store. Это нужно только потому, что у аккаунта
 * Vercel не подключён GitHub Login Connection, поэтому git-деплой недоступен.
 *
 * Если рядом уже лежат исходники (обычный запуск из репозитория),
 * скрипт ничего не скачивает, а только докачивает медиафайлы приложений,
 * которых нет в сборке (иконки, скриншоты, APK).
 */
import { execFileSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const REPO = process.env.CSTORE_REPO ?? 'littlelegsoff-dev/Cremnoty-Store';
const REF = process.env.CSTORE_REF ?? 'main';
const RAW = `https://raw.githubusercontent.com/${REPO}/${REF}`;
const TARBALL = `https://codeload.github.com/${REPO}/tar.gz/refs/heads/${REF}`;

function log(message) {
  console.log(`[cstore-bootstrap] ${message}`);
}

function hasSources() {
  return existsSync('app') && existsSync('components') && existsSync('lib');
}

async function downloadTarball() {
  log(`скачиваю исходники ${REPO}@${REF}`);
  const response = await fetch(TARBALL, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`не удалось скачать исходники: HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const archive = '/tmp/cstore-source.tar.gz';
  writeFileSync(archive, buffer);
  execFileSync('tar', ['-xzf', archive, '--strip-components=1', '-C', '.'], {
    stdio: 'inherit',
  });
  log('исходники распакованы');
}

async function downloadFile(url, destination) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    log(`пропускаю ${destination}: HTTP ${response.status}`);
    return false;
  }
  mkdirSync(dirname(destination), { recursive: true });
  const stream = createWriteStream(destination);
  for await (const chunk of response.body) stream.write(chunk);
  await new Promise((resolve, reject) => {
    stream.end(resolve);
    stream.on('error', reject);
  });
  return true;
}

/** Докачивает медиафайлы приложений, перечисленные в app.json. */
async function ensureMedia() {
  const projectsDir = 'projects';
  if (!existsSync(projectsDir)) return;

  for (const entry of readdirSync(projectsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

    const metaPath = join(projectsDir, entry.name, 'app.json');
    if (!existsSync(metaPath)) continue;

    let meta;
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    } catch {
      log(`не удалось прочитать ${metaPath}`);
      continue;
    }

    const candidates = new Set([
      meta.icon || 'icon.png',
      ...(Array.isArray(meta.screenshots) ? meta.screenshots : []),
      ...(Array.isArray(meta.releases)
        ? meta.releases.map((release) => release?.file).filter(Boolean)
        : []),
    ]);

    for (const candidate of candidates) {
      if (typeof candidate !== 'string') continue;
      if (/^https?:\/\//i.test(candidate)) continue;
      const relative = candidate.replace(/^\.?\//, '');
      const destination = join(projectsDir, entry.name, relative);
      if (existsSync(destination)) continue;
      await downloadFile(
        `${RAW}/projects/${encodeURIComponent(entry.name)}/${relative
          .split('/')
          .map(encodeURIComponent)
          .join('/')}`,
        destination,
      );
    }
  }
}

await (async () => {
  if (!hasSources()) {
    await downloadTarball();
  }
  await ensureMedia();
  log('готово');
})();
