/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // На Vercel Serverless файлы читаются с диска: явно включаем папку projects/
  // в трассировку зависимостей, иначе иконки, скриншоты и APK не попадут в функцию.
  outputFileTracingIncludes: {
    '/**': ['./projects/**/*'],
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
