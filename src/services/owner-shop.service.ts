/**
 * Owner Shop Service
 * Edge Functions API를 사용한 Owner Shop 관리
 */

import { supabase } from "@/lib/supabase";

// Edge Functions Base URL
const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL + "/functions/v1";

// Types
export interface SNS {
  website?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
}

export interface OpenClose {
  open: string;
  close: string;
}

export interface BusinessHours {
  note?: string;
  schedule: {
    friday: OpenClose;
    monday: OpenClose;
    sunday: OpenClose;
    tuesday: OpenClose;
    saturday: OpenClose;
    thursday: OpenClose;
    wednesday: OpenClose;
  };
  breakTime?: string;
}

export interface Shop {
  id: string;
  name: string;
  shop_type: string[]; // Array of shop types
  description: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  business_hours: BusinessHours | null;
  is_24_hours: boolean | null;
  gacha_machine_count: number | null;
  verification_status: string;
  sido: string;
  sigungu: string | null;
  jibun_address: string | null;
  road_address: string;
  detail_address: string | null;
  zone_code: string | null;
  building_name: string | null;
  social_urls: Partial<SNS> | null;
  created_at: string;
  updated_at: string;
  shop_tags?: {
    tag_id: string;
    tags: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
}

export interface ShopUpdateInput {
  name?: string;
  shop_type?: string[];
  tag_ids?: string[];
  description?: string;
  phone?: string;
  business_hours?: BusinessHours;
  is_24_hours?: boolean;
  gacha_machine_count?: number;
  detail_address?: string;
  social_urls?: Partial<SNS>;
}

export interface ShopOwnership {
  id: string;
  shop_id: string;
  owner_id: string;
  verified: boolean;
  shops: {
    id: string;
    name: string;
    road_address: string;
    verification_status: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Edge Functions API 호출을 위한 헬퍼 함수
 */
async function callEdgeFunction<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 현재 세션에서 JWT 토큰 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다");
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "API 호출 실패");
  }

  return result.data as T;
}

/**
 * Owner Shop Service Class
 * Owner는 본인 소유 매장 1개만 관리
 */
export class OwnerShopService {
  /**
   * 본인 소유 매장 조회
   * Owner는 1개의 매장만 소유하므로 단일 객체 반환
   */
  static async getMyShop(shopId: string): Promise<Shop> {
    return callEdgeFunction<Shop>(`/owner-shops-get?id=${shopId}`, {
      method: "GET",
    });
  }

  /**
   * 본인 매장 정보 수정
   * 제한된 필드만 수정 가능 (description, phone, business_hours, etc.)
   */
  static async updateMyShop(
    shopId: string,
    updates: ShopUpdateInput
  ): Promise<Shop> {
    return callEdgeFunction<Shop>(`/owner-shops-update?id=${shopId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  /**
   * 본인 소유 매장 확인 (shop_owners 테이블 조회)
   * Edge Function을 사용하지 않고 직접 Supabase 쿼리
   * RLS 정책으로 본인 소유만 조회됨
   */
  static async getMyShopOwnership(): Promise<{
    ownerships: ShopOwnership[] | null;
    error: Error | null;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인이 필요합니다");
      }

      const { data, error } = await supabase
        .from("shop_owners")
        .select(
          `
          *,
          shops (
            id,
            name,
            road_address,
            verification_status
          )
        `
        )
        .eq("owner_id", user.id);

      if (error) throw error;

      return { ownerships: data, error: null };
    } catch (error) {
      console.error("Get shop ownership error:", error);
      return { ownerships: null, error: error as Error };
    }
  }
}
