import { useEffect, useState } from "react";
import { AdminApprovalService } from "@/services/admin-approval.service";
import type { AdminUser } from "@/services/admin-auth.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AdminApprovals() {
  const [pendingAdmins, setPendingAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingAdmins();
  }, []);

  const loadPendingAdmins = async () => {
    setIsLoading(true);
    setError("");

    const { users, error } = await AdminApprovalService.getPendingAdmins();

    if (error) {
      setError(error.message);
    } else {
      setPendingAdmins(users);
    }

    setIsLoading(false);
  };

  const handleApprove = async (admin: AdminUser) => {
    if (!confirm(`${admin.full_name || admin.email}님을 승인하시겠습니까?`)) {
      return;
    }

    setIsProcessing(true);

    const { error } = await AdminApprovalService.approveAdmin(admin.id);

    if (error) {
      alert(`승인 실패: ${error.message}`);
    } else {
      alert("승인되었습니다.");
      loadPendingAdmins();
    }

    setIsProcessing(false);
  };

  const openRejectDialog = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedAdmin) return;

    setIsProcessing(true);

    const { error } = await AdminApprovalService.rejectAdmin(
      selectedAdmin.id,
      rejectionReason
    );

    if (error) {
      alert(`거부 실패: ${error.message}`);
    } else {
      alert("거부되었습니다.");
      setRejectDialogOpen(false);
      loadPendingAdmins();
    }

    setIsProcessing(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "슈퍼 관리자";
      case "admin":
        return "관리자";
      case "owner":
        return "사장님";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">어드민 승인 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          회원가입한 어드민의 승인/거부를 관리합니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {pendingAdmins.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">승인 대기 중인 어드민이 없습니다.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingAdmins.map((admin) => (
            <Card key={admin.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {admin.full_name || "이름 없음"}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {getRoleLabel(admin.role)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                      승인 대기
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{admin.email}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    가입일: {new Date(admin.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(admin)}
                    disabled={isProcessing}
                    size="sm"
                  >
                    승인
                  </Button>
                  <Button
                    onClick={() => openRejectDialog(admin)}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                  >
                    거부
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>어드민 거부</DialogTitle>
            <DialogDescription>
              {selectedAdmin?.full_name || selectedAdmin?.email}님의 가입을
              거부합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="rejection_reason">거부 사유 (선택)</Label>
            <Input
              id="rejection_reason"
              placeholder="거부 사유를 입력하세요"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-gray-500">
              거부 사유는 해당 사용자에게 로그인 시 표시됩니다.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing ? "처리 중..." : "거부"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
