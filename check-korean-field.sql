-- missions 테이블의 korean 필드가 영어인지 한글인지 확인하는 쿼리

-- 1. 전체 미션 중 korean 필드에 한글이 포함된 미션 수
SELECT 
  COUNT(*) as total_missions,
  COUNT(CASE WHEN mission_data->>'korean' ~ '[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]' THEN 1 END) as korean_missions,
  COUNT(CASE WHEN mission_data->>'korean' !~ '[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]' THEN 1 END) as english_missions
FROM missions
WHERE mission_type = 'keyboard' AND is_active = true;

-- 2. 학년별로 korean 필드 상태 확인
SELECT 
  grade,
  grade_level,
  COUNT(*) as total,
  COUNT(CASE WHEN mission_data->>'korean' ~ '[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]' THEN 1 END) as korean_count,
  COUNT(CASE WHEN mission_data->>'korean' !~ '[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]' THEN 1 END) as english_count
FROM missions
WHERE mission_type = 'keyboard' AND is_active = true
GROUP BY grade, grade_level
ORDER BY grade, grade_level;

-- 3. 영어 문장이 들어간 미션 샘플 확인 (최대 10개)
SELECT 
  id,
  grade,
  grade_level,
  mission_data->>'korean' as korean_field,
  mission_data->>'example' as example_field
FROM missions
WHERE mission_type = 'keyboard' 
  AND is_active = true
  AND mission_data->>'korean' !~ '[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]'
LIMIT 10;

-- 4. 한글 문장이 들어간 미션 샘플 확인 (최대 10개)
SELECT 
  id,
  grade,
  grade_level,
  mission_data->>'korean' as korean_field,
  mission_data->>'example' as example_field
FROM missions
WHERE mission_type = 'keyboard' 
  AND is_active = true
  AND mission_data->>'korean' ~ '[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]'
LIMIT 10;
