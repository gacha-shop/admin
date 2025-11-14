/**
 * Admin Shop Service
 * Edge Functions API를 사용한 Admin Shop 관리
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

export interface Shop {
  id: string;
  name: string;
  shop_type: string;
  description: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  business_hours: BusinessHours | null;
  is_24_hours: boolean | null;
  gacha_machine_count: number | null;
  main_series: string[] | null;
  verification_status: "pending" | "verified" | "rejected";
  data_source: "admin_input" | "user_input" | "crawling";
  sido: string;
  sigungu: string | null;
  jibun_address: string | null;
  road_address: string;
  detail_address: string | null;
  zone_code: string | null;
  building_name: string | null;
  social_urls: Partial<SNS> | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  shop_tags?: {
    tag_id: string;
    tags: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
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

export interface ShopCreateInput {
  name: string;
  shop_type: string;
  description?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  business_hours?: BusinessHours;
  is_24_hours?: boolean;
  gacha_machine_count?: number;
  main_series?: string[];
  sido: string;
  sigungu?: string;
  jibun_address?: string;
  road_address: string;
  detail_address?: string;
  zone_code?: string;
  building_name?: string;
  social_urls?: Partial<SNS>;
  tag_ids?: string[];
}

export interface ShopUpdateInput {
  name?: string;
  description?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  business_hours?: BusinessHours;
  is_24_hours?: boolean;
  gacha_machine_count?: number;
  main_series?: string[];
  detail_address?: string;
  social_urls?: Partial<SNS>;
  verification_status?: "pending" | "verified" | "rejected";
  tag_ids?: string[];
}

export interface ShopListResponse {
  data: Shop[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Edge Functions API 호출을 위한 헬퍼 함수
 */
export async function callEdgeFunction<T>(
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
 * Admin Shop Service Class
 */
export class AdminShopService {
  /**
   * Shop 생성 (Admin/Super Admin)
   */
  static async createShop(input: ShopCreateInput): Promise<Shop> {
    return callEdgeFunction<Shop>("/admin-shops-create", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  /**
   * Shop 수정 (Admin/Super Admin)
   */
  static async updateShop(
    shopId: string,
    input: ShopUpdateInput
  ): Promise<Shop> {
    return callEdgeFunction<Shop>(`/admin-shops-update?id=${shopId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  /**
   * Shop 삭제 (Admin/Super Admin)
   */
  static async deleteShop(shopId: string): Promise<{ message: string }> {
    return callEdgeFunction<{ message: string }>(
      `/admin-shops-delete?id=${shopId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Shop 목록 조회 (Admin/Super Admin)
   */
  static async listShops(params?: {
    status?: "pending" | "verified" | "rejected";
    page?: number;
    limit?: number;
  }): Promise<ShopListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const query = queryParams.toString();
    const endpoint = `/admin-shops-list${query ? `?${query}` : ""}`;

    return callEdgeFunction<ShopListResponse>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Shop 상세 조회 (Admin/Super Admin)
   */
  static async getShop(shopId: string): Promise<Shop> {
    return callEdgeFunction<Shop>(`/admin-shops-get?id=${shopId}`, {
      method: "GET",
    });
  }
}
