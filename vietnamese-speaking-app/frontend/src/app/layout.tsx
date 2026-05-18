import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nói Hay - 越南语口语练习',
  description: 'AI驱动的越南语口语练习应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🇻🇳</span>
              <span className="font-bold text-lg text-gray-900">Nói Hay</span>
            </a>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <a href="/" className="hover:text-blue-600 transition-colors font-medium text-blue-600">首页</a>
              <a href="/tones" className="hover:text-blue-600 transition-colors">声调练习</a>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
