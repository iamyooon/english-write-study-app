/**
 * 프로필 새로고침 시나리오 E2E 테스트
 * 새로고침 시 프로필 조회 및 표시 검증
 */

import { test, expect } from '@playwright/test'

test.describe('프로필 새로고침 시나리오', () => {
  // 테스트 사용자 정보 (실제 테스트 환경에 맞게 수정 필요)
  const testEmail = 'test@example.com'
  const testPassword = 'testpassword123'
  const testUserName = '테스트사용자'

  test.beforeEach(async ({ page, context }) => {
    // 각 테스트 전에 로그인 상태로 시작
    await page.goto('http://localhost:3000/login')
    
    await page.getByLabel(/이메일/i).fill(testEmail)
    await page.getByLabel(/비밀번호/i).fill(testPassword)
    await page.click('button[type="submit"]')

    // 로그인 완료 대기
    await page.waitForURL(/.*\/onboarding|.*\/writing/, { timeout: 10000 })
  })

  test('새로고침 후 프로필 조회가 완료되어야 한다', async ({ page }) => {
    // 헤더에서 사용자 정보 확인
    const header = page.locator('header')
    await expect(header).toBeVisible({ timeout: 5000 })

    // 에너지 표시 확인
    const energyElement = header.locator('text=/\\d+\\/\\d+/') // 숫자/숫자 형식
    await expect(energyElement.first()).toBeVisible({ timeout: 5000 })

    // 새로고침
    await page.reload({ waitUntil: 'networkidle' })

    // 새로고침 후 프로필이 다시 로드되는지 확인
    await expect(energyElement.first()).toBeVisible({ timeout: 10000 })
    
    // 콘솔 에러 확인 (타임아웃 에러가 없어야 함)
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (text.includes('타임아웃') || text.includes('프로필 조회 타임아웃')) {
          consoleErrors.push(text)
        }
      }
    })

    // 잠시 대기하여 에러 발생 여부 확인
    await page.waitForTimeout(6000) // 타임아웃 시간(5초)보다 길게 대기

    expect(consoleErrors.length).toBe(0)
  })

  test('새로고침 후 사용자 이름이 정상적으로 표시되어야 한다', async ({ page }) => {
    // 사용자 이름 설정 (설정 모달 열기)
    const settingsButton = page.locator('button').filter({ hasText: /설정|⚙|☰/i }).first()
    
    if (await settingsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsButton.click()
      
      // 이름 입력
      const nameInput = page.locator('input[type="text"]').filter({ hasText: /이름/i }).first()
      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill(testUserName)
        
        // 저장 버튼 클릭
        const saveButton = page.locator('button').filter({ hasText: /저장/i })
        await saveButton.click()
        
        // 저장 완료 대기
        await page.waitForTimeout(2000)
      }
    }

    // 헤더에서 이름 확인
    const userNameElement = page.locator('header').locator('text=/님/i').first()
    await expect(userNameElement).toBeVisible({ timeout: 5000 })
    
    const userNameBeforeRefresh = await userNameElement.textContent()

    // 새로고침
    await page.reload({ waitUntil: 'networkidle' })

    // 새로고침 후 이름이 유지되는지 확인
    await expect(userNameElement).toBeVisible({ timeout: 10000 })
    const userNameAfterRefresh = await userNameElement.textContent()

    // 이름이 "사용자"가 아닌 실제 이름이어야 함
    expect(userNameAfterRefresh).toBeTruthy()
    expect(userNameAfterRefresh).not.toBe('사용자')
    if (userNameBeforeRefresh && userNameBeforeRefresh !== '사용자') {
      expect(userNameAfterRefresh).toBe(userNameBeforeRefresh)
    }
  })

  test('새로고침 시 프로필 조회가 5초 내에 완료되어야 한다', async ({ page }) => {
    const startTime = Date.now()

    // 새로고침
    await page.reload({ waitUntil: 'networkidle' })

    // 프로필이 로드될 때까지 대기 (에너지 표시 확인)
    const energyElement = page.locator('header').locator('text=/\\d+\\/\\d+/').first()
    await expect(energyElement).toBeVisible({ timeout: 10000 })

    const endTime = Date.now()
    const duration = endTime - startTime

    // 5초(5000ms) 내에 완료되어야 함
    expect(duration).toBeLessThan(5000)
  })

  test('여러 번 새로고침해도 프로필이 정상적으로 로드된다', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      // 새로고침
      await page.reload({ waitUntil: 'networkidle' })

      // 프로필 로드 확인
      const energyElement = page.locator('header').locator('text=/\\d+\\/\\d+/').first()
      await expect(energyElement).toBeVisible({ timeout: 10000 })

      // 잠시 대기
      await page.waitForTimeout(1000)
    }
  })

  test('새로고침 후 세션이 유지되어야 한다', async ({ page }) => {
    // 로그인 상태 확인
    const header = page.locator('header')
    await expect(header).toBeVisible({ timeout: 5000 })
    
    // 로그인 링크가 없어야 함
    const loginLink = header.getByText(/로그인/i)
    await expect(loginLink).not.toBeVisible({ timeout: 2000 }).catch(() => {
      // 로그인 링크가 보이면 로그인 상태가 아님
    })

    // 새로고침
    await page.reload({ waitUntil: 'networkidle' })

    // 새로고침 후에도 로그인 상태 유지 확인
    await expect(header).toBeVisible({ timeout: 10000 })
    
    // 로그인 링크가 여전히 없어야 함
    await expect(loginLink).not.toBeVisible({ timeout: 2000 }).catch(() => {
      throw new Error('새로고침 후 세션이 유지되지 않음')
    })
  })
})
