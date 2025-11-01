/**
 * Store Types
 * Based on shops table schema in database
 */

/**
 * Shop type enum
 */
export type ShopType = 'gacha' | 'figure' | 'both'

/**
 * Verification status enum
 */
export type VerificationStatus = 'pending' | 'verified' | 'rejected'

/**
 * Data source type
 */
export type DataSource = 'user_submit' | 'admin_input' | 'crawling' | 'partner_api' | 'admin'

/**
 * Address type enum
 */
export type AddressType = 'R' | 'J'

/**
 * Day schedule - either closed or with open/close times
 */
export type DaySchedule =
  | { closed: true }
  | { open: string; close: string }

/**
 * Business hours structure with schedule and metadata
 */
export interface BusinessHours {
  schedule: {
    monday?: DaySchedule
    tuesday?: DaySchedule
    wednesday?: DaySchedule
    thursday?: DaySchedule
    friday?: DaySchedule
    saturday?: DaySchedule
    sunday?: DaySchedule
  }
  note?: string
  breakTime?: string
}

/**
 * Complete store entity from database
 */
export interface Store {
  // Core fields
  id: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  deleted_at: string | null
  created_by: string | null
  updated_by: string | null

  // Shop information
  name: string
  shop_type: ShopType
  description: string | null
  phone: string | null
  website_url: string | null

  // Location data
  sido: string
  sigungu: string | null
  jibun_address: string | null
  road_address: string
  detail_address: string | null
  zone_code: string | null
  building_name: string | null
  address_type: AddressType | null
  latitude: number
  longitude: number

  // Business information
  business_hours: BusinessHours | null
  is_24_hours: boolean

  // Gacha-specific data
  gacha_machine_count: number | null
  main_series: string[] | null

  // Verification & reliability
  verification_status: VerificationStatus
  verified_at: string | null
  verified_by: string | null
  data_source: DataSource
  last_confirmed_at: string | null

  // Media & display
  thumbnail_url: string | null
  cover_image_url: string | null
  tags: string[] | null

  // Admin notes
  admin_notes: string | null
}

/**
 * Store creation form data
 */
export interface CreateStoreFormData {
  // Basic information
  name: string
  shop_type: ShopType | ''
  description: string
  phone: string
  website_url: string

  // Location
  sido: string
  sigungu: string
  jibun_address: string
  road_address: string
  detail_address: string
  zone_code: string
  building_name: string
  address_type: AddressType | ''
  latitude: string
  longitude: string

  // Operating information
  is_24_hours: boolean
  business_hours: BusinessHours | null
  gacha_machine_count: string

  // Verification
  verification_status: VerificationStatus
  data_source: DataSource

  // Media
  thumbnail_url: string
  cover_image_url: string

  // Admin
  admin_notes: string
}

/**
 * DTO for creating a new store (API request)
 */
export interface CreateStoreDto {
  // Basic information
  name: string
  shop_type: ShopType
  description?: string
  phone?: string
  website_url?: string

  // Location
  sido: string
  sigungu?: string
  jibun_address?: string
  road_address: string
  detail_address?: string
  zone_code?: string
  building_name?: string
  address_type?: AddressType
  latitude: number
  longitude: number

  // Operating information
  is_24_hours?: boolean
  business_hours?: BusinessHours | null
  gacha_machine_count?: number

  // Verification
  verification_status?: VerificationStatus
  data_source: DataSource

  // Media
  thumbnail_url?: string
  cover_image_url?: string

  // Admin
  admin_notes?: string
}

/**
 * DTO for updating a store
 */
export interface UpdateStoreDto extends Partial<CreateStoreDto> {
  id: string
}
