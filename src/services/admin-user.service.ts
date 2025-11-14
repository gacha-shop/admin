import { supabase } from "@/lib/supabase";
import type { AdminUser } from "./admin-auth.service";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type UserStatus = "active" | "suspended" | "deleted";
export type AdminRole = "super_admin" | "admin" | "owner";

export interface AdminUserFilters {
  approval_status?: ApprovalStatus | "all";
  status?: UserStatus | "all";
  role?: AdminRole | "all";
  search?: string; // Search by email or name
}

/**
 * Admin user management service
 * Handles CRUD operations for admin users
 * TODO: 클라이언트에서 DB를 직접 접근하는것이 아닌, Edge Function을 통해 접근하도록 변경 필요
 */
export class AdminUserService {
  /**
   * Get all admin users with optional filters
   */
  static async getAllAdminUsers(
    filters?: AdminUserFilters
  ): Promise<{ users: AdminUser[]; error: Error | null }> {
    try {
      let query = supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.approval_status && filters.approval_status !== "all") {
        query = query.eq("approval_status", filters.approval_status);
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.role && filters.role !== "all") {
        query = query.eq("role", filters.role);
      }

      if (filters?.search) {
        query = query.or(
          `email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return { users: data || [], error: null };
    } catch (error) {
      console.error("Get all admin users error:", error);
      return { users: [], error: error as Error };
    }
  }

  /**
   * Get single admin user by ID
   */
  static async getAdminUserById(
    userId: string
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return { user: data, error: null };
    } catch (error) {
      console.error("Get admin user by ID error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Update admin user details
   */
  static async updateAdminUser(
    userId: string,
    updates: Partial<AdminUser>
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      return { user: data, error: null };
    } catch (error) {
      console.error("Update admin user error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Suspend an admin user
   */
  static async suspendAdminUser(
    userId: string
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    return this.updateAdminUser(userId, { status: "suspended" });
  }

  /**
   * Activate an admin user
   */
  static async activateAdminUser(
    userId: string
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    return this.updateAdminUser(userId, { status: "active" });
  }

  /**
   * Delete an admin user (soft delete)
   */
  static async deleteAdminUser(
    userId: string
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    return this.updateAdminUser(userId, { status: "deleted" });
  }

  /**
   * Get statistics about admin users
   */
  static async getAdminUserStats(): Promise<{
    stats: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      active: number;
      suspended: number;
    };
    error: Error | null;
  }> {
    try {
      const { users, error } = await this.getAllAdminUsers();

      if (error) throw error;

      const stats = {
        total: users.length,
        pending: users.filter((u) => u.approval_status === "pending").length,
        approved: users.filter((u) => u.approval_status === "approved").length,
        rejected: users.filter((u) => u.approval_status === "rejected").length,
        active: users.filter((u) => u.status === "active").length,
        suspended: users.filter((u) => u.status === "suspended").length,
      };

      return { stats, error: null };
    } catch (error) {
      console.error("Get admin user stats error:", error);
      return {
        stats: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          active: 0,
          suspended: 0,
        },
        error: error as Error,
      };
    }
  }

  /**
   * Approve an admin user (delegates to AdminApprovalService RPC)
   */
  static async approveAdmin(
    adminId: string
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc("approve_admin_user", {
        target_admin_id: adminId,
      });

      if (error) throw error;

      return { user: data, error: null };
    } catch (error) {
      console.error("Approve admin error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Reject an admin user (delegates to AdminApprovalService RPC)
   */
  static async rejectAdmin(
    adminId: string,
    reason?: string
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc("reject_admin_user", {
        target_admin_id: adminId,
        reason: reason || null,
      });

      if (error) throw error;

      return { user: data, error: null };
    } catch (error) {
      console.error("Reject admin error:", error);
      return { user: null, error: error as Error };
    }
  }
}
