'use client';

import { useState } from 'react';

const GRADIENTS = [
  'from-violet-400 to-violet-700',
  'from-fuchsia-400 to-violet-600',
  'from-indigo-400 to-violet-700',
  'from-purple-300 to-indigo-600',
  'from-violet-300 to-fuchsia-600',
];

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

export function AppIcon({
  src,
  name,
  size = 56,
  rounded = 'rounded-2xl',
  className = '',
}: {
  src?: string;
  name: string;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const gradient = GRADIENTS[hash(name) % GRADIENTS.length];

  if (!src || broken) {
    return (
      <span
        className={`grid shrink-0 place-items-center bg-gradient-to-br ${gradient} font-[family-name:var(--font-display)] font-bold text-white ${rounded} ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setBroken(true)}
      className={`shrink-0 bg-ink-800 object-cover ring-1 ring-inset ring-white/10 ${rounded} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
