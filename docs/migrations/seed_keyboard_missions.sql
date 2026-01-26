-- 키보드 입력용 미션 샘플 데이터
-- mission_data 구조:
-- {
--   "korean": "한글 문장",
--   "vocabulary": ["단어1", "단어2", "단어3"],
--   "example": "영어 예시 문장"
-- }

INSERT INTO missions (mission_type, grade_level, level, unit, topic, order_in_unit, mission_data) VALUES

-- 저학년 레벨 1
('keyboard', 'elementary_low', 1, 1, '인사하기', 1, '{"korean": "안녕하세요", "vocabulary": ["hello", "hi", "goodbye"], "example": "Hello."}'),
('keyboard', 'elementary_low', 1, 1, '인사하기', 2, '{"korean": "좋은 아침이에요", "vocabulary": ["good", "morning", "you"], "example": "Good morning."}'),
('keyboard', 'elementary_low', 1, 1, '인사하기', 3, '{"korean": "안녕히 가세요", "vocabulary": ["goodbye", "see", "you"], "example": "Goodbye."}'),

-- 저학년 레벨 2
('keyboard', 'elementary_low', 2, 2, '가족', 1, '{"korean": "나는 사과를 좋아해요", "vocabulary": ["I", "like", "apple"], "example": "I like apples."}'),
('keyboard', 'elementary_low', 2, 2, '가족', 2, '{"korean": "엄마는 요리를 해요", "vocabulary": ["mom", "cooks", "food"], "example": "Mom cooks food."}'),
('keyboard', 'elementary_low', 2, 2, '가족', 3, '{"korean": "아빠는 회사에 가요", "vocabulary": ["dad", "goes", "work"], "example": "Dad goes to work."}'),

-- 저학년 레벨 3
('keyboard', 'elementary_low', 3, 3, '학교', 1, '{"korean": "나는 학교에 가요", "vocabulary": ["I", "go", "school"], "example": "I go to school."}'),
('keyboard', 'elementary_low', 3, 3, '학교', 2, '{"korean": "친구와 함께 놀아요", "vocabulary": ["friend", "play", "together"], "example": "I play with my friend."}'),
('keyboard', 'elementary_low', 3, 3, '학교', 3, '{"korean": "선생님께 인사해요", "vocabulary": ["teacher", "say", "hello"], "example": "I say hello to my teacher."}'),

-- 고학년 레벨 1
('keyboard', 'elementary_high', 1, 1, '일상생활', 1, '{"korean": "나는 매일 아침 일찍 일어나요", "vocabulary": ["I", "every", "morning", "early", "wake"], "example": "I wake up early every morning."}'),
('keyboard', 'elementary_high', 1, 1, '일상생활', 2, '{"korean": "아침에 양치를 하고 밥을 먹어요", "vocabulary": ["morning", "brush", "teeth", "eat", "breakfast"], "example": "I brush my teeth and eat breakfast in the morning."}'),
('keyboard', 'elementary_high', 1, 1, '일상생활', 3, '{"korean": "저녁에 숙제를 해요", "vocabulary": ["evening", "do", "homework"], "example": "I do my homework in the evening."}'),

-- 고학년 레벨 2
('keyboard', 'elementary_high', 2, 2, '취미', 1, '{"korean": "나는 책 읽기를 좋아해요", "vocabulary": ["I", "like", "reading", "books"], "example": "I like reading books."}'),
('keyboard', 'elementary_high', 2, 2, '취미', 2, '{"korean": "주말에 친구들과 축구를 해요", "vocabulary": ["weekend", "friends", "play", "soccer"], "example": "I play soccer with my friends on weekends."}'),
('keyboard', 'elementary_high', 2, 2, '취미', 3, '{"korean": "음악 듣는 것을 즐겨요", "vocabulary": ["music", "listening", "enjoy"], "example": "I enjoy listening to music."}'),

-- 고학년 레벨 3
('keyboard', 'elementary_high', 3, 3, '여행', 1, '{"korean": "여름 방학에 바다에 가고 싶어요", "vocabulary": ["summer", "vacation", "beach", "want", "go"], "example": "I want to go to the beach during summer vacation."}'),
('keyboard', 'elementary_high', 3, 3, '여행', 2, '{"korean": "가족과 함께 여행을 떠나요", "vocabulary": ["family", "together", "travel", "go"], "example": "I travel with my family."}'),
('keyboard', 'elementary_high', 3, 3, '여행', 3, '{"korean": "새로운 곳을 탐험하는 게 재미있어요", "vocabulary": ["new", "place", "explore", "fun"], "example": "Exploring new places is fun."}')

ON CONFLICT DO NOTHING;
