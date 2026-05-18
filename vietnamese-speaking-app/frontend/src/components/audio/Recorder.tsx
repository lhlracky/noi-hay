'use client'

import { useState } from 'react'
import { useRecorder } from '@/hooks/useRecorder'
import Waveform from './Waveform'

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void
  maxDuration?: number
  disabled?: boolean
}

export default function Recorder({ onRecordingComplete, maxDuration = 30, disabled }: RecorderProps) {
  const { state, start, stop, cancel, analyserNode } = useRecorder()
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setError(null)
    try {
      await start()
    } catch {
      setError('无法访问麦克风，请检查权限设置')
    }
  }

  const handleStop = async () => {
    const blob = await stop()
    if (blob) onRecordingComplete(blob)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Waveform analyserNode={analyserNode} isRecording={state.isRecording} />

      <div className="flex items-center gap-4">
        {!state.isRecording ? (
          <button
            onClick={handleStart}
            disabled={disabled}
            className="relative w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 
                       text-white flex items-center justify-center transition-all
                       shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-95"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="relative w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-900 
                       text-white flex items-center justify-center transition-all
                       shadow-lg recording-active active:scale-95"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        )}
      </div>

      {state.isRecording && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>{formatTime(state.duration)}</span>
          <span className="text-gray-400">/ {formatTime(maxDuration)}</span>
        </div>
      )}

      {state.audioUrl && !state.isRecording && (
        <audio src={state.audioUrl} controls className="w-full max-w-sm h-10" />
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
