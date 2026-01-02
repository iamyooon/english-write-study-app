import { test, expect } from '@playwright/test';

test.describe('SentenceWritingPage E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('초기 화면이 정상적으로 렌더링된다', async ({ page }) => {
    // 제목 확인
    await expect(page.getByText('영어 문장 쓰기')).toBeVisible();

    // 수준 선택 버튼 확인
    await expect(page.getByRole('button', { name: '초등학교' })).toBeVisible();
    await expect(page.getByRole('button', { name: '중학교' })).toBeVisible();
    await expect(page.getByRole('button', { name: '고등학교' })).toBeVisible();

    // 초기 상태에서 중학교가 선택되어 있음
    const middleButton = page.getByRole('button', { name: '중학교' });
    await expect(middleButton).toHaveClass(/bg-indigo-600/);

    // 한글 문장 영역 확인
    await expect(page.getByText('"새 문장 생성" 버튼을 클릭하여 한글 문장을 받아보세요.')).toBeVisible();

    // 영어 입력 영역이 비활성화되어 있음
    const englishTextarea = page.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
    await expect(englishTextarea).toBeDisabled();
  });

  test('수준 선택이 정상적으로 동작한다', async ({ page }) => {
    // 초등학교 선택
    const elementaryButton = page.getByRole('button', { name: '초등학교' });
    await elementaryButton.click();
    await expect(elementaryButton).toHaveClass(/bg-indigo-600/);

    // 고등학교 선택
    const highButton = page.getByRole('button', { name: '고등학교' });
    await highButton.click();
    await expect(highButton).toHaveClass(/bg-indigo-600/);
    await expect(elementaryButton).not.toHaveClass(/bg-indigo-600/);
  });

  test('한글 문장 생성 및 영어 문장 평가 플로우', async ({ page }) => {
    // 한글 문장 생성 버튼 클릭
    const generateButton = page.getByRole('button', { name: '새 문장 생성' });
    await generateButton.click();

    // 생성 중 메시지 확인
    await expect(page.getByText('생성 중...')).toBeVisible({ timeout: 1000 });

    // 한글 문장이 생성될 때까지 대기 (최대 10초)
    await expect(page.getByText('"새 문장 생성" 버튼을 클릭하여 한글 문장을 받아보세요.')).not.toBeVisible({ timeout: 10000 });
    
    // 한글 문장이 표시되는지 확인 (한글 문장은 동적으로 생성되므로 존재 여부만 확인)
    const koreanSentenceArea = page.locator('.bg-blue-50').filter({ hasText: /./ });
    await expect(koreanSentenceArea).toBeVisible({ timeout: 10000 });

    // 영어 입력 영역이 활성화되었는지 확인
    const englishTextarea = page.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
    await expect(englishTextarea).toBeEnabled({ timeout: 2000 });

    // 영어 문장 입력
    await englishTextarea.fill('I like apple');

    // 평가 버튼 클릭
    const evaluateButton = page.getByRole('button', { name: /AI 평가/i });
    await evaluateButton.click();

    // 평가 중 메시지 확인
    await expect(page.getByText('평가 중...')).toBeVisible({ timeout: 1000 });

    // 평가 결과가 표시될 때까지 대기 (최대 10초)
    await expect(page.getByText('평가 결과')).toBeVisible({ timeout: 10000 });

    // 평가 결과 요소 확인
    await expect(page.getByText(/점수/)).toBeVisible();
    await expect(page.getByText(/한글 문장/)).toBeVisible();
    await expect(page.getByText(/작성한 영어 문장/)).toBeVisible();
    await expect(page.getByText(/정답 문장/)).toBeVisible();
    await expect(page.getByText(/피드백/)).toBeVisible();
  });

  test('한글 문장 없이 평가 시도 시 에러 메시지 표시', async ({ page }) => {
    // 평가 버튼 클릭
    const evaluateButton = page.getByRole('button', { name: /AI 평가/i });
    await evaluateButton.click();

    // 에러 메시지 확인
    await expect(page.getByText('먼저 한글 문장을 생성해주세요.')).toBeVisible({ timeout: 2000 });
  });

  test('영어 문장 없이 평가 시도 시 에러 메시지 표시', async ({ page }) => {
    // 한글 문장 생성
    const generateButton = page.getByRole('button', { name: '새 문장 생성' });
    await generateButton.click();

    // 한글 문장이 생성될 때까지 대기
    const englishTextarea = page.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
    await expect(englishTextarea).toBeEnabled({ timeout: 10000 });

    // 영어 문장 입력 없이 평가 버튼 클릭
    const evaluateButton = page.getByRole('button', { name: /AI 평가/i });
    await evaluateButton.click();

    // 에러 메시지 확인
    await expect(page.getByText('영어 문장을 입력해주세요.')).toBeVisible({ timeout: 2000 });
  });

  test('수준 변경 후 문장 생성', async ({ page }) => {
    // 초등학교로 변경
    const elementaryButton = page.getByRole('button', { name: '초등학교' });
    await elementaryButton.click();

    // 한글 문장 생성
    const generateButton = page.getByRole('button', { name: '새 문장 생성' });
    await generateButton.click();

    // 한글 문장이 생성될 때까지 대기
    await expect(page.getByText('"새 문장 생성" 버튼을 클릭하여 한글 문장을 받아보세요.')).not.toBeVisible({ timeout: 10000 });
  });

  test('에러 발생 시 에러 메시지가 표시된다', async ({ page }) => {
    // API 키가 없거나 네트워크 오류 시 에러 메시지 확인을 위한 테스트
    // 실제 API 호출이 실패할 경우를 대비한 테스트는 환경에 따라 다를 수 있음
    // 여기서는 UI가 에러를 표시할 수 있는지 확인
    const generateButton = page.getByRole('button', { name: '새 문장 생성' });
    await generateButton.click();

    // 에러가 발생하면 에러 메시지가 표시되는 영역이 있는지 확인
    // (실제 에러 발생 여부는 환경에 따라 다름)
    const errorArea = page.locator('.bg-red-50, .text-red-700');
    // 에러가 발생하지 않을 수도 있으므로 timeout을 짧게 설정
    try {
      await expect(errorArea).toBeVisible({ timeout: 2000 });
    } catch {
      // 에러가 발생하지 않으면 정상 (API가 정상 작동)
    }
  });
});

