-- RLS 정책 확인 쿼리
-- 이 쿼리를 실행하여 현재 정책 상태를 확인할 수 있습니다

-- profiles 테이블 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- shop_items 테이블 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'shop_items'
ORDER BY policyname;

-- user_inventory 테이블 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_inventory'
ORDER BY policyname;

-- study_logs 테이블 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'study_logs'
ORDER BY policyname;

-- RLS 활성화 상태 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'shop_items', 'user_inventory', 'study_logs')
ORDER BY tablename;
