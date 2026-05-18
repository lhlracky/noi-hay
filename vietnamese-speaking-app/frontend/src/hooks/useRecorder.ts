'use client'

import { useState, useRef, useCallback } from 'react'

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
}

export interface UseRecorderReturn {
  state: RecordingState
  start: () => Promise<void>
  stop: () => Promise<Blob | null>
  cancel: () => void
  analyserNode: AnalyserNode | null
}

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      })
      streamRef.current = stream

      // Set up audio context for analyser
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start(100) // collect data every 100ms
      startTimeRef.current = Date.now()

      timerRef.current = setInterval(() => {
        setState(s => ({ ...s, duration: (Date.now() - startTimeRef.current) / 1000 }))
      }, 100)

      setState(s => ({ ...s, isRecording: true, audioBlob: null, audioUrl: null, duration: 0 }))
    } catch (err) {
      console.error('Failed to start recording:', err)
      throw err
    }
  }, [])

  const stop = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null)
        return
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setState(s => ({ ...s, isRecording: false, audioBlob: blob, audioUrl: url }))
        resolve(blob)
      }

      mediaRecorder.stop()
      if (timerRef.current) clearInterval(timerRef.current)

      // Clean up stream
      streamRef.current?.getTracks().forEach(t => t.stop())
      audioContextRef.current?.close()
    })
  }, [])

  const cancel = useCallback(() => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioContextRef.current?.close()
    if (timerRef.current) clearInterval(timerRef.current)
    chunksRef.current = []
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
    })
  }, [])

  return { state, start, stop, cancel, analyserNode: analyserRef.current }
}
