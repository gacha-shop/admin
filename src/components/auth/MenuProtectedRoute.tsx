import { Navigate, useLocation } from "react-router-dom";
import { useMenuPermissions } from "@/hooks/useMenuPermissions";
import { useAuth } from "@/hooks/useAuth";

interface MenuProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * MenuProtectedRoute
 * 메뉴 권한 기반으로 라우트 접근을 제어하는 컴포넌트
 */
export function MenuProtectedRoute({ children }: MenuProtectedRouteProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { hasAccessToPath, isLoading } = useMenuPermissions();

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  // super_admin은 모든 페이지 접근 가능
  if (user?.role === "super_admin") {
    return <>{children}</>;
  }

  // 현재 경로에 대한 접근 권한 확인
  const currentPath = location.pathname;
  const hasAccess = hasAccessToPath(currentPath);

  // 권한이 없으면 404 페이지로 리다이렉트
  if (!hasAccess) {
    return <Navigate to="/404" replace />;
  }

  // 권한이 있으면 children 렌더링
  return <>{children}</>;
}
