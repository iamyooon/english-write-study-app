/**
 * 게이미피케이션 관련 타입 정의
 */

import { CharacterCustomization, InventoryItem } from './database'

export type ItemType = 'character_part' | 'decoration' | 'theme'

export interface ShopItem {
  id: string
  name: string
  description: string
  itemType: ItemType
  price: number // 스타 젬 가격
  imageUrl: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  available: boolean
}

export interface CharacterPart {
  type: 'hair' | 'eyes' | 'mouth' | 'clothes' | 'accessory'
  id: string
  name: string
  imageUrl: string
}

export interface CharacterData {
  parts: {
    hair?: CharacterPart
    eyes?: CharacterPart
    mouth?: CharacterPart
    clothes?: CharacterPart
    accessory?: CharacterPart
  }
  colors?: {
    skin?: string
    hair?: string
    clothes?: string
  }
}

export interface UserInventory {
  items: InventoryItem[]
  character: CharacterCustomization | null
  starGems: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  iconUrl: string
  unlockedAt: string | null
  progress: number // 0-100
  target: number
}

export interface Reward {
  type: 'star_gems' | 'item' | 'badge'
  amount?: number
  itemId?: string
  badgeId?: string
}
