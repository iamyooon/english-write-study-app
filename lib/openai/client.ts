/**
 * OpenAI 클라이언트
 */

import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey || apiKey === 'sk-your-openai-api-key') {
  console.error('⚠️ OPENAI_API_KEY가 설정되지 않았거나 기본값입니다.')
  console.error('   .env.local 파일에 실제 OpenAI API 키를 입력해주세요.')
}

export const openai = new OpenAI({
  apiKey: apiKey || '',
})
