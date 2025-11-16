import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuService, type Menu } from "@/services/menu.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { MenuFormDialog } from "@/components/admin/MenuFormDialog";

export default function MenuManagement() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // 전체 메뉴 조회
  const { data: menus, isLoading } = useQuery({
    queryKey: ["all-menus"],
    queryFn: () => MenuService.getAllMenus(),
  });

  // 메뉴 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (menuId: string) => MenuService.deleteMenu(menuId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-menus"] });
    },
  });

  // 메뉴를 평탄화하여 테이블에 표시
  const flatMenus = menus ? MenuService.flattenMenus(menus) : [];

  // 부모 메뉴 이름 찾기
  const getParentMenuName = (parentId: string | null) => {
    if (!parentId) return "-";
    const parent = flatMenus.find((m) => m.id === parentId);
    return parent?.name || "-";
  };

  const handleDelete = (menuId: string, menuName: string) => {
    if (
      window.confirm(
        `"${menuName}" 메뉴를 삭제하시겠습니까?\n\n※ 하위 메뉴가 있는 경우 함께 삭제되지 않습니다.`
      )
    ) {
      deleteMutation.mutate(menuId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">메뉴 관리</h1>
          <p className="text-gray-600 mt-1">
            시스템 메뉴를 추가, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          메뉴 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">메뉴 로딩 중...</span>
        </div>
      ) : flatMenus.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>코드</TableHead>
                <TableHead>메뉴명</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>부모 메뉴</TableHead>
                <TableHead>경로</TableHead>
                <TableHead>순서</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatMenus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-mono text-sm">
                    {menu.code}
                  </TableCell>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate">
                    {menu.description || "-"}
                  </TableCell>
                  <TableCell>{getParentMenuName(menu.parent_id)}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {menu.path || "-"}
                  </TableCell>
                  <TableCell>{menu.display_order}</TableCell>
                  <TableCell>
                    {menu.is_active ? (
                      <Badge variant="default">활성</Badge>
                    ) : (
                      <Badge variant="neutral">비활성</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMenu(menu)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(menu.id, menu.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-gray-500">등록된 메뉴가 없습니다.</p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            첫 메뉴 추가하기
          </Button>
        </div>
      )}

      {/* 메뉴 추가 Dialog */}
      <MenuFormDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        mode="create"
        allMenus={flatMenus}
      />

      {/* 메뉴 수정 Dialog */}
      {editingMenu && (
        <MenuFormDialog
          open={!!editingMenu}
          onClose={() => setEditingMenu(null)}
          mode="edit"
          menu={editingMenu}
          allMenus={flatMenus}
        />
      )}
    </div>
  );
}
