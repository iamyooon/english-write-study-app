-- Placement Test 결과를 저장하기 위한 컬럼 추가
-- profiles 테이블에 placement_level 추가

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS placement_level INTEGER DEFAULT 1;

-- placement_level은 1-10 범위 (1: 초급, 10: 고급)
-- 기본값은 1로 설정

COMMENT ON COLUMN profiles.placement_level IS 'Placement Test 결과 레벨 (1-10)';
