'use client'

interface ScoreResult {
  overall: number
  tone: number
  vowel: number
  speed: number
  completeness: number
  transcript: string
  words: Array<{
    text: string
    score: number
    tone: 'correct' | 'needs_work' | 'wrong'
  }>
  suggestion: string
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-500'
  if (score >= 70) return 'text-blue-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 85) return 'bg-green-500'
  if (score >= 70) return 'bg-blue-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '🎉 太棒了！'
  if (score >= 80) return '👏 很好！'
  if (score >= 70) return '👍 不错'
  if (score >= 60) return '💪 继续加油'
  return '🔄 再试一次'
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-20">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getScoreBg(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-medium w-10 text-right ${getScoreColor(score)}`}>
        {score}
      </span>
    </div>
  )
}

export default function ScoreDisplay({ result }: { result: ScoreResult }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      {/* Overall score */}
      <div className="text-center">
        <div className={`text-5xl font-bold ${getScoreColor(result.overall)}`}>
          {result.overall}
        </div>
        <div className="text-lg mt-1">{getScoreLabel(result.overall)}</div>
      </div>

      {/* Dimension scores */}
      <div className="space-y-3">
        <ScoreBar label="声调" score={result.tone} />
        <ScoreBar label="发音" score={result.vowel} />
        <ScoreBar label="语速" score={result.speed} />
        <ScoreBar label="完整度" score={result.completeness} />
      </div>

      {/* Transcript with word-level feedback */}
      {result.words.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">你说的：</p>
          <div className="flex flex-wrap gap-1">
            {result.words.map((word, i) => (
              <span
                key={i}
                className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                  word.tone === 'correct'
                    ? 'bg-green-50 text-green-700'
                    : word.tone === 'needs_work'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {word.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion */}
      {result.suggestion && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-1">💡 建议：</p>
          <p className="text-sm text-gray-700">{result.suggestion}</p>
        </div>
      )}
    </div>
  )
}
