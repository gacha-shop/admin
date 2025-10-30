export type ShopType = 'gacha' | 'figure' | 'both';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Store {
  id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  name: string;
  shop_type: ShopType;
  description: string | null;
  phone: string | null;
  website_url: string | null;
  address_full: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  region_level1: string | null;
  region_level2: string | null;
  region_level3: string | null;
  business_hours: Record<string, unknown> | null;
  is_24_hours: boolean | null;
  gacha_machine_count: number | null;
  main_series: string[] | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  data_source: string;
  last_confirmed_at: string | null;
  thumbnail_url: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  admin_notes: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface StoreListParams {
  page?: number;
  limit?: number;
  shop_type?: ShopType;
  verification_status?: VerificationStatus;
  search?: string;
}

export interface StoreListResponse {
  data: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
