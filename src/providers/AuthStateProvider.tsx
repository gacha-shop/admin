import { useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { authKeys } from "@/hooks/useAuth";

/**
 * AuthStateProvider - Listen to Supabase auth state changes
 *
 * This provider should be mounted once at the app level to avoid duplicate listeners.
 * It handles SIGNED_OUT events and clears the query cache.
 *
 * SIGNED_IN events are only processed for actual new logins, not tab switches.
 */
export function AuthStateProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  useEffect(() => {
    console.log("🔊 AuthStateProvider: Setting up auth listener");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log("🔔 Auth state changed:", event);

      // Handle initial session
      if (event === "INITIAL_SESSION") {
        hasInitialized.current = true;
        return;
      }

      // Ignore events until initialized
      if (!hasInitialized.current) {
        console.log("⏭️ Not initialized yet, ignoring event:", event);
        return;
      }

      if (event === "SIGNED_OUT") {
        // Clear user query cache on sign out
        queryClient.setQueryData(authKeys.current, null);
        navigate("/login", { replace: true });
      } else if (event === "SIGNED_IN") {
        // Only invalidate on actual sign in (from login page)
        // Check if we already have cached user data
        const cachedUser = queryClient.getQueryData(authKeys.current);
        if (!cachedUser) {
          console.log("✅ New login detected, invalidating cache");
          queryClient.invalidateQueries({ queryKey: authKeys.current });
        } else {
          console.log("⏭️ Already logged in, skipping refetch");
        }
      }
      // Ignore TOKEN_REFRESHED and other events
    });

    return () => {
      console.log("🔇 AuthStateProvider: Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [queryClient, navigate]);

  return <>{children}</>;
}
