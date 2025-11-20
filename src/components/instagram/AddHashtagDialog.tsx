/**
 * AddHashtagDialog Component
 * Instagram 해시태그 추가 모달
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { InstagramService } from "@/services/instagram.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Hash, Loader2 } from "lucide-react";

interface AddHashtagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddHashtagDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddHashtagDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: (keyword: string) => InstagramService.searchHashtag(keyword),
    onSuccess: (data) => {
      console.log(data);
      onSuccess();
      onOpenChange(false);
      setKeyword("");
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || "해시태그 검색에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setError("키워드를 입력해주세요.");
      return;
    }

    searchMutation.mutate(trimmedKeyword);
  };

  const handleClose = () => {
    if (!searchMutation.isPending) {
      onOpenChange(false);
      setKeyword("");
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instagram 해시태그 추가</DialogTitle>
          <DialogDescription>
            Instagram Graph API를 통해 해시태그를 검색하고 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">해시태그 키워드</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="keyword"
                type="text"
                placeholder="예: fashion, travel"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={searchMutation.isPending}
                className="pl-10"
                autoFocus
              />
            </div>
            <p className="text-sm text-gray-500">
              '#' 기호 없이 키워드만 입력하세요.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={searchMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={searchMutation.isPending}>
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>등록</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
