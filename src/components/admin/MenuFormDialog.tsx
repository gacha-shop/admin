import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MenuService,
  type Menu,
  type CreateMenuRequest,
  type UpdateMenuRequest,
} from "@/services/menu.service";
import { Loader2 } from "lucide-react";

interface MenuFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  menu?: Menu;
  allMenus: Menu[];
}

interface MenuFormData {
  code: string;
  name: string;
  description: string;
  parent_id: string;
  path: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export function MenuFormDialog({
  open,
  onClose,
  mode,
  menu,
  allMenus,
}: MenuFormDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<MenuFormData>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      parent_id: "none",
      path: "",
      icon: "",
      display_order: 0,
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  // Dialog 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === "edit" && menu) {
        reset({
          code: menu.code,
          name: menu.name,
          description: menu.description || "",
          parent_id: menu.parent_id || "none",
          path: menu.path || "",
          icon: menu.icon || "",
          display_order: menu.display_order,
          is_active: menu.is_active,
        });
      } else {
        reset({
          code: "",
          name: "",
          description: "",
          parent_id: "none",
          path: "",
          icon: "",
          display_order: 0,
          is_active: true,
        });
      }
    }
  }, [open, mode, menu, reset]);

  // 메뉴 생성 mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateMenuRequest) => MenuService.createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-menus"] });
      onClose();
    },
  });

  // 메뉴 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({
      menuId,
      data,
    }: {
      menuId: string;
      data: UpdateMenuRequest;
    }) => MenuService.updateMenu(menuId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-menus"] });
      onClose();
    },
  });

  const onSubmit = (data: MenuFormData) => {
    const requestData = {
      code: data.code,
      name: data.name,
      description: data.description || undefined,
      parent_id: data.parent_id && data.parent_id !== "none" ? data.parent_id : undefined,
      path: data.path || undefined,
      icon: data.icon || undefined,
      display_order: data.display_order,
      is_active: data.is_active,
    };

    if (mode === "create") {
      createMutation.mutate(requestData);
    } else if (mode === "edit" && menu) {
      updateMutation.mutate({
        menuId: menu.id,
        data: requestData,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // 부모로 선택 가능한 메뉴 목록 (자기 자신 제외)
  const availableParentMenus =
    mode === "edit" && menu
      ? allMenus.filter((m) => m.id !== menu.id)
      : allMenus;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "메뉴 추가" : "메뉴 수정"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "새로운 메뉴를 추가합니다."
              : "메뉴 정보를 수정합니다."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 메뉴 코드 */}
            <div className="space-y-2">
              <Label htmlFor="code">
                메뉴 코드 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                {...register("code", {
                  required: "메뉴 코드는 필수입니다",
                })}
                placeholder="예: admin-menu-management"
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            {/* 메뉴명 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                메뉴명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", {
                  required: "메뉴명은 필수입니다",
                })}
                placeholder="예: 메뉴 관리"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="메뉴에 대한 설명을 입력하세요"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 부모 메뉴 */}
            <div className="space-y-2">
              <Label htmlFor="parent_id">부모 메뉴</Label>
              <Controller
                name="parent_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="parent_id">
                      <SelectValue placeholder="없음 (최상위 메뉴)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">없음 (최상위 메뉴)</SelectItem>
                      {availableParentMenus.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({m.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* 경로 */}
            <div className="space-y-2">
              <Label htmlFor="path">경로</Label>
              <Input
                id="path"
                {...register("path")}
                placeholder="예: /admin/menus"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 아이콘 */}
            <div className="space-y-2">
              <Label htmlFor="icon">아이콘</Label>
              <Input
                id="icon"
                {...register("icon")}
                placeholder="예: Menu, Settings (Lucide icon name)"
              />
              <p className="text-xs text-gray-500">
                Lucide 아이콘 이름을 입력하세요
              </p>
            </div>

            {/* 표시 순서 */}
            <div className="space-y-2">
              <Label htmlFor="display_order">
                표시 순서 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="display_order"
                type="number"
                {...register("display_order", {
                  required: "표시 순서는 필수입니다",
                  valueAsNumber: true,
                })}
                placeholder="0"
              />
              {errors.display_order && (
                <p className="text-sm text-red-500">
                  {errors.display_order.message}
                </p>
              )}
            </div>
          </div>

          {/* 활성 상태 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue("is_active", checked as boolean)
              }
            />
            <Label
              htmlFor="is_active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              활성 상태
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "create" ? "추가 중..." : "수정 중..."}
                </>
              ) : mode === "create" ? (
                "추가"
              ) : (
                "수정"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
