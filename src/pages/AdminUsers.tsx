import { useState } from "react";
import type { AdminUser } from "@/services/admin-auth.service";
import { AdminUserService } from "@/services/admin-user.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MenuPermissionDialog } from "@/components/admin/MenuPermissionDialog";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [menuPermissionDialogOpen, setMenuPermissionDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // 어드민 유저 목록 조회
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => AdminUserService.getAllAdminUsers(),
  });

  // 승인 mutation
  const approveMutation = useMutation({
    mutationFn: (userId: string) => AdminUserService.approveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // 거절 mutation
  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      AdminUserService.rejectUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedUserId(null);
    },
  });

  const handleApprove = (userId: string) => {
    if (confirm("이 사용자를 승인하시겠습니까?")) {
      approveMutation.mutate(userId);
    }
  };

  const handleRejectClick = (userId: string) => {
    setSelectedUserId(userId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedUserId) {
      rejectMutation.mutate({
        userId: selectedUserId,
        reason: rejectionReason || undefined,
      });
    }
  };

  const handleMenuPermissionClick = (user: AdminUser) => {
    setSelectedUser(user);
    setMenuPermissionDialogOpen(true);
  };

  const handleMenuPermissionClose = () => {
    setMenuPermissionDialogOpen(false);
    setSelectedUser(null);
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">대기중</Badge>;
      case "approved":
        return <Badge variant="success">승인</Badge>;
      case "rejected":
        return <Badge variant="error">거절</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">활성</Badge>;
      case "suspended":
        return <Badge variant="error">정지</Badge>;
      case "deleted":
        return <Badge variant="outline">삭제</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge variant="info">슈퍼 어드민</Badge>;
      case "admin":
        return <Badge variant="neutral">어드민</Badge>;
      case "owner":
        return <Badge variant="outline">오너</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">어드민 유저 관리</h1>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">어드민 유저 관리</h1>
      <p className="text-gray-600 mb-6">어드민 유저를 관리하는 페이지입니다.</p>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이메일</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>승인 상태</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead>승인/거절</TableHead>
              <TableHead>메뉴 권한</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user: AdminUser) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || "-"}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{getApprovalStatusBadge(user.approval_status)}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell>
                    {user.approval_status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user.id)}
                          disabled={approveMutation.isPending}
                        >
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(user.id)}
                          disabled={rejectMutation.isPending}
                        >
                          거절
                        </Button>
                      </div>
                    )}
                    {user.approval_status === "approved" && (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                    {user.approval_status === "rejected" && (
                      <span className="text-sm text-gray-500">
                        {user.rejection_reason || "거절됨"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.approval_status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMenuPermissionClick(user)}
                      >
                        메뉴 권한
                      </Button>
                    )}
                    {user.approval_status !== "approved" && (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  등록된 어드민 유저가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 거절 사유 입력 Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 거절</DialogTitle>
            <DialogDescription>
              거절 사유를 입력해주세요. (선택사항)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="거절 사유를 입력하세요"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedUserId(null);
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
            >
              거절
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 메뉴 권한 관리 Dialog */}
      {selectedUser && (
        <MenuPermissionDialog
          open={menuPermissionDialogOpen}
          onClose={handleMenuPermissionClose}
          adminUserId={selectedUser.id}
          adminUserName={selectedUser.full_name || selectedUser.email}
        />
      )}
    </div>
  );
}
