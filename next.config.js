/** @type {import('next').NextConfig} */
const nextConfig = {
  // `serverComponentsExternalPackages` Next.js'in yeni sürümlerinde ana yapılandırma seviyesine taşındı.
  serverExternalPackages: ['ewelink-api-next'],
  
  // Webpack yapılandırmasını özelleştirme
  webpack: (config, { isServer }) => {
    // Sadece sunucu tarafı derlemeler için geçerli olan bazı Node.js modüllerini harici olarak işaretle
    if (isServer) {
      config.externals.push('log4js'); // log4js'i sunucu tarafında harici olarak ele al
    }
    
    // Log4js'in kendisinin veya ewelink-api-next'in içindeki dinamik import sorununu çözmek için
    // Node.js'e özgü modülleri istemci paketine dahil etmeyin.
    // Bu, bazı durumlarda dynamic import sorunlarını da çözebilir.
    config.resolve.fallback = {
      ...config.resolve.fallback, // Mevcut fallback'leri koru
      "fs": false, // log4js gibi bazı kütüphaneler fs kullanabilir
      "path": false,
      "os": false,
      "net": false,
      "tls": false,
      "child_process": false,
      "util": false, // `util` gibi çekirdek Node.js modülleri
      "stream": false,
      "crypto": false,
      "http": false,
      "https": false,
      "url": false,
      "zlib": false,
      "constants": false
    };

    return config;
  },
};

module.exports = nextConfig;
