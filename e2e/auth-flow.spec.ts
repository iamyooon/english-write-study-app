/**
 * 인증 플로우 E2E 테스트
 * 로그인 → 새로고침 → 프로필 확인 시나리오 검증
 */

import { test, expect } from '@playwright/test'

test.describe('인증 플로우 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 전 로그아웃 상태로 시작
    await page.goto('http://localhost:3000/')
  })

  test('로그인 후 프로필이 정상적으로 표시된다', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인')
    await expect(page).toHaveURL(/.*\/login/)

    // 로그인 정보 입력 (실제 테스트 환경에 맞게 수정 필요)
    const emailInput = page.getByLabel(/이메일/i)
    const passwordInput = page.getByLabel(/비밀번호/i)
    
    await emailInput.fill('test@example.com')
    await passwordInput.fill('testpassword123')

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]')

    // 로그인 후 리다이렉트 대기
    await page.waitForURL(/.*\/onboarding|.*\/writing/, { timeout: 10000 })

    // 헤더에 사용자 정보가 표시되는지 확인
    await expect(page.locator('header')).toBeVisible({ timeout: 5000 })
    
    // 에너지 표시 확인 (에너지가 표시되면 로그인 성공)
    const energyText = page.locator('text=/에너지|energy/i')
    await expect(energyText.first()).toBeVisible({ timeout: 5000 })
  })

  test('로그인 후 새로고침해도 프로필이 유지된다', async ({ page }) => {
    // 로그인 (위 테스트와 동일한 플로우)
    await page.click('text=로그인')
    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.getByLabel(/비밀번호/i).fill('testpassword123')
    await page.click('button[type="submit"]')

    // 로그인 완료 대기
    await page.waitForURL(/.*\/onboarding|.*\/writing/, { timeout: 10000 })

    // 사용자 이름이 표시되는지 확인
    const userNameElement = page.locator('text=/님|사용자/i').first()
    await expect(userNameElement).toBeVisible({ timeout: 5000 })
    
    const userNameBeforeRefresh = await userNameElement.textContent()

    // 새로고침
    await page.reload({ waitUntil: 'networkidle' })

    // 새로고침 후에도 사용자 이름이 유지되는지 확인
    await expect(userNameElement).toBeVisible({ timeout: 10000 })
    const userNameAfterRefresh = await userNameElement.textContent()
    
    // 이름이 동일하게 유지되어야 함 (또는 "사용자"가 아닌 실제 이름이어야 함)
    expect(userNameAfterRefresh).toBeTruthy()
    if (userNameBeforeRefresh && userNameBeforeRefresh !== '사용자') {
      expect(userNameAfterRefresh).toBe(userNameBeforeRefresh)
    }
  })

  test('로그인 후 시작하기 페이지에서 새로고침해도 이름이 유지된다', async ({ page }) => {
    // 로그인
    await page.click('text=로그인')
    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.getByLabel(/비밀번호/i).fill('testpassword123')
    await page.click('button[type="submit"]')

    // 시작하기 페이지로 이동 대기
    await page.waitForURL(/.*\/onboarding/, { timeout: 10000 })

    // 헤더에서 사용자 이름 확인
    const userNameElement = page.locator('header').locator('text=/님|사용자/i').first()
    await expect(userNameElement).toBeVisible({ timeout: 5000 })
    
    const userNameBeforeRefresh = await userNameElement.textContent()

    // 새로고침
    await page.reload({ waitUntil: 'networkidle' })

    // 새로고침 후에도 이름이 유지되는지 확인
    await expect(userNameElement).toBeVisible({ timeout: 10000 })
    const userNameAfterRefresh = await userNameElement.textContent()

    // 이름이 "사용자"가 아닌 실제 이름이어야 함 (또는 동일하게 유지)
    expect(userNameAfterRefresh).toBeTruthy()
    if (userNameBeforeRefresh && userNameBeforeRefresh !== '사용자') {
      expect(userNameAfterRefresh).toBe(userNameBeforeRefresh)
    }
  })

  test('로그아웃 후 홈페이지로 리다이렉트된다', async ({ page }) => {
    // 로그인
    await page.click('text=로그인')
    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.getByLabel(/비밀번호/i).fill('testpassword123')
    await page.click('button[type="submit"]')

    // 로그인 완료 대기
    await page.waitForURL(/.*\/onboarding|.*\/writing/, { timeout: 10000 })

    // 설정 버튼 클릭 (로그아웃 버튼이 있는 위치)
    const settingsButton = page.locator('button').filter({ hasText: /설정|⚙|☰/i }).first()
    if (await settingsButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsButton.click()
    }

    // 로그아웃 버튼 클릭
    const logoutButton = page.locator('button').filter({ hasText: /로그아웃/i })
    await expect(logoutButton).toBeVisible({ timeout: 5000 })
    await logoutButton.click()

    // 홈페이지로 리다이렉트 확인
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 })
    await expect(page).toHaveURL('http://localhost:3000/')

    // 로그인/회원가입 링크가 다시 표시되는지 확인
    await expect(page.getByText(/로그인/i)).toBeVisible({ timeout: 5000 })
  })

  test('이미 로그인된 상태에서 로그인 페이지 접속 시 리다이렉트된다', async ({ page }) => {
    // 로그인
    await page.click('text=로그인')
    await page.getByLabel(/이메일/i).fill('test@example.com')
    await page.getByLabel(/비밀번호/i).fill('testpassword123')
    await page.click('button[type="submit"]')

    // 로그인 완료 대기
    await page.waitForURL(/.*\/onboarding|.*\/writing/, { timeout: 10000 })

    // 로그인 페이지로 직접 이동 시도
    await page.goto('http://localhost:3000/login')

    // 자동으로 리다이렉트되어야 함
    await page.waitForURL(/.*\/onboarding|.*\/writing/, { timeout: 5000 })
    expect(page.url()).not.toContain('/login')
  })
})
