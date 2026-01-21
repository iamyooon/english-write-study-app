/**
 * 결제 관련 타입 정의
 */

// PaymentLog 타입 정의 (database.ts에 없을 경우)
export interface PaymentLog {
  id: string
  user_id: string
  transaction_id: string
  product_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
}

export type PurchaseType = 'subscription' | 'iap_energy' | 'iap_item'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface RevenueCatPurchase {
  transactionId: string
  productId: string
  purchaseType: PurchaseType
  amount: number
  currency: string
  userId: string
  timestamp: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  duration: number // 일 단위
  features: string[]
  revenuecatProductId: string
}

export interface IAPProduct {
  id: string
  name: string
  description: string
  type: 'energy' | 'item'
  price: number
  currency: string
  revenuecatProductId: string
  energyAmount?: number // 에너지 리필인 경우
  itemId?: string // 아이템인 경우
}

export interface PaymentVerificationResult {
  valid: boolean
  paymentLog: PaymentLog | null
  error?: string
}

// PaymentLog를 database.ts에서 import하려고 했지만 없으므로 여기서 정의
