/**
 * Settings Page
 * Instagram Credentials 설정 페이지 (서버 저장 방식)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InstagramService } from "@/services/instagram.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Key, Loader2, User } from "lucide-react";
import { CredentialStatus } from "@/components/instagram/CredentialStatus";

export function Settings() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [expiresIn, setExpiresIn] = useState("5184000"); // 60일 (초 단위)

  // Credential 정보 조회
  const {
    data: credential,
    isLoading: isLoadingCredential,
    error: credentialError,
  } = useQuery({
    queryKey: ["instagram-credential"],
    queryFn: () => InstagramService.getCredential(),
    retry: 1,
  });

  // Credential 업데이트 mutation
  const updateMutation = useMutation({
    mutationFn: (data: { user_id: string; access_token: string; expires_in: number }) =>
      InstagramService.upsertCredential(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram-credential"] });
      alert("Instagram Credential이 성공적으로 업데이트되었습니다.");
      setUserId("");
      setAccessToken("");
      setExpiresIn("5184000");
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to update credential");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !accessToken.trim()) {
      alert("User ID와 Access Token을 모두 입력해주세요.");
      return;
    }

    const expiresInNumber = parseInt(expiresIn);
    if (isNaN(expiresInNumber) || expiresInNumber <= 0) {
      alert("유효한 만료 기간을 입력해주세요.");
      return;
    }

    updateMutation.mutate({
      user_id: userId.trim(),
      access_token: accessToken.trim(),
      expires_in: expiresInNumber,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">설정</h1>
        <p className="text-gray-600">Instagram API 연동 설정을 관리합니다.</p>
      </div>

      {/* Current Credential Status */}
      {isLoadingCredential ? (
        <div className="bg-white border rounded-md p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Credential 정보 조회 중...</span>
          </div>
        </div>
      ) : credentialError ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-yellow-800 font-semibold mb-1">
                Instagram Credential 미설정
              </h3>
              <p className="text-yellow-600 text-sm">
                아래 폼을 통해 Instagram Access Token을 설정해주세요.
              </p>
            </div>
          </div>
        </div>
      ) : credential ? (
        <div>
          <h2 className="text-lg font-semibold mb-3">현재 Credential 상태</h2>
          <CredentialStatus credential={credential} />
        </div>
      ) : null}

      {/* Update Credential Form */}
      <div className="bg-white border rounded-md p-6">
        <h2 className="text-lg font-semibold mb-4">Instagram Credential 업데이트</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId">Instagram Business Account User ID</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="userId"
                type="text"
                placeholder="예: 17841234567890123"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={updateMutation.isPending}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500">
              Instagram Business Account의 User ID를 입력하세요.
            </p>
          </div>

          {/* Access Token */}
          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token (Long-lived)</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="accessToken"
                placeholder="IGQW..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                disabled={updateMutation.isPending}
                rows={4}
                className="pl-10 font-mono text-sm"
              />
            </div>
            <p className="text-sm text-gray-500">
              Instagram Graph API의 Long-lived Access Token을 입력하세요. (유효기간: 60일)
            </p>
          </div>

          {/* Expires In */}
          <div className="space-y-2">
            <Label htmlFor="expiresIn">만료 기간 (초 단위)</Label>
            <Input
              id="expiresIn"
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              disabled={updateMutation.isPending}
              min="1"
            />
            <p className="text-sm text-gray-500">
              기본값: 5184000초 (60일). Long-lived Token의 유효기간을 입력하세요.
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={updateMutation.isPending} className="w-full">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                업데이트 중...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Credential 업데이트
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-blue-800 font-semibold mb-2">
          📌 Instagram Access Token 발급 방법
        </h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Meta Developers Console에서 Facebook 앱 생성</li>
          <li>Instagram Basic Display API 설정</li>
          <li>Instagram Business Account 연결</li>
          <li>단기 Access Token 발급</li>
          <li>장기 토큰으로 교환 (60일)</li>
          <li>위 폼에 User ID와 Access Token 입력</li>
        </ol>
        <p className="text-sm text-blue-600 mt-3">
          💡 Credential은 암호화되어 서버에 저장됩니다. super_admin 권한이 필요합니다.
        </p>
      </div>
    </div>
  );
}
