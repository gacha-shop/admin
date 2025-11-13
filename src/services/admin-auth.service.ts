import { supabase } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "super_admin" | "admin" | "owner";
  status: "active" | "suspended" | "deleted";
  approval_status: "pending" | "approved" | "rejected";
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role?: "admin" | "owner";
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Admin user authentication service
 * Uses admin_users table for admin-specific authentication
 */
export class AdminAuthService {
  /**
   * Sign up a new admin user
   */
  static async signUp(
    data: SignUpData
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // 2. Create admin_users record using RPC function (bypasses RLS)
      const { data: adminUser, error: adminError } = await supabase.rpc(
        "create_admin_user",
        {
          user_id: authData.user.id,
          user_email: data.email,
          user_full_name: data.full_name,
          user_role: data.role || "admin",
        }
      );

      if (adminError) {
        console.error("Admin user creation failed:", adminError);
        // Note: Can't delete auth user here due to auth restrictions
        // The auth user will exist but won't have admin_users record
        throw new Error("관리자 계정 생성에 실패했습니다. 다시 시도해주세요.");
      }

      return { user: adminUser, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in an admin user
   */
  static async signIn(
    data: SignInData
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Authentication failed");

      // 2. Check if user exists in admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      console.log("adminUseradminUseradminUser", adminUser);

      if (adminError || !adminUser) {
        // User is not an admin, sign them out
        await supabase.auth.signOut();
        throw new Error("관리자 권한이 필요합니다.");
      }

      // 3. Check if user is active
      if (adminUser.status !== "active") {
        await supabase.auth.signOut();
        throw new Error("계정이 비활성화되었습니다. 관리자에게 문의하세요.");
      }

      // 4. Check approval status
      if (adminUser.approval_status === "pending") {
        await supabase.auth.signOut();
        throw new Error(
          "계정 승인 대기 중입니다. 슈퍼 관리자의 승인을 기다려주세요."
        );
      }

      if (adminUser.approval_status === "rejected") {
        await supabase.auth.signOut();
        const reason = adminUser.rejection_reason
          ? `\n사유: ${adminUser.rejection_reason}`
          : "";
        throw new Error(`계정이 거부되었습니다.${reason}`);
      }

      // 4. Update last login info
      await supabase
        .from("admin_users")
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq("id", authData.user.id);

      return { user: adminUser, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error: error as Error };
    }
  }

  /**
   * Get current admin user
   */
  static async getCurrentUser(): Promise<{
    user: AdminUser | null;
    error: Error | null;
  }> {
    try {
      // 1. Get current authenticated user (more direct than getSession)
      const userPromise = await supabase.auth.getUser();
      console.log("userPromiseuserPromiseuserPromise", userPromise);

      const result = userPromise;

      const {
        data: { user: authUser },
        error: authError,
      } = result;

      if (authError) {
        console.error("❌ Auth 유저 조회 에러:", authError);
        throw authError;
      }

      if (!authUser) {
        console.log("⚠️ 인증된 사용자 없음 - 로그인되지 않은 상태");
        return { user: null, error: null };
      }

      // 2. Get admin user data
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (adminError) {
        console.error("❌ admin_users 조회 에러:", adminError);
        throw adminError;
      }

      return { user: adminUser, error: null };
    } catch (error) {
      console.error("❌ Get current user error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Check if user is authenticated and is an admin
   */
  static async isAuthenticated(): Promise<boolean> {
    const { user } = await this.getCurrentUser();
    return user !== null && user.status === "active";
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(
    roles: Array<"super_admin" | "admin" | "owner">
  ): Promise<boolean> {
    const { user } = await this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }
}
