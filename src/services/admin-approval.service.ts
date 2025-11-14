import { supabase } from '@/lib/supabase';
import type { AdminUser } from './admin-auth.service';

/**
 * Admin approval service
 * Handles approval/rejection of pending admin users (super_admin only)
 */
export class AdminApprovalService {
  /**
   * Get list of pending admin users
   */
  static async getPendingAdmins(): Promise<{ users: AdminUser[]; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('get_pending_admin_users');

      if (error) throw error;

      return { users: data || [], error: null };
    } catch (error) {
      console.error('Get pending admins error:', error);
      return { users: [], error: error as Error };
    }
  }

  /**
   * Approve an admin user
   */
  static async approveAdmin(adminId: string): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('approve_admin_user', {
        target_admin_id: adminId,
      });

      if (error) throw error;

      return { user: data, error: null };
    } catch (error) {
      console.error('Approve admin error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Reject an admin user
   */
  static async rejectAdmin(
    adminId: string,
    reason?: string
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.rpc('reject_admin_user', {
        target_admin_id: adminId,
        reason: reason || null,
      });

      if (error) throw error;

      return { user: data, error: null };
    } catch (error) {
      console.error('Reject admin error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Get count of pending approvals
   */
  static async getPendingCount(): Promise<{ count: number; error: Error | null }> {
    try {
      const { users, error } = await this.getPendingAdmins();

      if (error) throw error;

      return { count: users.length, error: null };
    } catch (error) {
      console.error('Get pending count error:', error);
      return { count: 0, error: error as Error };
    }
  }
}
