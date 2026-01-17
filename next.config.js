/**
 * Next.js 설정 파일
 * ES module 형식으로 작성
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 이미지 도메인 설정 (Supabase 스토리지)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

export default nextConfig
