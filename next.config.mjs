/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const isStaticExport = process.env.STATIC_EXPORT === 'true'

const nextConfig = {
  ...(isStaticExport
    ? {
        output: 'export',
        trailingSlash: true,
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
