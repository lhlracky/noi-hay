// Vietnamese tone analysis utilities
// Vietnamese has 6 tones: ngang, huyền, sắc, hỏi, ngã, nặng

export interface ToneInfo {
  name: string        // Vietnamese name
  nameZh: string      // Chinese name
  mark: string        // Diacritical mark
  example: string     // Example syllable
  f0Pattern: string   // Pitch pattern description
}

export const TONES: Record<string, ToneInfo> = {
  ngang: { name: 'ngang', nameZh: '平声', mark: '(无)', example: 'ma', f0Pattern: '中平 ───' },
  huyen: { name: 'huyền', nameZh: '玄声', mark: '`', example: 'mà', f0Pattern: '低沉 ╲' },
  sac:   { name: 'sắc',   nameZh: '锐声', mark: "'", example: 'má', f0Pattern: '高升 ╱' },
  hoi:   { name: 'hỏi',   nameZh: '问声', mark: '?', example: 'mả', f0Pattern: '降升 ╲╱' },
  nga:   { name: 'ngã',   nameZh: '跌声', mark: '~', example: 'mã', f0Pattern: '曲折 ∽' },
  nang:  { name: 'nặng',  nameZh: '重声', mark: '.', example: 'mạ', f0Pattern: '低沉短 •' },
}

// Extract tone from Vietnamese word with diacritics
export function detectTone(word: string): string {
  const lower = word.toLowerCase()
  
  // Check for tone marks in order of specificity
  if (/[àằầèềìòồùừỳ]/.test(lower)) return 'huyen'
  if (/[áắấéếíóốúứý]/.test(lower)) return 'sac'
  if (/[ảẳẩẻểỉỏổủửỷ]/.test(lower)) return 'hoi'
  if (/[ãẵẫẽễĩõỗũữỹ]/.test(lower)) return 'nga'
  if (/[ạặậẹệịọộụựỵ]/.test(lower)) return 'nang'
  
  return 'ngang' // no mark = ngang
}

// Get all Vietnamese characters for reference
export const VIETNAMESE_VOWELS = 'aăâeêioôơuưy'
export const VIETNAMESE_CONSONANTS = 'bcdđghjklmnpqrstvx'

// Common Vietnamese words with their tones for practice
export const TONE_PRACTICE_SETS = [
  { word: 'ma',   tone: 'ngang', meaning: '鬼' },
  { word: 'mà',   tone: 'huyen', meaning: '但是' },
  { word: 'má',   tone: 'sac',   meaning: '妈妈' },
  { word: 'mả',   tone: 'hoi',   meaning: '坟' },
  { word: 'mã',   tone: 'nga',   meaning: '马/码' },
  { word: 'mạ',   tone: 'nang',  meaning: '秧苗' },
]
