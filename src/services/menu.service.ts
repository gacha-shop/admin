/**
 * Menu Service
 * Edge Functions API를 사용한 Menu 관리
 */

import { callEdgeFunction } from "./admin-shop.service";

// Types
export interface Menu {
  id: string;
  code: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  path: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface MenuWithChildren extends Menu {
  children?: MenuWithChildren[];
}

export interface AdminMenuPermission {
  id: string;
  admin_id: string;
  menu_id: string;
  granted_by: string | null;
  granted_at: string;
}

export interface CreateMenuRequest {
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  path?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateMenuRequest {
  code?: string;
  name?: string;
  description?: string;
  parent_id?: string;
  path?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateAdminMenuPermissionsRequest {
  admin_user_id: string;
  menu_ids: string[];
}

/**
 * Menu Service Class
 */
export class MenuService {
  /**
   * 로그인한 유저가 접근 가능한 메뉴 조회
   */
  static async getAdminMenus(adminId?: string): Promise<MenuWithChildren[]> {
    const response = await callEdgeFunction<{ menus: MenuWithChildren[] }>(
      "/admin-menus-get",
      {
        method: adminId ? "POST" : "GET",
        ...(adminId && { body: JSON.stringify({ admin_id: adminId }) }),
      }
    );
    return response.menus;
  }

  /**
   * 전체 메뉴 조회 (super_admin 전용)
   */
  static async getAllMenus(): Promise<MenuWithChildren[]> {
    const response = await callEdgeFunction<{ menus: MenuWithChildren[] }>(
      "/admin-menus-get-all",
      {
        method: "GET",
      }
    );
    return response.menus;
  }

  /**
   * 메뉴 생성 (super_admin 전용)
   */
  static async createMenu(data: CreateMenuRequest): Promise<Menu> {
    const response = await callEdgeFunction<{ menu: Menu }>(
      "/admin-menus-create",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.menu;
  }

  /**
   * 메뉴 수정 (super_admin 전용)
   */
  static async updateMenu(
    menuId: string,
    data: UpdateMenuRequest
  ): Promise<Menu> {
    const response = await callEdgeFunction<{ menu: Menu }>(
      `/admin-menus-update/${menuId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response.menu;
  }

  /**
   * 메뉴 삭제 (super_admin 전용)
   */
  static async deleteMenu(
    menuId: string,
    hardDelete = false
  ): Promise<{ success: boolean }> {
    return callEdgeFunction<{ success: boolean }>(
      `/admin-menus-delete/${menuId}?hard_delete=${hardDelete}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Admin User의 메뉴 권한 업데이트 (super_admin 전용)
   */
  static async updateAdminMenuPermissions(
    data: UpdateAdminMenuPermissionsRequest
  ): Promise<{
    success: boolean;
    permissions: AdminMenuPermission[];
  }> {
    return callEdgeFunction<{
      success: boolean;
      permissions: AdminMenuPermission[];
    }>("/admin-menu-permissions-update", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * 메뉴 리스트를 평탄화 (Flatten)
   * 계층 구조의 메뉴를 1차원 배열로 변환
   */
  static flattenMenus(menus: MenuWithChildren[]): Menu[] {
    const result: Menu[] = [];

    const flatten = (menuList: MenuWithChildren[]) => {
      menuList.forEach((menu) => {
        const { children, ...menuWithoutChildren } = menu;
        result.push(menuWithoutChildren);
        if (children && children.length > 0) {
          flatten(children);
        }
      });
    };

    flatten(menus);
    return result;
  }

  /**
   * 특정 Admin User가 가진 메뉴 ID 목록 추출
   */
  static extractMenuIds(menus: MenuWithChildren[]): string[] {
    return this.flattenMenus(menus).map((menu) => menu.id);
  }
}
