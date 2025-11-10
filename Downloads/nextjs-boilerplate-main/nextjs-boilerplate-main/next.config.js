/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para melhorar hot reload
  reactStrictMode: true,
  swcMinify: true,
  
  // Permitir servir arquivos estáticos da pasta public
  images: {
    domains: [],
  },
  
  // Configurações de desenvolvimento para hot reload
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Verifica mudanças a cada segundo (útil no Windows)
        aggregateTimeout: 300, // Aguarda 300ms antes de recompilar
        ignored: /node_modules/, // Ignora node_modules para melhor performance
      };
    }
    return config;
  },
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  // Redirecionamentos para garantir que banner.jpg sempre funcione
  async rewrites() {
    return [
      // Se alguém tentar acessar variações do banner, redireciona para banner.jpg
      {
        source: '/images/1banner.jpg',
        destination: '/images/banner.jpg',
      },
      {
        source: '/images/banner.png',
        destination: '/images/banner.jpg',
      },
      {
        source: '/images/banner.jpeg',
        destination: '/images/banner.jpg',
      },
      {
        source: '/images/banner.webp',
        destination: '/images/banner.jpg',
      },
    ];
  },
};

module.exports = nextConfig;

