/**
 * useMenuPermissions Hook
 * 사용자의 메뉴 접근 권한을 관리하는 커스텀 훅
 */

import { useQuery } from "@tanstack/react-query";
import { MenuService, type MenuWithChildren } from "@/services/menu.service";
import { useAuth } from "./useAuth";

export function useMenuPermissions() {
  const { user } = useAuth();

  // 사용자의 메뉴 권한 조회
  const {
    data: menus,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-menus", user?.id],
    queryFn: () => MenuService.getAdminMenus(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });

  /**
   * 특정 경로에 대한 접근 권한 확인
   */
  const hasAccessToPath = (path: string): boolean => {
    if (!menus || !user) return false;

    // super_admin은 모든 경로 접근 가능
    if (user.role === "super_admin") return true;

    // 메뉴 평탄화하여 모든 경로 추출
    const allPaths = flattenMenuPaths(menus);

    // 정확히 일치하는 경로가 있는지 확인
    return allPaths.includes(path);
  };

  /**
   * 메뉴 코드로 접근 권한 확인
   */
  const hasAccessToMenuCode = (code: string): boolean => {
    if (!menus || !user) return false;

    // super_admin은 모든 메뉴 접근 가능
    if (user.role === "super_admin") return true;

    // 메뉴 평탄화하여 모든 코드 추출
    const allCodes = flattenMenuCodes(menus);

    return allCodes.includes(code);
  };

  return {
    menus,
    isLoading,
    error,
    hasAccessToPath,
    hasAccessToMenuCode,
  };
}

/**
 * 계층 구조 메뉴에서 모든 경로를 평탄화
 */
function flattenMenuPaths(menus: MenuWithChildren[]): string[] {
  const paths: string[] = [];

  const flatten = (menuList: MenuWithChildren[]) => {
    menuList.forEach((menu) => {
      if (menu.path) {
        paths.push(menu.path);
      }
      if (menu.children && menu.children.length > 0) {
        flatten(menu.children);
      }
    });
  };

  flatten(menus);
  return paths;
}

/**
 * 계층 구조 메뉴에서 모든 코드를 평탄화
 */
function flattenMenuCodes(menus: MenuWithChildren[]): string[] {
  const codes: string[] = [];

  const flatten = (menuList: MenuWithChildren[]) => {
    menuList.forEach((menu) => {
      codes.push(menu.code);
      if (menu.children && menu.children.length > 0) {
        flatten(menu.children);
      }
    });
  };

  flatten(menus);
  return codes;
}
