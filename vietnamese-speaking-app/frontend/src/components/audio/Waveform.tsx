'use client'

import { useEffect, useRef, useState } from 'react'

interface WaveformProps {
  analyserNode: AnalyserNode | null
  isRecording: boolean
}

export default function Waveform({ analyserNode, isRecording }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    if (!analyserNode || !isRecording || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyserNode.getByteTimeDomainData(dataArray)

      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      // Background
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'
      ctx.fillRect(0, 0, width, height)

      // Waveform
      ctx.lineWidth = 2
      ctx.strokeStyle = '#3b82f6'
      ctx.beginPath()

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)

        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Center line
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [analyserNode, isRecording])

  // Idle state
  useEffect(() => {
    if (isRecording || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }, [isRecording])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className="w-full rounded-xl border border-blue-100 bg-blue-50/30"
    />
  )
}
