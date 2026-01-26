-- 전체 커리큘럼 미션 데이터 생성
-- 학년별, 단원별, 미션별로 체계적으로 구성된 문장 데이터베이스
-- CURRICULUM_DESIGN.md 기반

-- ============================================
-- 1학년: Drag & Drop 미션 (Unit 1-3)
-- ============================================

-- Unit 1: 인사와 기본 표현 (1학년) - 12개 미션
INSERT INTO missions (mission_type, grade_level, grade, unit, topic, order_in_unit, mission_data) VALUES
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 1, '{"korean": "안녕하세요", "template": "___, everyone!", "blanks": 1, "wordOptions": ["Hello", "Bye", "Good", "Nice"], "correctAnswers": ["Hello"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 2, '{"korean": "안녕", "template": "___, friend!", "blanks": 1, "wordOptions": ["Hi", "Bye", "Good", "See"], "correctAnswers": ["Hi"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 3, '{"korean": "좋은 아침이에요", "template": "Good ___.", "blanks": 1, "wordOptions": ["night", "morning", "evening", "afternoon"], "correctAnswers": ["morning"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 4, '{"korean": "안녕히 가세요", "template": "___, see you!", "blanks": 1, "wordOptions": ["Hello", "Goodbye", "Hi", "Good"], "correctAnswers": ["Goodbye"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 5, '{"korean": "감사합니다", "template": "Thank ___.", "blanks": 1, "wordOptions": ["you", "me", "him", "her"], "correctAnswers": ["you"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 6, '{"korean": "미안해요", "template": "I am ___.", "blanks": 1, "wordOptions": ["happy", "sorry", "good", "nice"], "correctAnswers": ["sorry"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 7, '{"korean": "나는", "template": "___ am a student.", "blanks": 1, "wordOptions": ["I", "You", "He", "She"], "correctAnswers": ["I"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 8, '{"korean": "너는", "template": "___ are my friend.", "blanks": 1, "wordOptions": ["I", "You", "He", "She"], "correctAnswers": ["You"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 9, '{"korean": "그는", "template": "___ is a boy.", "blanks": 1, "wordOptions": ["I", "You", "He", "She"], "correctAnswers": ["He"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 10, '{"korean": "그녀는", "template": "___ is a girl.", "blanks": 1, "wordOptions": ["I", "You", "He", "She"], "correctAnswers": ["She"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 11, '{"korean": "우리는", "template": "___ are friends.", "blanks": 1, "wordOptions": ["I", "You", "We", "They"], "correctAnswers": ["We"]}'),
('drag_drop', 'elementary_low', 1, 1, '인사와 기본 표현', 12, '{"korean": "그들은", "template": "___ are students.", "blanks": 1, "wordOptions": ["I", "You", "We", "They"], "correctAnswers": ["They"]}'),

-- Unit 2: 가족과 사람 (1학년) - 12개 미션
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 1, '{"korean": "나는 엄마를 사랑해요", "template": "I love my ___.", "blanks": 1, "wordOptions": ["dad", "mom", "friend", "teacher"], "correctAnswers": ["mom"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 2, '{"korean": "아빠는 키가 커요", "template": "My dad is ___.", "blanks": 1, "wordOptions": ["short", "tall", "small", "big"], "correctAnswers": ["tall"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 3, '{"korean": "형이 있어요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["sister", "brother", "baby", "friend"], "correctAnswers": ["brother"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 4, '{"korean": "누나가 있어요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["sister", "brother", "baby", "friend"], "correctAnswers": ["sister"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 5, '{"korean": "아기가 귀여워요", "template": "The ___ is cute.", "blanks": 1, "wordOptions": ["baby", "child", "boy", "girl"], "correctAnswers": ["baby"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 6, '{"korean": "할아버지가 계세요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["grandfather", "grandmother", "uncle", "aunt"], "correctAnswers": ["grandfather"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 7, '{"korean": "할머니가 계세요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["grandfather", "grandmother", "uncle", "aunt"], "correctAnswers": ["grandmother"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 8, '{"korean": "삼촌이 있어요", "template": "I have an ___.", "blanks": 1, "wordOptions": ["uncle", "aunt", "cousin", "friend"], "correctAnswers": ["uncle"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 9, '{"korean": "이모가 있어요", "template": "I have an ___.", "blanks": 1, "wordOptions": ["uncle", "aunt", "cousin", "friend"], "correctAnswers": ["aunt"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 10, '{"korean": "우리는 가족이에요", "template": "We are a ___.", "blanks": 1, "wordOptions": ["family", "friend", "class", "group"], "correctAnswers": ["family"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 11, '{"korean": "아이는 학교에 가요", "template": "The ___ goes to school.", "blanks": 1, "wordOptions": ["child", "adult", "baby", "parent"], "correctAnswers": ["child"]}'),
('drag_drop', 'elementary_low', 1, 2, '가족과 사람', 12, '{"korean": "아이들이 놀아요", "template": "The ___ play.", "blanks": 1, "wordOptions": ["child", "children", "baby", "adult"], "correctAnswers": ["children"]}'),

-- Unit 3: 숫자와 색깔 (1학년) - 13개 미션
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 1, '{"korean": "하나", "template": "I have ___ apple.", "blanks": 1, "wordOptions": ["one", "two", "three", "four"], "correctAnswers": ["one"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 2, '{"korean": "둘", "template": "I have ___ apples.", "blanks": 1, "wordOptions": ["one", "two", "three", "four"], "correctAnswers": ["two"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 3, '{"korean": "셋", "template": "I have ___ books.", "blanks": 1, "wordOptions": ["one", "two", "three", "four"], "correctAnswers": ["three"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 4, '{"korean": "넷", "template": "I have ___ pens.", "blanks": 1, "wordOptions": ["one", "two", "three", "four"], "correctAnswers": ["four"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 5, '{"korean": "다섯", "template": "I have ___ pencils.", "blanks": 1, "wordOptions": ["four", "five", "six", "seven"], "correctAnswers": ["five"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 6, '{"korean": "빨간 사과", "template": "I like ___ apples.", "blanks": 1, "wordOptions": ["red", "blue", "green", "yellow"], "correctAnswers": ["red"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 7, '{"korean": "파란 하늘", "template": "The sky is ___.", "blanks": 1, "wordOptions": ["red", "blue", "green", "yellow"], "correctAnswers": ["blue"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 8, '{"korean": "초록 나무", "template": "The tree is ___.", "blanks": 1, "wordOptions": ["red", "blue", "green", "yellow"], "correctAnswers": ["green"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 9, '{"korean": "노란 바나나", "template": "The banana is ___.", "blanks": 1, "wordOptions": ["red", "blue", "green", "yellow"], "correctAnswers": ["yellow"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 10, '{"korean": "검은 고양이", "template": "The cat is ___.", "blanks": 1, "wordOptions": ["black", "white", "red", "blue"], "correctAnswers": ["black"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 11, '{"korean": "흰 구름", "template": "The cloud is ___.", "blanks": 1, "wordOptions": ["black", "white", "red", "blue"], "correctAnswers": ["white"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 12, '{"korean": "나는 빨간 사과를 좋아해요", "template": "I like ___ ___.", "blanks": 2, "wordOptions": ["red", "blue", "green", "apple", "banana", "orange"], "correctAnswers": ["red", "apple"]}'),
('drag_drop', 'elementary_low', 1, 3, '숫자와 색깔', 13, '{"korean": "책이 세 권 있어요", "template": "I have ___ ___.", "blanks": 2, "wordOptions": ["one", "two", "three", "book", "books", "pen"], "correctAnswers": ["three", "books"]}'),

-- ============================================
-- 2학년: Drag & Drop 미션 (Unit 4-6)
-- ============================================

-- Unit 4: 동물 (2학년) - 13개 미션
('drag_drop', 'elementary_low', 2, 4, '동물', 1, '{"korean": "나는 고양이를 키워요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["dog", "cat", "bird", "fish"], "correctAnswers": ["cat"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 2, '{"korean": "강아지가 짖어요", "template": "The dog ___.", "blanks": 1, "wordOptions": ["sleeps", "barks", "eats", "runs"], "correctAnswers": ["barks"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 3, '{"korean": "새가 날아가요", "template": "The bird ___.", "blanks": 1, "wordOptions": ["flies", "swims", "runs", "jumps"], "correctAnswers": ["flies"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 4, '{"korean": "물고기가 헤엄쳐요", "template": "The fish ___.", "blanks": 1, "wordOptions": ["flies", "swims", "runs", "jumps"], "correctAnswers": ["swims"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 5, '{"korean": "토끼가 뛰어요", "template": "The rabbit ___.", "blanks": 1, "wordOptions": ["flies", "swims", "runs", "jumps"], "correctAnswers": ["jumps"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 6, '{"korean": "말이 달려요", "template": "The horse ___.", "blanks": 1, "wordOptions": ["flies", "swims", "runs", "jumps"], "correctAnswers": ["runs"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 7, '{"korean": "소가 풀을 먹어요", "template": "The cow eats ___.", "blanks": 1, "wordOptions": ["meat", "grass", "fish", "bread"], "correctAnswers": ["grass"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 8, '{"korean": "돼지가 귀여워요", "template": "The ___ is cute.", "blanks": 1, "wordOptions": ["pig", "cow", "horse", "sheep"], "correctAnswers": ["pig"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 9, '{"korean": "코끼리가 커요", "template": "The ___ is big.", "blanks": 1, "wordOptions": ["elephant", "mouse", "bird", "fish"], "correctAnswers": ["elephant"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 10, '{"korean": "호랑이가 무서워요", "template": "The ___ is scary.", "blanks": 1, "wordOptions": ["tiger", "rabbit", "cat", "dog"], "correctAnswers": ["tiger"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 11, '{"korean": "사자가 강해요", "template": "The ___ is strong.", "blanks": 1, "wordOptions": ["lion", "rabbit", "mouse", "bird"], "correctAnswers": ["lion"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 12, '{"korean": "동물원에 가요", "template": "I go to the ___.", "blanks": 1, "wordOptions": ["zoo", "park", "school", "home"], "correctAnswers": ["zoo"]}'),
('drag_drop', 'elementary_low', 2, 4, '동물', 13, '{"korean": "강아지가 귀여워요", "template": "The ___ is cute.", "blanks": 1, "wordOptions": ["dog", "cat", "bird", "fish"], "correctAnswers": ["dog"]}'),

-- Unit 5: 음식 (2학년) - 13개 미션
('drag_drop', 'elementary_low', 2, 5, '음식', 1, '{"korean": "나는 물을 마셔요", "template": "I drink ___.", "blanks": 1, "wordOptions": ["juice", "milk", "water", "tea"], "correctAnswers": ["water"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 2, '{"korean": "빵을 먹어요", "template": "I eat ___.", "blanks": 1, "wordOptions": ["rice", "bread", "soup", "meat"], "correctAnswers": ["bread"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 3, '{"korean": "사과를 좋아해요", "template": "I like ___.", "blanks": 1, "wordOptions": ["apple", "banana", "orange", "grape"], "correctAnswers": ["apple"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 4, '{"korean": "바나나를 먹어요", "template": "I eat an ___.", "blanks": 1, "wordOptions": ["apple", "banana", "orange", "grape"], "correctAnswers": ["banana"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 5, '{"korean": "우유를 마셔요", "template": "I drink ___.", "blanks": 1, "wordOptions": ["juice", "milk", "water", "tea"], "correctAnswers": ["milk"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 6, '{"korean": "밥을 먹어요", "template": "I eat ___.", "blanks": 1, "wordOptions": ["rice", "bread", "soup", "meat"], "correctAnswers": ["rice"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 7, '{"korean": "계란을 먹어요", "template": "I eat an ___.", "blanks": 1, "wordOptions": ["egg", "apple", "orange", "banana"], "correctAnswers": ["egg"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 8, '{"korean": "케이크가 맛있어요", "template": "The ___ is delicious.", "blanks": 1, "wordOptions": ["cake", "bread", "rice", "soup"], "correctAnswers": ["cake"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 9, '{"korean": "사탕을 좋아해요", "template": "I like ___.", "blanks": 1, "wordOptions": ["candy", "chocolate", "cake", "cookie"], "correctAnswers": ["candy"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 10, '{"korean": "초콜릿을 먹어요", "template": "I eat ___.", "blanks": 1, "wordOptions": ["candy", "chocolate", "cake", "cookie"], "correctAnswers": ["chocolate"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 11, '{"korean": "아침을 먹어요", "template": "I eat ___.", "blanks": 1, "wordOptions": ["breakfast", "lunch", "dinner", "snack"], "correctAnswers": ["breakfast"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 12, '{"korean": "점심을 먹어요", "template": "I eat ___.", "blanks": 1, "wordOptions": ["breakfast", "lunch", "dinner", "snack"], "correctAnswers": ["lunch"]}'),
('drag_drop', 'elementary_low', 2, 5, '음식', 13, '{"korean": "저녁을 먹어요", "template": "I eat ___.", "blanks": 1, "wordOptions": ["breakfast", "lunch", "dinner", "snack"], "correctAnswers": ["dinner"]}'),

-- Unit 6: 신체 (2학년) - 13개 미션
('drag_drop', 'elementary_low', 2, 6, '신체', 1, '{"korean": "나는 두 개의 눈이 있어요", "template": "I have two ___.", "blanks": 1, "wordOptions": ["eyes", "ears", "hands", "feet"], "correctAnswers": ["eyes"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 2, '{"korean": "손으로 글을 써요", "template": "I write with my ___.", "blanks": 1, "wordOptions": ["head", "hand", "foot", "leg"], "correctAnswers": ["hand"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 3, '{"korean": "머리가 있어요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["head", "hand", "foot", "leg"], "correctAnswers": ["head"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 4, '{"korean": "귀가 두 개 있어요", "template": "I have two ___.", "blanks": 1, "wordOptions": ["eyes", "ears", "hands", "feet"], "correctAnswers": ["ears"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 5, '{"korean": "코가 있어요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["nose", "mouth", "eye", "ear"], "correctAnswers": ["nose"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 6, '{"korean": "입으로 먹어요", "template": "I eat with my ___.", "blanks": 1, "wordOptions": ["nose", "mouth", "eye", "ear"], "correctAnswers": ["mouth"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 7, '{"korean": "다리가 두 개 있어요", "template": "I have two ___.", "blanks": 1, "wordOptions": ["arms", "legs", "hands", "feet"], "correctAnswers": ["legs"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 8, '{"korean": "팔이 두 개 있어요", "template": "I have two ___.", "blanks": 1, "wordOptions": ["arms", "legs", "hands", "feet"], "correctAnswers": ["arms"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 9, '{"korean": "발이 두 개 있어요", "template": "I have two ___.", "blanks": 1, "wordOptions": ["arms", "legs", "hands", "feet"], "correctAnswers": ["feet"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 10, '{"korean": "손이 두 개 있어요", "template": "I have two ___.", "blanks": 1, "wordOptions": ["arms", "legs", "hands", "feet"], "correctAnswers": ["hands"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 11, '{"korean": "몸이 있어요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["body", "head", "hand", "foot"], "correctAnswers": ["body"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 12, '{"korean": "얼굴이 있어요", "template": "I have a ___.", "blanks": 1, "wordOptions": ["face", "head", "hand", "foot"], "correctAnswers": ["face"]}'),
('drag_drop', 'elementary_low', 2, 6, '신체', 13, '{"korean": "머리카락이 있어요", "template": "I have ___.", "blanks": 1, "wordOptions": ["hair", "head", "hand", "foot"], "correctAnswers": ["hair"]}');

-- ============================================
-- 3학년: 키보드 입력 미션 (Unit 7-9)
-- ============================================

-- Unit 7: 학교와 학습 (3학년) - 15개 미션
INSERT INTO missions (mission_type, grade_level, grade, unit, topic, order_in_unit, mission_data) VALUES
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 1, '{"korean": "나는 학교에 가요", "vocabulary": ["I", "go", "to", "school"], "example": "I go to school."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 2, '{"korean": "선생님께 인사해요", "vocabulary": ["I", "say", "hello", "to", "my", "teacher"], "example": "I say hello to my teacher."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 3, '{"korean": "친구와 함께 놀아요", "vocabulary": ["I", "play", "with", "my", "friend"], "example": "I play with my friend."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 4, '{"korean": "책을 읽어요", "vocabulary": ["I", "read", "a", "book"], "example": "I read a book."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 5, '{"korean": "연필로 글을 써요", "vocabulary": ["I", "write", "with", "a", "pencil"], "example": "I write with a pencil."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 6, '{"korean": "학생이에요", "vocabulary": ["I", "am", "a", "student"], "example": "I am a student."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 7, '{"korean": "교실에 있어요", "vocabulary": ["I", "am", "in", "the", "classroom"], "example": "I am in the classroom."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 8, '{"korean": "공부를 해요", "vocabulary": ["I", "study"], "example": "I study."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 9, '{"korean": "배워요", "vocabulary": ["I", "learn"], "example": "I learn."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 10, '{"korean": "숙제를 해요", "vocabulary": ["I", "do", "my", "homework"], "example": "I do my homework."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 11, '{"korean": "시험을 봐요", "vocabulary": ["I", "take", "a", "test"], "example": "I take a test."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 12, '{"korean": "수업에 참여해요", "vocabulary": ["I", "join", "the", "class"], "example": "I join the class."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 13, '{"korean": "반에 있어요", "vocabulary": ["I", "am", "in", "class"], "example": "I am in class."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 14, '{"korean": "펜을 사용해요", "vocabulary": ["I", "use", "a", "pen"], "example": "I use a pen."}'),
('keyboard', 'elementary_low', 3, 7, '학교와 학습', 15, '{"korean": "학년이에요", "vocabulary": ["I", "am", "in", "grade", "three"], "example": "I am in grade three."}'),

-- Unit 8: 일상생활 (3학년) - 15개 미션
('keyboard', 'elementary_low', 3, 8, '일상생활', 1, '{"korean": "나는 매일 아침 일찍 일어나요", "vocabulary": ["I", "wake", "up", "early", "every", "morning"], "example": "I wake up early every morning."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 2, '{"korean": "저녁에 숙제를 해요", "vocabulary": ["I", "do", "my", "homework", "in", "the", "evening"], "example": "I do my homework in the evening."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 3, '{"korean": "오늘 날씨가 좋아요", "vocabulary": ["The", "weather", "is", "nice", "today"], "example": "The weather is nice today."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 4, '{"korean": "내일 학교에 가요", "vocabulary": ["I", "go", "to", "school", "tomorrow"], "example": "I go to school tomorrow."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 5, '{"korean": "어제 친구를 만났어요", "vocabulary": ["I", "met", "my", "friend", "yesterday"], "example": "I met my friend yesterday."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 6, '{"korean": "아침에 일어나요", "vocabulary": ["I", "wake", "up", "in", "the", "morning"], "example": "I wake up in the morning."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 7, '{"korean": "오후에 놀아요", "vocabulary": ["I", "play", "in", "the", "afternoon"], "example": "I play in the afternoon."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 8, '{"korean": "밤에 잠을 자요", "vocabulary": ["I", "sleep", "at", "night"], "example": "I sleep at night."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 9, '{"korean": "하루가 지나가요", "vocabulary": ["A", "day", "passes"], "example": "A day passes."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 10, '{"korean": "일주일이에요", "vocabulary": ["It", "is", "a", "week"], "example": "It is a week."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 11, '{"korean": "한 달이에요", "vocabulary": ["It", "is", "a", "month"], "example": "It is a month."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 12, '{"korean": "일 년이에요", "vocabulary": ["It", "is", "a", "year"], "example": "It is a year."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 13, '{"korean": "지금 공부해요", "vocabulary": ["I", "study", "now"], "example": "I study now."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 14, '{"korean": "오늘은 월요일이에요", "vocabulary": ["Today", "is", "Monday"], "example": "Today is Monday."}'),
('keyboard', 'elementary_low', 3, 8, '일상생활', 15, '{"korean": "매일 반복해요", "vocabulary": ["I", "repeat", "every", "day"], "example": "I repeat every day."}'),

-- Unit 9: 감정과 느낌 (3학년) - 15개 미션
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 1, '{"korean": "나는 행복해요", "vocabulary": ["I", "am", "happy"], "example": "I am happy."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 2, '{"korean": "영화를 보는 것을 좋아해요", "vocabulary": ["I", "like", "watching", "movies"], "example": "I like watching movies."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 3, '{"korean": "슬퍼요", "vocabulary": ["I", "am", "sad"], "example": "I am sad."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 4, '{"korean": "화가 나요", "vocabulary": ["I", "am", "angry"], "example": "I am angry."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 5, '{"korean": "신나요", "vocabulary": ["I", "am", "excited"], "example": "I am excited."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 6, '{"korean": "피곤해요", "vocabulary": ["I", "am", "tired"], "example": "I am tired."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 7, '{"korean": "무서워요", "vocabulary": ["I", "am", "afraid"], "example": "I am afraid."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 8, '{"korean": "놀라워요", "vocabulary": ["I", "am", "surprised"], "example": "I am surprised."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 9, '{"korean": "걱정돼요", "vocabulary": ["I", "am", "worried"], "example": "I am worried."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 10, '{"korean": "기분이 좋아요", "vocabulary": ["I", "feel", "good"], "example": "I feel good."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 11, '{"korean": "사랑해요", "vocabulary": ["I", "love"], "example": "I love."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 12, '{"korean": "좋아해요", "vocabulary": ["I", "like"], "example": "I like."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 13, '{"korean": "즐거워요", "vocabulary": ["I", "enjoy"], "example": "I enjoy."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 14, '{"korean": "기분을 느껴요", "vocabulary": ["I", "feel"], "example": "I feel."}'),
('keyboard', 'elementary_low', 3, 9, '감정과 느낌', 15, '{"korean": "기쁘게 느껴요", "vocabulary": ["I", "feel", "happy"], "example": "I feel happy."}');

-- ============================================
-- 4학년: 키보드 입력 미션 (Unit 10-12)
-- ============================================

-- Unit 10: 취미와 활동 (4학년) - 15개 미션
INSERT INTO missions (mission_type, grade_level, grade, unit, topic, order_in_unit, mission_data) VALUES
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 1, '{"korean": "나는 축구를 좋아해요", "vocabulary": ["I", "like", "playing", "soccer"], "example": "I like playing soccer."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 2, '{"korean": "주말에 책을 읽어요", "vocabulary": ["I", "read", "books", "on", "weekends"], "example": "I read books on weekends."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 3, '{"korean": "노래를 불러요", "vocabulary": ["I", "sing", "a", "song"], "example": "I sing a song."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 4, '{"korean": "춤을 춰요", "vocabulary": ["I", "dance"], "example": "I dance."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 5, '{"korean": "그림을 그려요", "vocabulary": ["I", "draw", "a", "picture"], "example": "I draw a picture."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 6, '{"korean": "수영을 해요", "vocabulary": ["I", "swim"], "example": "I swim."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 7, '{"korean": "달려요", "vocabulary": ["I", "run"], "example": "I run."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 8, '{"korean": "걸어요", "vocabulary": ["I", "walk"], "example": "I walk."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 9, '{"korean": "게임을 해요", "vocabulary": ["I", "play", "games"], "example": "I play games."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 10, '{"korean": "운동을 해요", "vocabulary": ["I", "play", "sports"], "example": "I play sports."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 11, '{"korean": "음악을 들어요", "vocabulary": ["I", "listen", "to", "music"], "example": "I listen to music."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 12, '{"korean": "취미가 있어요", "vocabulary": ["I", "have", "a", "hobby"], "example": "I have a hobby."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 13, '{"korean": "재미있어요", "vocabulary": ["It", "is", "fun"], "example": "It is fun."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 14, '{"korean": "흥미로워요", "vocabulary": ["It", "is", "interesting"], "example": "It is interesting."}'),
('keyboard', 'elementary_high', 4, 10, '취미와 활동', 15, '{"korean": "활동을 즐겨요", "vocabulary": ["I", "enjoy", "activities"], "example": "I enjoy activities."}'),

-- Unit 11: 날씨와 계절 (4학년) - 15개 미션
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 1, '{"korean": "오늘 날씨가 좋아요", "vocabulary": ["The", "weather", "is", "nice", "today"], "example": "The weather is nice today."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 2, '{"korean": "여름에는 바다에 가요", "vocabulary": ["I", "go", "to", "the", "beach", "in", "summer"], "example": "I go to the beach in summer."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 3, '{"korean": "맑아요", "vocabulary": ["It", "is", "sunny"], "example": "It is sunny."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 4, '{"korean": "비가 와요", "vocabulary": ["It", "is", "rainy"], "example": "It is rainy."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 5, '{"korean": "흐려요", "vocabulary": ["It", "is", "cloudy"], "example": "It is cloudy."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 6, '{"korean": "눈이 와요", "vocabulary": ["It", "is", "snowy"], "example": "It is snowy."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 7, '{"korean": "더워요", "vocabulary": ["It", "is", "hot"], "example": "It is hot."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 8, '{"korean": "추워요", "vocabulary": ["It", "is", "cold"], "example": "It is cold."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 9, '{"korean": "따뜻해요", "vocabulary": ["It", "is", "warm"], "example": "It is warm."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 10, '{"korean": "시원해요", "vocabulary": ["It", "is", "cool"], "example": "It is cool."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 11, '{"korean": "봄이에요", "vocabulary": ["It", "is", "spring"], "example": "It is spring."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 12, '{"korean": "여름이에요", "vocabulary": ["It", "is", "summer"], "example": "It is summer."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 13, '{"korean": "가을이에요", "vocabulary": ["It", "is", "autumn"], "example": "It is autumn."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 14, '{"korean": "겨울이에요", "vocabulary": ["It", "is", "winter"], "example": "It is winter."}'),
('keyboard', 'elementary_high', 4, 11, '날씨와 계절', 15, '{"korean": "계절이 바뀌어요", "vocabulary": ["The", "season", "changes"], "example": "The season changes."}'),

-- Unit 12: 장소와 여행 (4학년) - 15개 미션
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 1, '{"korean": "나는 바다에 가고 싶어요", "vocabulary": ["I", "want", "to", "go", "to", "the", "beach"], "example": "I want to go to the beach."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 2, '{"korean": "가족과 함께 여행을 떠나요", "vocabulary": ["I", "travel", "with", "my", "family"], "example": "I travel with my family."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 3, '{"korean": "집에 있어요", "vocabulary": ["I", "am", "at", "home"], "example": "I am at home."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 4, '{"korean": "공원에 가요", "vocabulary": ["I", "go", "to", "the", "park"], "example": "I go to the park."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 5, '{"korean": "산에 올라가요", "vocabulary": ["I", "climb", "the", "mountain"], "example": "I climb the mountain."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 6, '{"korean": "도시에 살아요", "vocabulary": ["I", "live", "in", "a", "city"], "example": "I live in a city."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 7, '{"korean": "나라를 방문해요", "vocabulary": ["I", "visit", "a", "country"], "example": "I visit a country."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 8, '{"korean": "여행을 떠나요", "vocabulary": ["I", "go", "on", "a", "trip"], "example": "I go on a trip."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 9, '{"korean": "장소를 찾아요", "vocabulary": ["I", "find", "a", "place"], "example": "I find a place."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 10, '{"korean": "휴가를 가요", "vocabulary": ["I", "go", "on", "vacation"], "example": "I go on vacation."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 11, '{"korean": "새로운 곳을 탐험해요", "vocabulary": ["I", "explore", "new", "places"], "example": "I explore new places."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 12, '{"korean": "여행이 재미있어요", "vocabulary": ["Traveling", "is", "fun"], "example": "Traveling is fun."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 13, '{"korean": "집으로 돌아가요", "vocabulary": ["I", "return", "home"], "example": "I return home."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 14, '{"korean": "방문을 즐겨요", "vocabulary": ["I", "enjoy", "visiting"], "example": "I enjoy visiting."}'),
('keyboard', 'elementary_high', 4, 12, '장소와 여행', 15, '{"korean": "여행 계획을 세워요", "vocabulary": ["I", "plan", "a", "trip"], "example": "I plan a trip."}');

-- ============================================
-- 5학년: 키보드 입력 미션 (Unit 13-15)
-- ============================================

-- Unit 13: 신체와 건강 (5학년) - 17개 미션
INSERT INTO missions (mission_type, grade_level, grade, unit, topic, order_in_unit, mission_data) VALUES
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 1, '{"korean": "나는 머리가 아파요", "vocabulary": ["I", "have", "a", "headache"], "example": "I have a headache."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 2, '{"korean": "병원에 가요", "vocabulary": ["I", "go", "to", "the", "hospital"], "example": "I go to the hospital."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 3, '{"korean": "의사를 만나요", "vocabulary": ["I", "see", "a", "doctor"], "example": "I see a doctor."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 4, '{"korean": "약을 먹어요", "vocabulary": ["I", "take", "medicine"], "example": "I take medicine."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 5, '{"korean": "아파요", "vocabulary": ["I", "am", "sick"], "example": "I am sick."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 6, '{"korean": "아픔을 느껴요", "vocabulary": ["I", "feel", "pain"], "example": "I feel pain."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 7, '{"korean": "다쳤어요", "vocabulary": ["I", "am", "hurt"], "example": "I am hurt."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 8, '{"korean": "기분이 나아졌어요", "vocabulary": ["I", "feel", "better"], "example": "I feel better."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 9, '{"korean": "건강해요", "vocabulary": ["I", "am", "well"], "example": "I am well."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 10, '{"korean": "몸이 좋아요", "vocabulary": ["My", "body", "is", "good"], "example": "My body is good."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 11, '{"korean": "건강을 유지해요", "vocabulary": ["I", "maintain", "my", "health"], "example": "I maintain my health."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 12, '{"korean": "운동을 해요", "vocabulary": ["I", "exercise"], "example": "I exercise."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 13, '{"korean": "신체 부위를 알아요", "vocabulary": ["I", "know", "body", "parts"], "example": "I know body parts."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 14, '{"korean": "건강한 생활을 해요", "vocabulary": ["I", "live", "a", "healthy", "life"], "example": "I live a healthy life."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 15, '{"korean": "의료진을 만나요", "vocabulary": ["I", "meet", "medical", "staff"], "example": "I meet medical staff."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 16, '{"korean": "치료를 받아요", "vocabulary": ["I", "receive", "treatment"], "example": "I receive treatment."}'),
('keyboard', 'elementary_high', 5, 13, '신체와 건강', 17, '{"korean": "건강을 돌봐요", "vocabulary": ["I", "take", "care", "of", "my", "health"], "example": "I take care of my health."}'),

-- Unit 14: 과학과 자연 (5학년) - 17개 미션
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 1, '{"korean": "태양은 밝아요", "vocabulary": ["The", "sun", "is", "bright"], "example": "The sun is bright."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 2, '{"korean": "식물에 물을 줘요", "vocabulary": ["I", "water", "the", "plants"], "example": "I water the plants."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 3, '{"korean": "과학을 배워요", "vocabulary": ["I", "learn", "science"], "example": "I learn science."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 4, '{"korean": "자연을 관찰해요", "vocabulary": ["I", "observe", "nature"], "example": "I observe nature."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 5, '{"korean": "지구가 커요", "vocabulary": ["The", "earth", "is", "big"], "example": "The earth is big."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 6, '{"korean": "달이 밝아요", "vocabulary": ["The", "moon", "is", "bright"], "example": "The moon is bright."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 7, '{"korean": "별이 반짝여요", "vocabulary": ["The", "star", "twinkles"], "example": "The star twinkles."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 8, '{"korean": "물이 필요해요", "vocabulary": ["Water", "is", "necessary"], "example": "Water is necessary."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 9, '{"korean": "공기가 있어요", "vocabulary": ["There", "is", "air"], "example": "There is air."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 10, '{"korean": "불이 타요", "vocabulary": ["Fire", "burns"], "example": "Fire burns."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 11, '{"korean": "나무가 자라요", "vocabulary": ["The", "tree", "grows"], "example": "The tree grows."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 12, '{"korean": "꽃이 피어요", "vocabulary": ["The", "flower", "blooms"], "example": "The flower blooms."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 13, '{"korean": "동물이 살아요", "vocabulary": ["Animals", "live"], "example": "Animals live."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 14, '{"korean": "실험을 해요", "vocabulary": ["I", "do", "an", "experiment"], "example": "I do an experiment."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 15, '{"korean": "변화를 관찰해요", "vocabulary": ["I", "observe", "changes"], "example": "I observe changes."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 16, '{"korean": "발견을 해요", "vocabulary": ["I", "make", "a", "discovery"], "example": "I make a discovery."}'),
('keyboard', 'elementary_high', 5, 14, '과학과 자연', 17, '{"korean": "자연 현상을 이해해요", "vocabulary": ["I", "understand", "natural", "phenomena"], "example": "I understand natural phenomena."}'),

-- Unit 15: 사회와 문화 (5학년) - 16개 미션
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 1, '{"korean": "우리는 명절을 축하해요", "vocabulary": ["We", "celebrate", "holidays"], "example": "We celebrate holidays."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 2, '{"korean": "다양한 문화를 배워요", "vocabulary": ["I", "learn", "about", "different", "cultures"], "example": "I learn about different cultures."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 3, '{"korean": "나라에 살아요", "vocabulary": ["I", "live", "in", "a", "country"], "example": "I live in a country."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 4, '{"korean": "도시가 커요", "vocabulary": ["The", "city", "is", "big"], "example": "The city is big."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 5, '{"korean": "사람들이 살아요", "vocabulary": ["People", "live"], "example": "People live."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 6, '{"korean": "문화를 이해해요", "vocabulary": ["I", "understand", "culture"], "example": "I understand culture."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 7, '{"korean": "전통을 지켜요", "vocabulary": ["I", "keep", "traditions"], "example": "I keep traditions."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 8, '{"korean": "축제를 즐겨요", "vocabulary": ["I", "enjoy", "festivals"], "example": "I enjoy festivals."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 9, '{"korean": "명절을 보내요", "vocabulary": ["I", "spend", "holidays"], "example": "I spend holidays."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 10, '{"korean": "공동체에 속해요", "vocabulary": ["I", "belong", "to", "a", "community"], "example": "I belong to a community."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 11, '{"korean": "사회에 참여해요", "vocabulary": ["I", "participate", "in", "society"], "example": "I participate in society."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 12, '{"korean": "세계를 알아가요", "vocabulary": ["I", "learn", "about", "the", "world"], "example": "I learn about the world."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 13, '{"korean": "다른 점을 이해해요", "vocabulary": ["I", "understand", "differences"], "example": "I understand differences."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 14, '{"korean": "같은 점을 찾아요", "vocabulary": ["I", "find", "similarities"], "example": "I find similarities."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 15, '{"korean": "함께 살아가요", "vocabulary": ["We", "live", "together"], "example": "We live together."}'),
('keyboard', 'elementary_high', 5, 15, '사회와 문화', 16, '{"korean": "문화 교류를 해요", "vocabulary": ["I", "exchange", "cultures"], "example": "I exchange cultures."}');

-- ============================================
-- 6학년: 키보드 입력 미션 (Unit 16-17)
-- ============================================

-- Unit 16: 미래와 꿈 (6학년) - 18개 미션
INSERT INTO missions (mission_type, grade_level, grade, unit, topic, order_in_unit, mission_data) VALUES
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 1, '{"korean": "나는 꿈을 이루고 싶어요", "vocabulary": ["I", "want", "to", "achieve", "my", "dreams"], "example": "I want to achieve my dreams."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 2, '{"korean": "미래에 의사가 되고 싶어요", "vocabulary": ["I", "want", "to", "be", "a", "doctor", "in", "the", "future"], "example": "I want to be a doctor in the future."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 3, '{"korean": "희망을 가져요", "vocabulary": ["I", "have", "hope"], "example": "I have hope."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 4, '{"korean": "소원을 빌어요", "vocabulary": ["I", "make", "a", "wish"], "example": "I make a wish."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 5, '{"korean": "목표를 세워요", "vocabulary": ["I", "set", "a", "goal"], "example": "I set a goal."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 6, '{"korean": "성공을 원해요", "vocabulary": ["I", "want", "success"], "example": "I want success."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 7, '{"korean": "도전을 받아들여요", "vocabulary": ["I", "accept", "challenges"], "example": "I accept challenges."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 8, '{"korean": "기회를 잡아요", "vocabulary": ["I", "seize", "opportunities"], "example": "I seize opportunities."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 9, '{"korean": "계획을 세워요", "vocabulary": ["I", "make", "a", "plan"], "example": "I make a plan."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 10, '{"korean": "직업을 선택해요", "vocabulary": ["I", "choose", "a", "career"], "example": "I choose a career."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 11, '{"korean": "일을 해요", "vocabulary": ["I", "work"], "example": "I work."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 12, '{"korean": "공부를 계속해요", "vocabulary": ["I", "continue", "studying"], "example": "I continue studying."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 13, '{"korean": "배움을 추구해요", "vocabulary": ["I", "pursue", "learning"], "example": "I pursue learning."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 14, '{"korean": "향상을 추구해요", "vocabulary": ["I", "seek", "improvement"], "example": "I seek improvement."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 15, '{"korean": "미래를 준비해요", "vocabulary": ["I", "prepare", "for", "the", "future"], "example": "I prepare for the future."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 16, '{"korean": "꿈을 키워가요", "vocabulary": ["I", "nurture", "my", "dreams"], "example": "I nurture my dreams."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 17, '{"korean": "목표를 향해 나아가요", "vocabulary": ["I", "move", "toward", "my", "goals"], "example": "I move toward my goals."}'),
('keyboard', 'elementary_high', 6, 16, '미래와 꿈', 18, '{"korean": "성장을 계속해요", "vocabulary": ["I", "continue", "growing"], "example": "I continue growing."}'),

-- Unit 17: 고급 표현 (6학년) - 17개 미션
('keyboard', 'elementary_high', 6, 17, '고급 표현', 1, '{"korean": "나는 실력을 향상시키고 싶어요", "vocabulary": ["I", "want", "to", "improve", "my", "skills"], "example": "I want to improve my skills."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 2, '{"korean": "새로운 방법을 찾아요", "vocabulary": ["I", "discover", "new", "methods"], "example": "I discover new methods."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 3, '{"korean": "개발을 해요", "vocabulary": ["I", "develop"], "example": "I develop."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 4, '{"korean": "창조를 해요", "vocabulary": ["I", "create"], "example": "I create."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 5, '{"korean": "분석을 해요", "vocabulary": ["I", "analyze"], "example": "I analyze."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 6, '{"korean": "평가를 해요", "vocabulary": ["I", "evaluate"], "example": "I evaluate."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 7, '{"korean": "개념을 이해해요", "vocabulary": ["I", "understand", "concepts"], "example": "I understand concepts."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 8, '{"korean": "전략을 세워요", "vocabulary": ["I", "develop", "a", "strategy"], "example": "I develop a strategy."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 9, '{"korean": "해결책을 찾아요", "vocabulary": ["I", "find", "a", "solution"], "example": "I find a solution."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 10, '{"korean": "문제를 해결해요", "vocabulary": ["I", "solve", "problems"], "example": "I solve problems."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 11, '{"korean": "생각을 해요", "vocabulary": ["I", "think"], "example": "I think."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 12, '{"korean": "이해를 해요", "vocabulary": ["I", "understand"], "example": "I understand."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 13, '{"korean": "설명을 해요", "vocabulary": ["I", "explain"], "example": "I explain."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 14, '{"korean": "묘사를 해요", "vocabulary": ["I", "describe"], "example": "I describe."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 15, '{"korean": "표현을 해요", "vocabulary": ["I", "express"], "example": "I express."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 16, '{"korean": "복잡한 생각을 해요", "vocabulary": ["I", "think", "complex", "thoughts"], "example": "I think complex thoughts."}'),
('keyboard', 'elementary_high', 6, 17, '고급 표현', 17, '{"korean": "고급 표현을 사용해요", "vocabulary": ["I", "use", "advanced", "expressions"], "example": "I use advanced expressions."}')

ON CONFLICT DO NOTHING;
