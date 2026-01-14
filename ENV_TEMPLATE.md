# 환경 변수 템플릿

`.env.local` 파일을 생성하고 아래 내용을 복사하여 사용하세요.

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI 설정
OPENAI_API_KEY=sk-your-openai-api-key

# RevenueCat 설정 (결제 검증)
REVENUECAT_API_KEY=your-revenuecat-api-key

# Firebase 설정 (FCM 알림)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Next.js 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel 배포 시 자동으로 설정됨
# VERCEL_URL=your-app.vercel.app
```
