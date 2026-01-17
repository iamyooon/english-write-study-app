# Supabase 익명 인증 활성화 가이드

## 문제 해결

게스트 계정 생성이 실패하는 경우, Supabase 대시보드에서 익명 인증을 활성화해야 합니다.

## 활성화 방법

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard/project/ilgwjhtjdaghgwapwcki

2. **Authentication 설정**
   - 좌측 메뉴 → **Authentication** → **Providers** 클릭

3. **익명 인증 활성화**
   - **Anonymous** 섹션 찾기
   - **Enable Anonymous Sign-ins** 토글을 **ON**으로 변경
   - **Save** 버튼 클릭

4. **확인**
   - 익명 인증이 활성화되었는지 확인
   - 다시 앱에서 게스트 모드 시도

## 참고

- 익명 인증은 게스트 모드에 필수입니다
- 익명 사용자는 나중에 이메일/비밀번호로 업그레이드할 수 있습니다
- RLS 정책은 익명 사용자도 적용됩니다
