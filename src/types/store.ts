import type { DataSource, BusinessHours } from "@/features/store/types/store.types";

export type ShopType = "gacha" | "figure" | "both";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type AddressType = "R" | "J";

export interface SocialUrls {
  website?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
}

export interface ShopTag {
  tag_id: string;
  tags: {
    id: string;
    name: string;
    description: string | null;
  };
}

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
  social_urls: SocialUrls | null;
  // New address structure
  sido: string;
  sigungu: string | null;
  jibun_address: string | null;
  road_address: string;
  detail_address: string | null;
  zone_code: string | null;
  building_name: string | null;
  address_type: AddressType | null;
  latitude: number | null;
  longitude: number | null;
  business_hours: BusinessHours | null;
  is_24_hours: boolean | null;
  gacha_machine_count: number | null;
  main_series: string[] | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  data_source: DataSource;
  last_confirmed_at: string | null;
  thumbnail_url: string | null;
  cover_image_url: string | null;
  shop_tags: ShopTag[] | null;
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
