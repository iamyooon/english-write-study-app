/**
 * Supabase 유틸리티 함수
 * 
 * 자주 사용하는 쿼리 패턴을 유틸리티 함수로 제공합니다.
 */

import { createClient } from './server'
import { Profile, StudyLog, UserInventory, ShopItem } from '@/types/database'

/**
 * 사용자의 에너지 소모 (미션 1회당 100 소비)
 * @param userId 사용자 ID
 * @param amount 소비할 에너지 양 (기본값: 100)
 * @returns 업데이트된 프로필
 */
export async function consumeEnergy(userId: string, amount: number = 100) {
  const supabase = await createClient()
  
  // 현재 에너지 조회
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('energy')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    throw new Error(`Failed to fetch profile: ${fetchError?.message}`)
  }

  // 에너지 부족 체크
  if (profile.energy < amount) {
    throw new Error(`Insufficient energy: ${profile.energy}/${amount}`)
  }

  // 에너지 차감 (최소 0)
  const newEnergy = Math.max(profile.energy - amount, 0)
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ energy: newEnergy })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to consume energy: ${error.message}`)
  }

  return data
}

/**
 * 사용자의 에너지 생산 (작성 문장당 +10)
 * @param userId 사용자 ID
 * @param amount 생산할 에너지 양 (기본값: 10)
 * @returns 업데이트된 프로필
 */
export async function produceEnergy(userId: string, amount: number = 10) {
  const supabase = await createClient()
  
  // 현재 에너지 조회
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('energy')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    throw new Error(`Failed to fetch profile: ${fetchError?.message}`)
  }

  // 에너지 증가 (최대 100)
  const newEnergy = Math.min(profile.energy + amount, 100)
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ energy: newEnergy })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to produce energy: ${error.message}`)
  }

  return data
}

/**
 * 자정 에너지 자동 충전 (매일 100으로 충전)
 * @param userId 사용자 ID
 * @returns 업데이트된 프로필
 */
export async function chargeEnergyDaily(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      energy: 100,
      energy_last_charged: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to charge energy: ${error.message}`)
  }

  return data
}

/**
 * 자정 에너지 충전이 필요한 사용자들 찾기
 * @returns 충전이 필요한 사용자 ID 목록
 */
export async function getUsersNeedingEnergyCharge() {
  const supabase = await createClient()
  
  // 오늘 자정 시간 계산 (UTC 기준)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayStart = today.toISOString()
  
  // 어제 자정 이후로 충전하지 않은 사용자 찾기
  const { data, error } = await supabase
    .from('profiles')
    .select('id, energy_last_charged')
    .or(`energy_last_charged.is.null,energy_last_charged.lt.${todayStart}`)

  if (error) {
    throw new Error(`Failed to fetch users needing charge: ${error.message}`)
  }

  return data.map(profile => profile.id)
}

/**
 * 사용자의 젬 추가/차감
 */
export async function updateGems(userId: string, amount: number) {
  const supabase = await createClient()
  
  // 현재 젬 조회
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('gems')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    throw new Error(`Failed to fetch profile: ${fetchError?.message}`)
  }

  // 젬 업데이트 (최소 0)
  const newGems = Math.max(profile.gems + amount, 0)
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ gems: newGems })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update gems: ${error.message}`)
  }

  return data
}

/**
 * 사용자의 일일 Vision 사용량 증가
 */
export async function incrementVisionUsage(userId: string) {
  const supabase = await createClient()
  
  // 현재 사용량 조회
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('vision_usage_today')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    throw new Error(`Failed to fetch profile: ${fetchError?.message}`)
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ vision_usage_today: (profile.vision_usage_today || 0) + 1 })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to increment vision usage: ${error.message}`)
  }

  return data
}

/**
 * 사용자의 일일 피드백 사용량 증가
 */
export async function incrementFeedbackUsage(userId: string) {
  const supabase = await createClient()
  
  // 현재 사용량 조회
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('feedback_usage_today')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    throw new Error(`Failed to fetch profile: ${fetchError?.message}`)
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ feedback_usage_today: (profile.feedback_usage_today || 0) + 1 })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to increment feedback usage: ${error.message}`)
  }

  return data
}

/**
 * 사용자의 학습 로그 조회 (나만의 도서관)
 */
export async function getUserStudyLogs(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('study_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', false) // 나만의 도서관만
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch study logs: ${error.message}`)
  }

  return data as StudyLog[]
}

/**
 * 사용자의 인벤토리 조회
 */
export async function getUserInventory(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_inventory')
    .select(`
      *,
      shop_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch inventory: ${error.message}`)
  }

  return data as (UserInventory & { shop_items: ShopItem })[]
}

/**
 * 상점 아이템 목록 조회
 */
export async function getShopItems(type?: 'outfit' | 'decoration') {
  const supabase = await createClient()
  
  let query = supabase
    .from('shop_items')
    .select('*')
    .order('cost_gems', { ascending: true })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch shop items: ${error.message}`)
  }

  return data as ShopItem[]
}

/**
 * 아이템 구매 (트랜잭션)
 * 
 * 젬 차감 + 인벤토리 추가를 원자적으로 처리합니다.
 */
export async function purchaseItem(userId: string, itemId: number) {
  const supabase = await createClient()
  
  // 1. 아이템 정보 조회
  const { data: item, error: itemError } = await supabase
    .from('shop_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (itemError || !item) {
    throw new Error('Item not found')
  }

  // 2. 사용자 프로필 조회
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('gems')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Profile not found')
  }

  // 3. 젬 확인
  if (profile.gems < item.cost_gems) {
    throw new Error('Insufficient gems')
  }

  // 4. 트랜잭션: 젬 차감 + 아이템 추가
  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ gems: profile.gems - item.cost_gems })
    .eq('id', userId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to deduct gems: ${updateError.message}`)
  }

  const { data: inventoryItem, error: inventoryError } = await supabase
    .from('user_inventory')
    .insert({
      user_id: userId,
      item_id: itemId,
      is_equipped: false,
    })
    .select()
    .single()

  if (inventoryError) {
    // 롤백: 젬 복구
    await supabase
      .from('profiles')
      .update({ gems: profile.gems })
      .eq('id', userId)
    
    throw new Error(`Failed to add item to inventory: ${inventoryError.message}`)
  }

  return {
    profile: updatedProfile as Profile,
    inventoryItem: inventoryItem as UserInventory,
  }
}
