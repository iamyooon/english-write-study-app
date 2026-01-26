const fs = require('fs');

// words_by_level.json 변환
const wordsByLevel = JSON.parse(fs.readFileSync('words_by_level.json', 'utf8'));
const grade1 = [...new Set([...wordsByLevel.level1.words, ...wordsByLevel.level2.words])];
const grade2 = [...new Set([...wordsByLevel.level3.words, ...wordsByLevel.level4.words])];
const grade3 = [...new Set([...wordsByLevel.level5.words, ...wordsByLevel.level6.words])];
const grade4 = [...new Set([...wordsByLevel.level7.words, ...wordsByLevel.level8.words])];
const grade5 = wordsByLevel.level9.words || [];
const grade6 = wordsByLevel.level10.words || [];

const wordsByGrade = {
  grade1: { wordCount: grade1.length, words: grade1.sort() },
  grade2: { wordCount: grade2.length, words: grade2.sort() },
  grade3: { wordCount: grade3.length, words: grade3.sort() },
  grade4: { wordCount: grade4.length, words: grade4.sort() },
  grade5: { wordCount: grade5.length, words: grade5.sort() },
  grade6: { wordCount: grade6.length, words: grade6.sort() }
};

fs.writeFileSync('words_by_grade.json', JSON.stringify(wordsByGrade, null, 2));
console.log('words_by_grade.json created');

// words_by_level_scored.json 변환
const wordsByLevelScored = JSON.parse(fs.readFileSync('words_by_level_scored.json', 'utf8'));
const grade1Scored = [...new Set([...wordsByLevelScored.level1.words, ...wordsByLevelScored.level2.words])];
const grade2Scored = [...new Set([...wordsByLevelScored.level3.words, ...wordsByLevelScored.level4.words])];
const grade3Scored = [...new Set([...wordsByLevelScored.level5.words, ...wordsByLevelScored.level6.words])];
const grade4Scored = [...new Set([...wordsByLevelScored.level7.words, ...wordsByLevelScored.level8.words])];
const grade5Scored = wordsByLevelScored.level9.words || [];
const grade6Scored = wordsByLevelScored.level10.words || [];

const wordsByGradeScored = {
  grade1: { wordCount: grade1Scored.length, words: grade1Scored.sort() },
  grade2: { wordCount: grade2Scored.length, words: grade2Scored.sort() },
  grade3: { wordCount: grade3Scored.length, words: grade3Scored.sort() },
  grade4: { wordCount: grade4Scored.length, words: grade4Scored.sort() },
  grade5: { wordCount: grade5Scored.length, words: grade5Scored.sort() },
  grade6: { wordCount: grade6Scored.length, words: grade6Scored.sort() }
};

fs.writeFileSync('words_by_grade_scored.json', JSON.stringify(wordsByGradeScored, null, 2));
console.log('words_by_grade_scored.json created');

// word_difficulty_classification.json 변환
const wordDifficulty = JSON.parse(fs.readFileSync('word_difficulty_classification.json', 'utf8'));

const grade1Diff = {
  description: '기초 단어 - Drag & Drop (1학년)',
  wordCount: (wordDifficulty.level1.wordCount || 0) + (wordDifficulty.level2.wordCount || 0),
  categories: [...new Set([...(wordDifficulty.level1.categories || []), ...(wordDifficulty.level2.categories || [])])],
  sampleWords: [...new Set([...(wordDifficulty.level1.sampleWords || []), ...(wordDifficulty.level2.sampleWords || [])])]
};

const grade2Diff = {
  description: '기초 문장 구성 (2학년)',
  wordCount: (wordDifficulty.level3.wordCount || 0) + (wordDifficulty.level4.wordCount || 0),
  categories: [...new Set([...(wordDifficulty.level3.categories || []), ...(wordDifficulty.level4.categories || [])])],
  sampleWords: [...new Set([...(wordDifficulty.level3.sampleWords || []), ...(wordDifficulty.level4.sampleWords || [])])]
};

const grade3Diff = {
  description: '확장 어휘 (3학년)',
  wordCount: (wordDifficulty.level5.wordCount || 0) + (wordDifficulty.level6.wordCount || 0),
  categories: [...new Set([...(wordDifficulty.level5.categories || []), ...(wordDifficulty.level6.categories || [])])],
  sampleWords: [...new Set([...(wordDifficulty.level5.sampleWords || []), ...(wordDifficulty.level6.sampleWords || [])])]
};

const grade4Diff = {
  description: '고급 어휘 (4학년)',
  wordCount: (wordDifficulty.level7.wordCount || 0) + (wordDifficulty.level8.wordCount || 0),
  categories: [...new Set([...(wordDifficulty.level7.categories || []), ...(wordDifficulty.level8.categories || [])])],
  sampleWords: [...new Set([...(wordDifficulty.level7.sampleWords || []), ...(wordDifficulty.level8.sampleWords || [])])]
};

const grade5Diff = {
  description: '심화 어휘 (5학년)',
  wordCount: wordDifficulty.level9.wordCount || 0,
  categories: wordDifficulty.level9.categories || [],
  sampleWords: wordDifficulty.level9.sampleWords || []
};

const grade6Diff = {
  description: '심화 어휘 최고급 (6학년)',
  wordCount: wordDifficulty.level10.wordCount || 0,
  categories: wordDifficulty.level10.categories || [],
  sampleWords: wordDifficulty.level10.sampleWords || []
};

const wordDifficultyByGrade = {
  grade1: grade1Diff,
  grade2: grade2Diff,
  grade3: grade3Diff,
  grade4: grade4Diff,
  grade5: grade5Diff,
  grade6: grade6Diff
};

fs.writeFileSync('word_difficulty_by_grade.json', JSON.stringify(wordDifficultyByGrade, null, 2));
console.log('word_difficulty_by_grade.json created');

console.log('All conversions completed!');
