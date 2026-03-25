import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '로봇설계과 프로젝트 매니저',
    short_name: 'Robot PM',
    description: '로봇설계과 학생과 선생님을 위한 프로젝트 및 비품 관리 시스템',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      },
    ],
  }
}
