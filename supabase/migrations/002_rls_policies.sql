-- Row Level Security (RLS) 정책 설정
-- 보안 규칙: 모든 테이블에 RLS 적용 필수
-- "내 데이터는 나만 조회/수정 가능"

-- 기존 정책 삭제 (이미 존재하는 경우)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can view own inventory" ON user_inventory;
DROP POLICY IF EXISTS "Users can insert own inventory items" ON user_inventory;
DROP POLICY IF EXISTS "Users can update own inventory items" ON user_inventory;
DROP POLICY IF EXISTS "Users can view own logs" ON study_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON study_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON study_logs;

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

-- profiles 테이블 정책
-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- shop_items 테이블 정책
-- 모든 사용자가 상점 아이템을 조회할 수 있음 (공개 데이터)
CREATE POLICY "Anyone can view shop items"
  ON shop_items FOR SELECT
  USING (true);

-- user_inventory 테이블 정책
-- 사용자는 자신의 인벤토리만 조회/수정 가능
CREATE POLICY "Users can view own inventory"
  ON user_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory items"
  ON user_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON user_inventory FOR UPDATE
  USING (auth.uid() = user_id);

-- study_logs 테이블 정책
-- 사용자는 자신의 학습 로그만 조회/생성 가능
CREATE POLICY "Users can view own logs"
  ON study_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON study_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON study_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- 주의: Service Role Key는 서버 사이드에서만 사용하며 RLS를 우회합니다.
-- 절대 클라이언트에 노출하지 마세요!
