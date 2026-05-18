import { NextRequest, NextResponse } from 'next/server'

interface ConverseRequest {
  message: string
  scenario: string
  scenarioTitle: string
  history: Array<{ role: 'ai' | 'user'; text: string }>
  level: string
}

interface ConverseResponse {
  reply_vi: string
  reply_zh: string
  correction: string | null
  new_words: Array<{ vi: string; zh: string }>
  encouragement: string
}

// Build system prompt based on scenario
function buildSystemPrompt(scenario: string, title: string, level: string): string {
  const roleMap: Record<string, string> = {
    greeting: '你是一个友好的越南人，在和一个学越南语的中国人聊天',
    restaurant: '你是越南河内一家餐厅的服务员，用简单越南语和顾客对话',
    taxi: '你是越南的出租车司机，用简单越南语和乘客对话',
    shopping: '你是越南市场的一个店主，用简单越南语和顾客对话',
    hotel: '你是越南酒店的前台服务员，用简单越南语和客人对话',
    doctor: '你是越南的医生，用简单越南语和病人对话',
  }

  const role = roleMap[scenario] || '你是一个友好的越南人'
  const levelDesc = level === 'A1' ? '非常简单的基础词汇' : level === 'A2' ? '简单日常用语' : '中等难度用语'

  return `你是${role}。

规则：
1. 用越南语回复，${levelDesc}
2. 每次回复1-2句话，不要太长
3. 如果用户说错了，温和地纠正（先回复正确说法，再指出错误）
4. 如果用户说得好，给予鼓励
5. 保持对话自然流畅，像真人聊天一样
6. 回复JSON格式：{
    "reply_vi": "越南语回复",
    "reply_zh": "中文翻译", 
    "correction": "如果用户有错误，这里是纠正说明，否则null",
    "new_words": [{"vi": "新词越南语", "zh": "新词中文"}],
    "encouragement": "一句简短鼓励"
  }

只返回JSON，不要其他文字。`
}

export async function POST(request: NextRequest) {
  try {
    const body: ConverseRequest = await request.json()
    const { message, scenario, scenarioTitle, history, level } = body

    const apiKey = process.env.OPENAI_API_KEY

    // No API key → return a helpful fallback
    if (!apiKey || apiKey === 'sk-your-key-here') {
      return NextResponse.json({
        reply_vi: 'Dạ, tôi hiểu rồi! Bạn nói tốt lắm!',
        reply_zh: '好的，我明白了！你说得很好！',
        correction: null,
        new_words: [],
        encouragement: '👍 继续保持！（提示：配置 OPENAI_API_KEY 以启用AI对话）',
      } as ConverseResponse)
    }

    // Build messages for OpenAI
    const messages = [
      { role: 'system' as const, content: buildSystemPrompt(scenario, scenarioTitle, level) },
      ...history.map(h => ({
        role: h.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: h.text,
      })),
      { role: 'user' as const, content: message },
    ]

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('OpenAI error:', err)
      throw new Error(`LLM failed: ${res.status}`)
    }

    const data = await res.json()
    const content = data.choices[0]?.message?.content || '{}'
    
    let parsed: ConverseResponse
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = {
        reply_vi: content,
        reply_zh: '（翻译生成失败）',
        correction: null,
        new_words: [],
        encouragement: '',
      }
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Converse error:', err)
    return NextResponse.json({
      reply_vi: 'Xin lỗi, có lỗi xảy ra.',
      reply_zh: '抱歉，出了点问题。',
      correction: null,
      new_words: [],
      encouragement: '请稍后再试',
    } as ConverseResponse)
  }
}
