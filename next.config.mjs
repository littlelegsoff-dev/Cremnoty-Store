/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Иконки и скриншоты приложений лежат в папках проектов и раздаются локально,
    // но внешние ссылки (например, GitHub raw) тоже разрешены.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
