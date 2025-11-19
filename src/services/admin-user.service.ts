/**
 * Admin User Service
 * Edge Functions API를 사용한 Admin User 관리
 */

import type { AdminUser } from "./admin-auth.service";
import { callEdgeFunction } from "./admin-shop.service";

export interface AdminUserFilters {
  approval_status?: "pending" | "approved" | "rejected" | "all";
  status?: "active" | "suspended" | "deleted" | "all";
  role?: "super_admin" | "admin" | "owner" | "all";
  search?: string;
}

/**
 * Admin User Service Class
 */
export class AdminUserService {
  /**
   * 모든 어드민 유저 조회 (Super Admin)
   */
  static async getAllAdminUsers(
    filters?: AdminUserFilters
  ): Promise<AdminUser[]> {
    return callEdgeFunction<AdminUser[]>("/admin-users-get-all", {
      method: "POST",
      body: JSON.stringify({ filters }),
    });
  }

  /**
   * 어드민 유저 승인 (Super Admin)
   */
  static async approveUser(userId: string): Promise<AdminUser> {
    return callEdgeFunction<AdminUser>("/admin-users-approve", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * 어드민 유저 거절 (Super Admin)
   */
  static async rejectUser(
    userId: string,
    rejectionReason?: string
  ): Promise<AdminUser> {
    return callEdgeFunction<AdminUser>("/admin-users-reject", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, rejection_reason: rejectionReason }),
    });
  }
}
