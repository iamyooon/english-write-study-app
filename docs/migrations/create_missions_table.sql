-- missions 테이블 생성
-- 미리 정의된 학습 미션들을 저장하는 테이블

CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- 미션 분류
  mission_type TEXT NOT NULL CHECK (mission_type IN ('keyboard', 'drag_drop')),
  grade_level TEXT NOT NULL CHECK (grade_level IN ('elementary_low', 'elementary_high')),
  grade INT NOT NULL CHECK (grade >= 1 AND grade <= 6), -- 학년 (1-6학년)
  
  -- 커리큘럼 구조 (선택적)
  unit INT, -- 단원 번호 (예: Unit 1, Unit 2)
  topic TEXT, -- 주제 (예: '인사하기', '가족', '학교', '취미')
  order_in_unit INT, -- 단원 내 순서
  
  -- 미션 데이터 (JSONB로 유연하게 저장)
  mission_data JSONB NOT NULL,
  
  -- 활성화 상태
  is_active BOOLEAN DEFAULT true,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX idx_missions_type_grade ON missions(mission_type, grade_level, grade);
CREATE INDEX idx_missions_grade_unit ON missions(grade, unit) WHERE unit IS NOT NULL;
CREATE INDEX idx_missions_unit_topic ON missions(unit, topic) WHERE unit IS NOT NULL;
CREATE INDEX idx_missions_active ON missions(is_active) WHERE is_active = true;

-- 사용자별 완료한 미션 추적 테이블
CREATE TABLE IF NOT EXISTS user_mission_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  
  -- 완료 정보
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INT, -- 점수 (0-100)
  attempts INT DEFAULT 1, -- 시도 횟수
  
  -- 중복 방지
  UNIQUE(user_id, mission_id)
);

-- 인덱스 생성
CREATE INDEX idx_user_mission_progress_user ON user_mission_progress(user_id);
CREATE INDEX idx_user_mission_progress_mission ON user_mission_progress(mission_id);

-- RLS (Row Level Security) 정책
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mission_progress ENABLE ROW LEVEL SECURITY;

-- missions 테이블: 모든 사용자가 읽기 가능
CREATE POLICY "missions_select_all" ON missions
  FOR SELECT
  USING (true);

-- user_mission_progress 테이블: 본인 데이터만 조회/수정 가능
CREATE POLICY "user_mission_progress_select_own" ON user_mission_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_mission_progress_insert_own" ON user_mission_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_mission_progress_update_own" ON user_mission_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
