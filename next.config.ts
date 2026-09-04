import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd()
  },
  allowedDevOrigins: ['172.20.10.2'],
  typescript: {
    tsconfigPath: './tsconfig.json'
  },
  // Standalone output is only needed for the Docker image used by the CI
  // security scans (Trivy image scan + OWASP ZAP). Vercel builds must NOT
  // use it, so the Dockerfile opts in via BUILD_STANDALONE=true.
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  experimental: {
    serverComponentsHmrCache: false
  },
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  redirects: async () => {
    return [
      {
        source: '/dashboard',
        destination: '/developers/dashboard',
        permanent: true
      }
    ]
  },
  headers: async () => {
    // Security headers for all routes
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      },
      {
        key: 'Cross-Origin-Embedder-Policy',
        value: 'credentialless'
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin'
      },
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'cross-origin'
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https://openreferraluk.org https://*.vercel-scripts.com",
          "font-src 'self' data:",
          "connect-src 'self' https://va.vercel-scripts.com https://*.herokuapp.com https://vercel.live",
          "frame-src 'self' https://vercel.live",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ')
      }
    ]

    return [
      {
        source: '/:path*',
        headers: securityHeaders
      },
      {
        source: '/specifications/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Content-Type',
            value: 'application/json'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, immutable'
          }
        ]
      }
    ]
  },
  // Disable X-Powered-By header
  poweredByHeader: false
}

export default nextConfig
