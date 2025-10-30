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
 * Business hours structure
 */
export interface BusinessHours {
  mon?: string
  tue?: string
  wed?: string
  thu?: string
  fri?: string
  sat?: string
  sun?: string
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
  address_full: string
  postal_code: string | null
  latitude: number
  longitude: number
  region_level1: string
  region_level2: string | null
  region_level3: string | null

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
  address_full: string
  postal_code: string
  region_level1: string
  region_level2: string
  region_level3: string
  latitude: string
  longitude: string

  // Operating information
  is_24_hours: boolean
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
  address_full: string
  postal_code?: string
  region_level1: string
  region_level2?: string
  region_level3?: string
  latitude: number
  longitude: number

  // Operating information
  is_24_hours?: boolean
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
