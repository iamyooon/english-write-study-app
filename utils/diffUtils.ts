/**
 * Diff 유틸리티
 * 원문과 교정문을 비교하여 차이점을 찾는 함수
 */

export interface DiffSegment {
  text: string;
  type: 'unchanged' | 'deleted' | 'added';
}

/**
 * 두 텍스트를 비교하여 Diff 세그먼트 배열을 반환
 * 단어 단위로 비교
 */
export function computeDiff(original: string, corrected: string): DiffSegment[] {
  const originalWords = original.split(/(\s+)/);
  const correctedWords = corrected.split(/(\s+)/);
  const segments: DiffSegment[] = [];

  let i = 0;
  let j = 0;

  while (i < originalWords.length || j < correctedWords.length) {
    if (i >= originalWords.length) {
      // 원문이 끝났으면 교정문의 나머지는 추가된 것
      segments.push({ text: correctedWords[j], type: 'added' });
      j++;
    } else if (j >= correctedWords.length) {
      // 교정문이 끝났으면 원문의 나머지는 삭제된 것
      segments.push({ text: originalWords[i], type: 'deleted' });
      i++;
    } else if (originalWords[i] === correctedWords[j]) {
      // 동일한 단어는 변경되지 않음
      segments.push({ text: originalWords[i], type: 'unchanged' });
      i++;
      j++;
    } else {
      // 다르면 변경된 것
      // 더 정교한 비교를 위해 문장 단위로 비교
      const originalSentence = original.slice(
        original.indexOf(originalWords[i]),
        original.indexOf(originalWords[Math.min(i + 10, originalWords.length - 1)]) + originalWords[Math.min(i + 10, originalWords.length - 1)].length
      );
      const correctedSentence = corrected.slice(
        corrected.indexOf(correctedWords[j]),
        corrected.indexOf(correctedWords[Math.min(j + 10, correctedWords.length - 1)]) + correctedWords[Math.min(j + 10, correctedWords.length - 1)].length
      );

      if (originalSentence !== correctedSentence) {
        segments.push({ text: originalWords[i], type: 'deleted' });
        segments.push({ text: correctedWords[j], type: 'added' });
      }
      i++;
      j++;
    }
  }

  return segments;
}

/**
 * 더 간단한 문장 단위 비교 함수
 */
export function computeSentenceDiff(original: string, corrected: string): DiffSegment[] {
  const segments: DiffSegment[] = [];
  
  if (original === corrected) {
    return [{ text: original, type: 'unchanged' }];
  }

  // 문장을 단어 단위로 분할 (공백 포함)
  const originalTokens = original.split(/(\s+)/);
  const correctedTokens = corrected.split(/(\s+)/);

  // LCS (Longest Common Subsequence) 기반 비교
  const lcs = longestCommonSubsequence(originalTokens, correctedTokens);
  
  let originalIdx = 0;
  let correctedIdx = 0;
  let lcsIdx = 0;

  while (originalIdx < originalTokens.length || correctedIdx < correctedTokens.length) {
    // 원문과 교정문 모두 LCS에 포함된 경우 (변경되지 않음)
    if (
      lcsIdx < lcs.length &&
      originalIdx < originalTokens.length &&
      originalTokens[originalIdx] === lcs[lcsIdx] &&
      correctedIdx < correctedTokens.length &&
      correctedTokens[correctedIdx] === lcs[lcsIdx]
    ) {
      segments.push({ text: originalTokens[originalIdx], type: 'unchanged' });
      originalIdx++;
      correctedIdx++;
      lcsIdx++;
    } else {
      // 원문에만 있는 경우 (삭제됨)
      if (originalIdx < originalTokens.length && (lcsIdx >= lcs.length || originalTokens[originalIdx] !== lcs[lcsIdx])) {
        segments.push({ text: originalTokens[originalIdx], type: 'deleted' });
        originalIdx++;
      }
      // 교정문에만 있는 경우 (추가됨)
      if (correctedIdx < correctedTokens.length && (lcsIdx >= lcs.length || correctedTokens[correctedIdx] !== lcs[lcsIdx])) {
        segments.push({ text: correctedTokens[correctedIdx], type: 'added' });
        correctedIdx++;
      }
    }
  }

  return segments;
}

/**
 * LCS (Longest Common Subsequence) 계산
 */
function longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // LCS 역추적
  const lcs: string[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}
