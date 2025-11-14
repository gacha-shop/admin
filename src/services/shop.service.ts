import { supabase } from "@/lib/supabase";

export interface ShopValidationResult {
  valid: boolean;
  name?: string;
  address?: string;
  error?: string;
}

/**
 * Shop Service
 * 매장 관련 유틸리티 함수
 */
export class ShopService {
  /**
   * shop_id 검증 및 매장 정보 조회
   * 회원가입 시 사용자가 입력한 shop_id가 유효한지 확인
   */
  static async validateShopId(
    shopId: string
  ): Promise<ShopValidationResult> {
    try {
      // 1. UUID 포맷 검증
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const cleaned = shopId.trim();

      if (!cleaned) {
        return {
          valid: false,
          error: "매장 ID를 입력해주세요",
        };
      }

      if (!uuidRegex.test(cleaned)) {
        return {
          valid: false,
          error: "올바른 UUID 형식이 아닙니다",
        };
      }

      // 2. shop 존재 확인
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .select("id, name, road_address")
        .eq("id", cleaned)
        .eq("is_deleted", false)
        .single();

      if (shopError || !shop) {
        return {
          valid: false,
          error: "존재하지 않는 매장입니다",
        };
      }

      // 3. 이미 등록된 shop_id인지 확인
      const { data: existingOwner, error: ownerError } = await supabase
        .from("shop_owners")
        .select("id, verified")
        .eq("shop_id", cleaned)
        .maybeSingle();

      if (ownerError) {
        console.error("shop_owners 조회 에러:", ownerError);
        return {
          valid: false,
          error: "매장 소유권 확인 중 오류가 발생했습니다",
        };
      }

      if (existingOwner) {
        return {
          valid: false,
          error: existingOwner.verified
            ? "이미 등록된 매장입니다"
            : "다른 사용자의 승인 대기 중입니다",
        };
      }

      // 4. 성공 - 매장 정보 반환
      return {
        valid: true,
        name: shop.name,
        address: shop.road_address,
      };
    } catch (error) {
      console.error("shop_id 검증 에러:", error);
      return {
        valid: false,
        error: "매장 검증 중 오류가 발생했습니다",
      };
    }
  }
}
