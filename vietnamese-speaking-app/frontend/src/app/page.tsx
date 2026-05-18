import Link from 'next/link'
import { scenarios } from '@/lib/scenarios'

const levelColors = {
  A1: 'bg-green-100 text-green-700',
  A2: 'bg-blue-100 text-blue-700',
  B1: 'bg-yellow-100 text-yellow-700',
  B2: 'bg-red-100 text-red-700',
}

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-12">
        <div className="text-6xl mb-4">🇻🇳</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Nói Hay
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          AI 驱动的越南语口语练习
        </p>
        <p className="text-sm text-gray-400">
          选一个场景，开口说越南语
        </p>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/tones" className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl p-5 hover:shadow-lg transition-all active:scale-[0.98]">
          <span className="text-3xl">🎯</span>
          <h3 className="font-bold text-lg mt-2">声调专项练习</h3>
          <p className="text-sm text-purple-100 mt-1">越南语6声调，逐个突破</p>
        </a>
        <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-5">
          <span className="text-3xl">📊</span>
          <h3 className="font-bold text-lg mt-2">今日学习</h3>
          <p className="text-sm text-green-100 mt-1">选一个场景开始练习</p>
        </div>
      </section>

      {/* Scenarios */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">📍 场景练习</h2>
          <div className="flex gap-2">
            {['A1', 'A2', 'B1', 'B2'].map(level => (
              <span key={level} className={`text-xs px-2 py-0.5 rounded-full ${levelColors[level as keyof typeof levelColors]}`}>
                {level}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/practice/${scenario.id}`}
              className="group bg-white rounded-2xl border border-gray-100 p-5 
                         hover:shadow-md hover:border-blue-200 transition-all
                         active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {scenario.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{scenario.titleVi}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[scenario.level]}`}>
                      {scenario.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{scenario.titleZh}</p>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{scenario.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors mt-1" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-medium text-blue-900 mb-3">💡 越南语小贴士</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-800">六个声调</p>
            <p className="text-blue-600 mt-1">越南语有6个声调，同一个音不同声调意思完全不同</p>
          </div>
          <div>
            <p className="font-medium text-blue-800">北部 vs 南部</p>
            <p className="text-blue-600 mt-1">河内话和胡志明话有口音差异，我们以北部标准音为主</p>
          </div>
          <div>
            <p className="font-medium text-blue-800">多说多练</p>
            <p className="text-blue-600 mt-1">口语的关键是开口，每天10分钟就能看到进步</p>
          </div>
        </div>
      </section>
    </div>
  )
}
