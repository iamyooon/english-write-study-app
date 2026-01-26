-- Drag & Drop 미션 샘플 데이터
-- mission_data 구조:
-- {
--   "korean": "한글 미션 문장",
--   "template": "영어 문장 템플릿 (빈칸은 ___로 표시)",
--   "blanks": 빈칸_개수,
--   "wordOptions": ["선택지1", "선택지2", "선택지3", "선택지4"],
--   "correctAnswers": ["정답1", "정답2"]
-- }

INSERT INTO missions (mission_type, grade_level, level, unit, topic, order_in_unit, mission_data) VALUES

-- 저학년 레벨 1 (빈칸 1개)
('drag_drop', 'elementary_low', 1, 1, '인사하기', 1, '{"korean": "나는 사과를 좋아해요", "template": "I like ___", "blanks": 1, "wordOptions": ["apple", "banana", "orange", "grape"], "correctAnswers": ["apple"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사하기', 2, '{"korean": "안녕하세요", "template": "Hello, ___", "blanks": 1, "wordOptions": ["teacher", "friend", "mom", "dad"], "correctAnswers": ["teacher"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사하기', 3, '{"korean": "좋은 아침이에요", "template": "Good ___", "blanks": 1, "wordOptions": ["morning", "night", "afternoon", "evening"], "correctAnswers": ["morning"]}'),

-- 저학년 레벨 2 (빈칸 2개)
('drag_drop', 'elementary_low', 2, 2, '가족', 1, '{"korean": "나는 매일 학교에 가요", "template": "I go to ___ every ___", "blanks": 2, "wordOptions": ["school", "home", "day", "morning", "week"], "correctAnswers": ["school", "day"]}'),
('drag_drop', 'elementary_low', 2, 2, '가족', 2, '{"korean": "엄마는 요리를 해요", "template": "Mom ___ food", "blanks": 1, "wordOptions": ["cooks", "eats", "likes", "sees"], "correctAnswers": ["cooks"]}'),
('drag_drop', 'elementary_low', 2, 2, '가족', 3, '{"korean": "아빠는 회사에 가요", "template": "Dad goes to ___", "blanks": 1, "wordOptions": ["work", "school", "home", "park"], "correctAnswers": ["work"]}'),

-- 고학년 레벨 1 (빈칸 1개, 조금 더 복잡)
('drag_drop', 'elementary_high', 1, 1, '일상생활', 1, '{"korean": "나는 매일 아침 일찍 일어나요", "template": "I wake up ___ every morning", "blanks": 1, "wordOptions": ["early", "late", "quickly", "slowly"], "correctAnswers": ["early"]}'),
('drag_drop', 'elementary_high', 1, 1, '일상생활', 2, '{"korean": "아침에 양치를 하고 밥을 먹어요", "template": "I brush my ___ and eat breakfast", "blanks": 1, "wordOptions": ["teeth", "hair", "face", "hands"], "correctAnswers": ["teeth"]}'),
('drag_drop', 'elementary_high', 1, 1, '일상생활', 3, '{"korean": "저녁에 숙제를 해요", "template": "I do my ___ in the evening", "blanks": 1, "wordOptions": ["homework", "exercise", "chores", "games"], "correctAnswers": ["homework"]}'),

-- 고학년 레벨 2 (빈칸 2개)
('drag_drop', 'elementary_high', 2, 2, '취미', 1, '{"korean": "나는 책 읽기를 좋아해요", "template": "I like ___ ___", "blanks": 2, "wordOptions": ["reading", "writing", "books", "stories", "novels"], "correctAnswers": ["reading", "books"]}'),
('drag_drop', 'elementary_high', 2, 2, '취미', 2, '{"korean": "주말에 친구들과 축구를 해요", "template": "I play ___ with my ___ on weekends", "blanks": 2, "wordOptions": ["soccer", "basketball", "friends", "family", "classmates"], "correctAnswers": ["soccer", "friends"]}'),
('drag_drop', 'elementary_high', 2, 2, '취미', 3, '{"korean": "음악 듣는 것을 즐겨요", "template": "I enjoy ___ to ___", "blanks": 2, "wordOptions": ["listening", "watching", "music", "songs", "videos"], "correctAnswers": ["listening", "music"]}')

ON CONFLICT DO NOTHING;
