/**
 * 로그아웃 API
 * 
 * POST /api/auth/logout
 * 
 * 현재 세션을 종료합니다.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('로그아웃 오류:', error)
      return NextResponse.json(
        { error: '로그아웃에 실패했습니다.', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('로그아웃 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
