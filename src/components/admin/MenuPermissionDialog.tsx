import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MenuService, type MenuWithChildren } from "@/services/menu.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface MenuPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  adminUserId: string;
  adminUserName: string;
}

export function MenuPermissionDialog({
  open,
  onClose,
  adminUserId,
  adminUserName,
}: MenuPermissionDialogProps) {
  const queryClient = useQueryClient();
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(
    new Set()
  );

  // 전체 메뉴 조회 (super_admin만 가능)
  const { data: allMenus, isLoading: isLoadingAllMenus } = useQuery({
    queryKey: ["all-menus"],
    queryFn: () => MenuService.getAllMenus(),
    enabled: open,
  });

  // 해당 유저의 현재 메뉴 권한 조회
  const { data: userMenus, isLoading: isLoadingUserMenus } = useQuery({
    queryKey: ["admin-menus", adminUserId],
    queryFn: () => MenuService.getAdminMenus(adminUserId),
    enabled: open,
  });

  // 권한 업데이트 mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: (menuIds: string[]) =>
      MenuService.updateAdminMenuPermissions({
        admin_user_id: adminUserId,
        menu_ids: menuIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menus", adminUserId] });
      onClose();
    },
  });

  // Dialog 열릴 때 유저의 현재 메뉴 권한을 selectedMenuIds에 반영
  useEffect(() => {
    if (!open) {
      // Dialog가 닫힐 때 초기화
      setSelectedMenuIds(new Set());
      return;
    }

    if (userMenus) {
      // 유저의 현재 메뉴 권한만 체크
      const menuIds = MenuService.extractMenuIds(userMenus);
      setSelectedMenuIds(new Set(menuIds));
    } else {
      // 아직 로딩 중이면 빈 Set
      setSelectedMenuIds(new Set());
    }
  }, [open, userMenus]);

  // 메뉴 체크박스 토글
  const toggleMenu = (menuId: string, checked: boolean) => {
    const newSelectedMenuIds = new Set(selectedMenuIds);
    if (checked) {
      newSelectedMenuIds.add(menuId);
    } else {
      newSelectedMenuIds.delete(menuId);
    }
    setSelectedMenuIds(newSelectedMenuIds);
  };

  // 부모 메뉴 체크박스 토글 (자식 메뉴도 함께 토글)
  const toggleMenuWithChildren = (
    menu: MenuWithChildren,
    checked: boolean
  ) => {
    const newSelectedMenuIds = new Set(selectedMenuIds);

    const toggleRecursive = (m: MenuWithChildren) => {
      if (checked) {
        newSelectedMenuIds.add(m.id);
      } else {
        newSelectedMenuIds.delete(m.id);
      }

      if (m.children && m.children.length > 0) {
        m.children.forEach(toggleRecursive);
      }
    };

    toggleRecursive(menu);
    setSelectedMenuIds(newSelectedMenuIds);
  };

  // 저장 핸들러
  const handleSave = () => {
    updatePermissionsMutation.mutate(Array.from(selectedMenuIds));
  };

  // 메뉴 트리 렌더링
  const renderMenuTree = (menus: MenuWithChildren[], level = 0) => {
    return menus.map((menu) => {
      const isChecked = selectedMenuIds.has(menu.id);
      const hasChildren = menu.children && menu.children.length > 0;

      return (
        <div key={menu.id} className="space-y-2">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            <Checkbox
              id={`menu-${menu.id}`}
              checked={isChecked}
              onCheckedChange={(checked) =>
                hasChildren
                  ? toggleMenuWithChildren(menu, checked as boolean)
                  : toggleMenu(menu.id, checked as boolean)
              }
            />
            <Label
              htmlFor={`menu-${menu.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {menu.name}
              {menu.description && (
                <span className="text-xs text-gray-500 ml-2">
                  ({menu.description})
                </span>
              )}
            </Label>
          </div>

          {hasChildren && renderMenuTree(menu.children!, level + 1)}
        </div>
      );
    });
  };

  const isLoading = isLoadingAllMenus || isLoadingUserMenus;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>메뉴 권한 관리</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">{adminUserName}</span> 유저가 접근할
            수 있는 메뉴를 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">메뉴 로딩 중...</span>
            </div>
          ) : allMenus && allMenus.length > 0 ? (
            <div className="space-y-3 border rounded-lg p-4">
              {renderMenuTree(allMenus)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              메뉴가 없습니다.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={updatePermissionsMutation.isPending || isLoading}
          >
            {updatePermissionsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
