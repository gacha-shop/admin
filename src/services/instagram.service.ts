/**
 * Instagram Service
 * Edge Functions API를 사용한 Instagram 해시태그 및 Credentials 관리
 */

import { supabase } from "@/lib/supabase";

// Edge Functions Base URL
const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL + "/functions/v1";

// Types
export interface InstagramHashtag {
  id: string;
  keyword: string;
  hashtag_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstagramCredential {
  user_id: string;
  expires_at: string;
  days_remaining: number;
  is_expiring_soon: boolean;
  created_at: string;
}

export interface InstagramHashtagListResponse {
  data: InstagramHastagsRes;
  success: boolean;
}

export interface InstagramHastagsRes {
  hashtags: InstagramHashtag[];
  total: number;
  within_7_days_count: number;
  limit_info: {
    max_hashtags_per_7_days: number;
    current_count: number;
    remaining: number;
  };
}

export interface UpsertCredentialRequest {
  access_token: string;
  user_id: string;
  expires_in?: number;
}

export interface SearchHashtagRequest {
  keyword: string;
}

/**
 * Edge Function 호출 헬퍼
 */
async function callEdgeFunction<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No active session");
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Unknown error occurred");
  }

  return response.json();
}

/**
 * Instagram Service Class
 */
export class InstagramService {
  // ==================== Credentials ====================

  /**
   * Instagram Credential 정보 조회
   */
  static async getCredential(): Promise<InstagramCredential> {
    return callEdgeFunction<InstagramCredential>("/instagram-credentials-get", {
      method: "GET",
    });
  }

  /**
   * Instagram Credential 업데이트 (Upsert)
   */
  static async upsertCredential(
    data: UpsertCredentialRequest
  ): Promise<{ success: boolean; credential: Partial<InstagramCredential> }> {
    return callEdgeFunction("/instagram-credentials-upsert", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== Hashtags ====================

  /**
   * 해시태그 목록 조회
   */
  static async listHashtags(): Promise<InstagramHashtagListResponse> {
    return callEdgeFunction<InstagramHashtagListResponse>(
      "/instagram-hashtags-list",
      {
        method: "GET",
      }
    );
  }

  /**
   * 해시태그 검색 및 등록
   */
  static async searchHashtag(keyword: string): Promise<InstagramHashtag> {
    const response = await callEdgeFunction<{ success: boolean; data: InstagramHashtag }>(
      "/instagram-hashtags-search",
      {
        method: "POST",
        body: JSON.stringify({ keyword }),
      }
    );
    return response.data;
  }

  /**
   * 해시태그 활성화/비활성화 토글
   */
  static async toggleHashtag(hashtagId: string): Promise<InstagramHashtag> {
    const response = await callEdgeFunction<{ success: boolean; data: InstagramHashtag }>(
      "/instagram-hashtags-toggle",
      {
        method: "PATCH",
        body: JSON.stringify({ hashtag_id: hashtagId }),
      }
    );
    return response.data;
  }

  // ==================== Utility Functions ====================

  /**
   * 7일 경과 여부 확인
   */
  static isExpiredHashtag(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInDays =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 7;
  }

  /**
   * 해시태그 추가 가능 여부 확인
   */
  static canAddMoreHashtags(hashtags: InstagramHashtag[]): boolean {
    const activeWithin7Days = hashtags.filter(
      (h) => !this.isExpiredHashtag(h.created_at)
    );
    return activeWithin7Days.length < 30;
  }

  /**
   * 7일 이내 등록된 해시태그 개수
   */
  static getWithin7DaysCount(hashtags: InstagramHashtag[]): number {
    return hashtags.filter((h) => !this.isExpiredHashtag(h.created_at)).length;
  }

  /**
   * Credential 만료 임박 여부 확인
   */
  static isCredentialExpiringSoon(daysRemaining: number): boolean {
    return daysRemaining <= 7;
  }
}
