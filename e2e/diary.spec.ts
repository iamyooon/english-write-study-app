import { test, expect } from '@playwright/test';

test.describe('DiaryPage E2E 테스트', () => {
  test('영어 일기 교정 기능 테스트', async ({ page }) => {
    // 메인 페이지 접속
    await page.goto('http://localhost:5173');

    // 텍스트 박스에 'I is happy' 입력
    const textarea = page.getByLabel('오늘의 일기를 작성해보세요');
    await textarea.fill('I is happy');

    // 교정 버튼 클릭
    const checkButton = page.getByRole('button', { name: /AI 교정/i });
    await checkButton.click();

    // 화면에 'I am happy'라고 수정된 결과가 2초 안에 뜨는지 검증
    // 교정 결과 섹션이 나타나는지 확인 (최대 2초 대기)
    await expect(page.getByText('교정 결과')).toBeVisible({ timeout: 2000 });

    // 교정문 섹션에서 'I am happy' 텍스트가 표시되는지 확인 (2초 안에)
    // Diff 형식으로 표시되므로 전체 텍스트 내용을 확인
    const correctedTextArea = page.locator('text=교정문 (수정된 부분 강조)').locator('..').locator('div.text-gray-800').first();
    await expect(correctedTextArea).toBeVisible({ timeout: 2000 });
    // 'I am happy'가 포함되어 있는지 확인 (공백이 여러 개일 수 있으므로 유연하게)
    await expect(correctedTextArea).toContainText(/I.*am.*happy/i, { timeout: 2000 });
  });
});
