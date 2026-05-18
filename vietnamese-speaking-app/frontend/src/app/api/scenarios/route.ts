import { NextRequest, NextResponse } from 'next/server'
import { scenarios } from '@/lib/scenarios'

export async function GET() {
  return NextResponse.json(scenarios.map(s => ({
    id: s.id,
    titleVi: s.titleVi,
    titleZh: s.titleZh,
    icon: s.icon,
    level: s.level,
    category: s.category,
    description: s.description,
  })))
}
