/**
 * MissionService
 * DB에서 미션을 조회하고 진도를 관리하는 서비스
 */

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export interface Mission {
  id: string
  mission_type: 'keyboard' | 'drag_drop'
  grade_level: 'elementary_low' | 'elementary_high'
  grade: number
  unit: number | null
  topic: string | null
  order_in_unit: number | null
  mission_data: {
    korean: string
    sub_type?: 'word_bank_fill' | 'word_order' | 'blank_fill' | 'sentence_write' | 'copy_typing' | 'dictation'
    sentence?: string
    sentenceTokens?: string[]
    difficultyTier?: number
    word?: string
    // Drag & Drop용
    template?: string
    blanks?: number
    wordOptions?: string[]
    correctAnswers?: string[]
    // Keyboard용
    vocabulary?: string[]
    example?: string
  }
}

export interface MissionProgress {
  mission_id: string
  completed_at: string
  score: number
  attempts: number
}

export class MissionService {
  /**
   * 사용자가 완료한 미션 ID 목록 조회
   */
  static async getCompletedMissionIds(userId: string | null): Promise<string[]> {
    // 게스트 사용자인 경우 빈 배열 반환
    if (!userId || userId === 'guest-user-id') {
      return []
    }

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('user_mission_progress')
        .select('mission_id')
        .eq('user_id', userId) as { data: Array<{ mission_id: string }> | null, error: any }

      if (error) {
        console.error('[MissionService] 완료한 미션 조회 오류:', error)
        // 에러가 발생해도 빈 배열 반환 (미션 조회는 계속 진행)
        return []
      }

      return data?.map(item => item.mission_id) || []
    } catch (error) {
      console.error('[MissionService] getCompletedMissionIds 오류:', error)
      // 에러가 발생해도 빈 배열 반환
      return []
    }
  }

  /**
   * 미션 조회 (완료하지 않은 미션만)
   */
  static async getMission(
    userId: string | null,
    grade: number,
    missionType?: 'keyboard' | 'drag_drop',
    unit?: number
  ): Promise<Mission | null> {
    try {
      console.log('[MissionService] 미션 조회 시작:', { userId, grade, missionType, unit })
      
      const supabase = createClient()

      // 1. 완료한 미션 ID 목록 조회
      const completedMissionIds = await this.getCompletedMissionIds(userId)
      console.log('[MissionService] 완료한 미션 수:', completedMissionIds.length)

      // 2. 조건에 맞는 미션 조회
      let query = supabase
        .from('missions')
        .select('*')
        .eq('grade', grade)
        .eq('is_active', true)

      // 미션 타입 필터링
      if (missionType) {
        query = query.eq('mission_type', missionType)
      }

      // 단원 필터링
      if (unit) {
        query = query.eq('unit', unit)
      }

      const { data: missions, error } = await query as { data: Array<Database['public']['Tables']['missions']['Row']> | null, error: any }

      if (error) {
        console.error('[MissionService] 미션 조회 오류:', error)
        throw new Error(`미션 조회 실패: ${error.message}`)
      }

      if (!missions || missions.length === 0) {
        console.log('[MissionService] 사용 가능한 미션이 없습니다')
        return null
      }

      // 3. 완료하지 않은 미션만 필터링
      const availableMissions = missions.filter(mission => 
        !completedMissionIds.includes(mission.id)
      )

      if (availableMissions.length === 0) {
        console.log('[MissionService] 모든 미션을 완료했습니다')
        return null
      }

      // 4. 랜덤 선택
      const randomIndex = Math.floor(Math.random() * availableMissions.length)
      const selectedMission = availableMissions[randomIndex]

      console.log('[MissionService] 미션 선택 완료:', {
        id: selectedMission.id,
        topic: selectedMission.topic,
        unit: selectedMission.unit
      })

      return selectedMission as unknown as Mission
    } catch (error) {
      console.error('[MissionService] getMission 오류:', error)
      throw error
    }
  }

  /**
   * 미션 완료 기록
   */
  static async recordMissionProgress(
    userId: string | null,
    missionId: string,
    score: number
  ): Promise<void> {
    // 게스트 사용자인 경우 기록하지 않음
    if (!userId || userId === 'guest-user-id') {
      console.log('[MissionService] 게스트 사용자 - 미션 완료 기록 건너뜀')
      return
    }

    try {
      console.log('[MissionService] 미션 완료 기록:', { userId, missionId, score })
      
      const supabase = createClient()

      const insertData = {
        user_id: userId,
        mission_id: missionId,
        score: score,
        attempts: 1,
        completed_at: new Date().toISOString()
      }
      
      const { error } = await (supabase
        .from('user_mission_progress')
        .upsert(insertData as any, {
          onConflict: 'user_id,mission_id'
        }) as any)

      if (error) {
        console.error('[MissionService] 미션 완료 기록 오류:', error)
        throw new Error(`미션 완료 기록 실패: ${error.message}`)
      }

      console.log('[MissionService] 미션 완료 기록 성공')
    } catch (error) {
      console.error('[MissionService] recordMissionProgress 오류:', error)
      throw error
    }
  }

  /**
   * 단원 목록 조회 (학년별)
   */
  static async getUnits(grade: number): Promise<Array<{
    unit: number
    topic: string
    totalMissions: number
    completedMissions: number
    completionRate: number
  }>> {
    try {
      const supabase = createClient()

      // 해당 학년의 모든 단원 조회
      const { data: missions, error: missionsError } = await supabase
        .from('missions')
        .select('id, unit, topic')
        .eq('grade', grade)
        .eq('is_active', true)
        .not('unit', 'is', null) as { data: Array<{ id: string; unit: number | null; topic: string | null }> | null, error: any }

      if (missionsError) {
        throw new Error(`단원 조회 실패: ${missionsError.message}`)
      }

      // 단원별로 그룹화
      const unitMap = new Map<number, { topic: string; missionIds: string[] }>()
      
      missions?.forEach(mission => {
        if (mission.unit) {
          if (!unitMap.has(mission.unit)) {
            unitMap.set(mission.unit, { topic: mission.topic || '', missionIds: [] })
          }
          unitMap.get(mission.unit)!.missionIds.push(mission.id)
        }
      })

      // 사용자 세션 확인 (완료한 미션 조회를 위해)
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      let completedMissions: string[] = []
      if (userId) {
        completedMissions = await this.getCompletedMissionIds(userId)
      }

      // 단원별 완료율 계산
      const units = Array.from(unitMap.entries()).map(([unit, data]) => {
        const totalMissions = data.missionIds.length
        const completedMissionsInUnit = data.missionIds.filter(id => 
          completedMissions.includes(id)
        ).length
        const completionRate = totalMissions > 0 
          ? Math.round((completedMissionsInUnit / totalMissions) * 100) 
          : 0

        return {
          unit,
          topic: data.topic,
          totalMissions,
          completedMissions: completedMissionsInUnit,
          completionRate
        }
      })

      // 단원 번호 순으로 정렬
      return units.sort((a, b) => a.unit - b.unit)
    } catch (error) {
      console.error('[MissionService] getUnits 오류:', error)
      throw error
    }
  }
}
