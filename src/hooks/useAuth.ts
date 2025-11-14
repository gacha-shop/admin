import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdminAuthService } from "@/services/admin-auth.service";

// Query key for auth data
export const authKeys = {
  current: ["auth", "current-user"] as const,
};

/**
 * Custom hook for authentication using TanStack Query
 *
 * Benefits:
 * - Automatic caching with 5 min staleTime
 * - Single source of truth - all components share same query
 * - No duplicate API calls
 * - Built-in loading and error states
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch current user with TanStack Query
  const {
    data: user = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: authKeys.current,
    queryFn: async () => {
      const result = await AdminAuthService.getCurrentUser();
      if (result.error) {
        throw result.error;
      }
      return result.user;
    },
    retry: false, // Don't retry on auth errors
    staleTime: 1000 * 60 * 5, // 5 minutes - user data doesn't change often
    refetchOnWindowFocus: false, // Don't refetch on tab switch
  });

  const signOut = async () => {
    await AdminAuthService.signOut();
    queryClient.setQueryData(authKeys.current, null);
    navigate("/login", { replace: true });
  };

  return {
    user,
    isLoading,
    error,
    signOut,
    refetch,
  };
}
