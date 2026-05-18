'use client'

import { useState } from 'react'
import Recorder from '@/components/audio/Recorder'
import ScoreDisplay from '@/components/audio/ScoreDisplay'
import { TONE_PRACTICE_SETS, TONES } from '@/lib/vietnamese'

interface ScoreResult {
  overall: number
  tone: number
  vowel: number
  speed: number
  completeness: number
  transcript: string
  words: Array<{ text: string; score: number; tone: 'correct' | 'needs_work' | 'wrong' }>
  suggestion: string
}

export default function TonesPage() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const current = TONE_PRACTICE_SETS[currentIdx]

  const handleRecording = async (blob: Blob) => {
    setIsEvaluating(true)
    setScore(null)

    const formData = new FormData()
    formData.append('audio', blob, 'recording.webm')
    formData.append('target', current.word)

    try {
      const res = await fetch('/api/practice/evaluate', { method: 'POST', body: formData })
      const result = await res.json()
      setScore(result)
    } catch (err) {
      console.error(err)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleNext = () => {
    setCurrentIdx((currentIdx + 1) % TONE_PRACTICE_SETS.length)
    setScore(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/" className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 className="text-xl font-bold">🎯 声调专项练习</h1>
      </div>

      {/* Tone Reference */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-medium text-gray-800 mb-3">越南语六声调</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(TONES).map((t) => (
            <div key={t.name} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">{t.nameZh}</p>
              <p className="font-medium text-blue-700">{t.name}</p>
              <p className="text-lg mt-1">{t.f0Pattern}</p>
              <p className="text-sm text-gray-600">{t.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Practice */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <p className="text-sm text-gray-500 mb-2">
          练习 ({currentIdx + 1}/{TONE_PRACTICE_SETS.length})
        </p>
        <p className="text-4xl font-bold text-blue-700 mb-2">{current.word}</p>
        <p className="text-gray-600 mb-1">{current.meaning}</p>
        <p className="text-sm text-gray-400">
          声调: <span className="font-medium">{TONES[current.tone]?.nameZh}</span>
          {' '}({TONES[current.tone]?.f0Pattern})
        </p>
      </div>

      <Recorder onRecordingComplete={handleRecording} maxDuration={10} />

      {isEvaluating && (
        <div className="text-center text-gray-500">
          <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2">评估中...</span>
        </div>
      )}

      {score && <ScoreDisplay result={score} />}

      {score && (
        <button
          onClick={handleNext}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          下一个 →
        </button>
      )}
    </div>
  )
}
