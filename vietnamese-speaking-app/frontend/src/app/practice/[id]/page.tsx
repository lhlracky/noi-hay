'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Recorder from '@/components/audio/Recorder'
import ScoreDisplay from '@/components/audio/ScoreDisplay'
import ChatInterface from '@/components/chat/ChatInterface'
import { getScenario } from '@/lib/scenarios'

interface ScoreResult {
  overall: number
  tone: number
  vowel: number
  speed: number
  completeness: number
  transcript: string
  words: Array<{ text: string; score: number; tone: 'correct' | 'needs_work' | 'wrong' }>
  suggestion: string
  target: string
}

interface Message {
  id: string
  role: 'ai' | 'user'
  text: string
  zh: string
  score?: number
  correction?: string
  newWords?: Array<{ vi: string; zh: string }>
}

type PracticeMode = 'intro' | 'vocabulary' | 'dialogue' | 'complete'

export default function PracticePage() {
  const params = useParams()
  const router = useRouter()
  const scenario = getScenario(params.id as string)

  const [mode, setMode] = useState<PracticeMode>('intro')
  const [vocabIndex, setVocabIndex] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentScore, setCurrentScore] = useState<ScoreResult | null>(null)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [sessionScores, setSessionScores] = useState<number[]>([])
  const [dialogueTarget, setDialogueTarget] = useState('')
  const [turnCount, setTurnCount] = useState(0)

  if (!scenario) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">场景不存在</p>
        <button onClick={() => router.push('/')} className="mt-4 text-blue-500">返回首页</button>
      </div>
    )
  }

  // Call AI conversation API
  const callConverseAPI = async (userText: string): Promise<void> => {
    setIsAiTyping(true)
    try {
      const res = await fetch('/api/practice/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          scenario: scenario.id,
          scenarioTitle: scenario.titleVi,
          history: messages.slice(-10).map(m => ({ role: m.role, text: m.text })),
          level: scenario.level,
        }),
      })
      const data = await res.json()

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.reply_vi,
        zh: data.reply_zh,
        correction: data.correction,
        newWords: data.new_words,
      }
      setMessages(prev => [...prev, aiMsg])

      // Set next user prompt from scenario or let AI drive
      if (turnCount < scenario.dialogues.length - 1) {
        const nextUserTurn = scenario.dialogues.find((d, i) => i > turnCount && d.role === 'user')
        if (nextUserTurn) {
          setDialogueTarget(nextUserTurn.text)
        }
      }
    } catch (err) {
      console.error('Converse API error:', err)
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Xin lỗi, có lỗi xảy ra. Thử lại nhé!',
        zh: '抱歉出了点问题，再试一次吧！',
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsAiTyping(false)
    }
  }

  const evaluatePronunciation = async (audioBlob: Blob) => {
    setIsEvaluating(true)
    setCurrentScore(null)

    try {
      const target = mode === 'vocabulary'
        ? scenario.vocabulary[vocabIndex]?.vi || ''
        : dialogueTarget || scenario.dialogues[turnCount]?.text || ''

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('target', target)

      const res = await fetch('/api/practice/evaluate', { method: 'POST', body: formData })
      const result: ScoreResult = await res.json()

      setCurrentScore(result)
      setSessionScores(prev => [...prev, result.overall])

      if (mode === 'dialogue') {
        // Add user message
        const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          text: result.transcript || target,
          zh: '',
          score: result.overall,
        }
        setMessages(prev => [...prev, userMsg])
        setTurnCount(prev => prev + 1)

        // Get AI response
        await callConverseAPI(result.transcript || target)
      }
    } catch (err) {
      console.error('Evaluation failed:', err)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleNextVocab = () => {
    if (vocabIndex < scenario.vocabulary.length - 1) {
      setVocabIndex(vocabIndex + 1)
      setCurrentScore(null)
    } else {
      startDialogue()
    }
  }

  const startDialogue = () => {
    setMode('dialogue')
    const firstAi = scenario.dialogues[0]
    const firstUser = scenario.dialogues[1]
    setMessages([{
      id: '1',
      role: 'ai',
      text: firstAi.text,
      zh: firstAi.zh,
    }])
    setDialogueTarget(firstUser?.text || '')
    setTurnCount(1)
    setCurrentScore(null)
  }

  const avgScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-3xl">{scenario.icon}</span>
        <div>
          <h1 className="text-xl font-bold">{scenario.titleVi}</h1>
          <p className="text-sm text-gray-500">{scenario.titleZh}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            scenario.level === 'A1' ? 'bg-green-100 text-green-700' :
            scenario.level === 'A2' ? 'bg-blue-100 text-blue-700' :
            scenario.level === 'B1' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>{scenario.level}</span>
        </div>
      </div>

      {/* Intro */}
      {mode === 'intro' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <p className="text-gray-700">{scenario.description}</p>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">📚 重点词汇</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scenario.vocabulary.map((v, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-medium text-blue-700">{v.vi}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{v.zh}</span>
                  <span className="text-xs text-gray-400 ml-auto">{v.phonetic}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setMode('vocabulary'); setVocabIndex(0) }}
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              📖 先练词汇
            </button>
            <button
              onClick={startDialogue}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              💬 直接对话
            </button>
          </div>
        </div>
      )}

      {/* Vocabulary Practice */}
      {mode === 'vocabulary' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">跟读以下词汇 ({vocabIndex + 1}/{scenario.vocabulary.length})</p>
            <p className="text-3xl font-bold text-blue-700 mb-1">{scenario.vocabulary[vocabIndex].vi}</p>
            <p className="text-gray-600">{scenario.vocabulary[vocabIndex].zh}</p>
            <p className="text-sm text-gray-400 mt-1">谐音: {scenario.vocabulary[vocabIndex].phonetic}</p>
          </div>

          <Recorder onRecordingComplete={evaluatePronunciation} maxDuration={10} />

          {isEvaluating && (
            <div className="text-center text-gray-500">
              <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2">评估中...</span>
            </div>
          )}

          {currentScore && <ScoreDisplay result={currentScore} />}

          {currentScore && (
            <button
              onClick={handleNextVocab}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              {vocabIndex < scenario.vocabulary.length - 1 ? '下一个 →' : '开始对话练习 →'}
            </button>
          )}
        </div>
      )}

      {/* Dialogue Mode */}
      {mode === 'dialogue' && (
        <div className="space-y-4">
          <ChatInterface
            messages={messages}
            isAiTyping={isAiTyping}
            onUserMessage={() => {}}
            scenario={scenario}
          />

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            {dialogueTarget ? (
              <>
                <p className="text-sm text-gray-500 mb-3 text-center">请说出：</p>
                <p className="text-lg font-medium text-center text-blue-700 mb-4">{dialogueTarget}</p>
                <Recorder onRecordingComplete={evaluatePronunciation} maxDuration={15} />
              </>
            ) : (
              <p className="text-center text-gray-400 py-4">对话进行中...</p>
            )}
          </div>

          {isEvaluating && (
            <div className="text-center text-gray-500">
              <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2">识别与评估中...</span>
            </div>
          )}

          {currentScore && !isEvaluating && (
            <div className="text-center">
              <span className={`text-2xl font-bold ${currentScore.overall >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                {currentScore.overall}
              </span>
              <span className="text-gray-400 text-sm">/100</span>
            </div>
          )}

          {turnCount >= 6 && (
            <button
              onClick={() => setMode('complete')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              结束练习 →
            </button>
          )}
        </div>
      )}

      {/* Complete */}
      {mode === 'complete' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">练习完成！</h2>
          <p className="text-gray-600">场景：{scenario.titleVi} - {scenario.titleZh}</p>
          <div className="flex justify-center gap-8 py-4">
            <div>
              <p className="text-3xl font-bold text-blue-600">{sessionScores.length}</p>
              <p className="text-sm text-gray-500">练习次数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{avgScore}</p>
              <p className="text-sm text-gray-500">平均分</p>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setMode('intro')
                setMessages([])
                setSessionScores([])
                setCurrentScore(null)
                setVocabIndex(0)
                setTurnCount(0)
                setDialogueTarget('')
              }}
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              🔄 再练一次
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              🏠 返回首页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
