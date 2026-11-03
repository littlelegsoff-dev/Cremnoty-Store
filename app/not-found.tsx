import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center pt-16 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-violet-500/15 text-violet-300">
        <Compass className="size-8" />
      </div>
      <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold text-gradient">
        404
      </h1>
      <p className="mt-2 max-w-sm text-[14px] text-violet-100/55">
        Такой страницы нет. Возможно, приложение удалили из каталога или ссылка устарела.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-400"
      >
        Вернуться в каталог
      </Link>
    </div>
  );
}
