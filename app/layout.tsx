/**
 * Root Layout
 * Next.js App Router의 최상위 레이아웃
 */

import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'We Word Planet - 영어 Writing 놀이터',
  description: '아이 혼자 쓰고 AI가 코치해주는 영어 Writing 놀이터',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
