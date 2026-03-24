import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Abduction Lens',
    short_name: 'Abduction Lens',
    description: '決定的な一瞬を捉え、仮説を紡ぎ出す。阿武妥苦衝（アブダクション）トレーニング。',
    start_url: '/',
    display: 'standalone',
    background_color: '#1A1A1A',
    theme_color: '#1A1A1A',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
