import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 환경변수 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // API 요청을 백엔드로 프록시
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
  
  // 컨테이너 환경을 위한 설정
  output: 'standalone',
  
  // 이미지 최적화 설정
  images: {
    unoptimized: true,
  },
  
  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 오류 무시 (개발 환경에서는 체크)
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // TypeScript 설정
  typescript: {
    // 빌드 시 TypeScript 오류 무시 (개발 환경에서는 체크)  
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
