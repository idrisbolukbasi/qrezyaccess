/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bu ayar, 'ewelink-api-next' paketinin sunucu tarafında doğru şekilde çalışması için gereklidir.
  serverExternalPackages: ['ewelink-api-next'],
};

module.exports = nextConfig;
