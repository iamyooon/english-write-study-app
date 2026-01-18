-- 에너지 시스템 추가 마이그레이션
-- 실행일: 2026년 1월 18일

-- 1. profiles.energy 기본값 변경 (5 → 100)
ALTER TABLE profiles 
ALTER COLUMN energy SET DEFAULT 100;

-- 기존 사용자의 energy를 100으로 업데이트 (기본값만 변경하면 새로 가입한 사용자만 적용됨)
UPDATE profiles 
SET energy = 100 
WHERE energy < 100;

-- 2. profiles.energy_last_charged 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS energy_last_charged TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. study_logs.energy_gained 컬럼 추가 (작성 문장당 획득한 에너지)
ALTER TABLE study_logs
ADD COLUMN IF NOT EXISTS energy_gained INTEGER DEFAULT 0;

-- 인덱스 추가 (자정 충전 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_energy_last_charged 
ON profiles(energy_last_charged);
