import { supabase } from "@/lib/supabase";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

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
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role?: "admin" | "owner";
  // Owner 전용 필드
  phone?: string;
  shop_id?: string;
  business_license?: string;
  business_name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Admin user authentication service
 * ✅ 하이브리드 아키텍처: Edge Function (비즈니스 로직) + Supabase Auth (세션 관리)
 */
export class AdminAuthService {
  /**
   * Sign up a new admin user
   * Edge Function으로 회원가입 처리
   */
  static async signUp(
    data: SignUpData
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      // Edge Function 호출 (비즈니스 로직 처리)
      const response = await fetch(`${EDGE_FUNCTION_URL}/admin-auth-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, // ✅ Anon Key 필수
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "회원가입에 실패했습니다.");
      }

      // ✅ Edge Function에서 Supabase Auth로 유저 생성했으므로
      // 클라이언트에서 자동으로 세션 생성 (Supabase Auth SDK)
      return { user: result.data.user, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in an admin user
   * Edge Function으로 로그인 처리 (권한 체크, Audit 로그)
   */
  static async signIn(
    data: SignInData
  ): Promise<{ user: AdminUser | null; error: Error | null }> {
    try {
      // Edge Function 호출 (비즈니스 로직 처리)
      const response = await fetch(`${EDGE_FUNCTION_URL}/admin-auth-signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, // ✅ Anon Key 필수
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "로그인에 실패했습니다.");
      }

      // ✅ Edge Function에서 반환한 세션을 클라이언트에 설정
      if (result.data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.data.session.access_token,
          refresh_token: result.data.session.refresh_token,
        });

        if (sessionError) {
          throw new Error("세션 설정에 실패했습니다.");
        }
      }

      return { user: result.data.user, error: null };
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
