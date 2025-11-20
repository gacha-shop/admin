/**
 * Instagram Hashtags Page
 * Instagram 해시태그 관리 페이지
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  InstagramService,
  type InstagramHashtag,
} from "@/services/instagram.service";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { AddHashtagDialog } from "@/components/instagram/AddHashtagDialog";
import { HashtagsTable } from "@/components/instagram/HashtagsTable";

export default function InstagramHashtags() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // 해시태그 목록 조회
  const {
    data: hashtagsData,
    isLoading: isLoadingHashtags,
    error: hashtagsError,
    refetch: refetchHashtags,
  } = useQuery({
    queryKey: ["instagram-hashtags"],
    queryFn: () => InstagramService.listHashtags(),
    select: (data) => data.data,
  });

  // Credential 정보 조회
  // const {
  //   data: credential,
  //   isLoading: isLoadingCredential,
  //   error: credentialError,
  // } = useQuery({
  //   queryKey: ["instagram-credential"],
  //   queryFn: () => InstagramService.getCredential(),
  //   retry: 1,
  // });

  // 해시태그 토글 mutation
  const toggleMutation = useMutation({
    mutationFn: (hashtagId: string) =>
      InstagramService.toggleHashtag(hashtagId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["instagram-hashtags"] });
      alert(`Hashtag ${data.is_active ? "activated" : "deactivated"} successfully`);
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to toggle hashtag");
    },
  });

  const handleToggle = (hashtag: InstagramHashtag) => {
    toggleMutation.mutate(hashtag.id);
  };

  const handleRefresh = () => {
    refetchHashtags();
  };

  // 로딩 상태
  if (isLoadingHashtags) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (hashtagsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">
            {hashtagsError.message || "Failed to load hashtags"}
          </p>
        </div>
      </div>
    );
  }

  const hashtags = hashtagsData?.hashtags || [];
  const limitInfo = hashtagsData?.limit_info;
  const canAddMore = limitInfo && limitInfo.remaining > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Instagram 해시태그 관리</h1>
          <p className="text-gray-600">
            Instagram Graph API를 통해 해시태그를 등록하고 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingHashtags}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!canAddMore}
          >
            <Plus className="h-4 w-4 mr-2" />
            해시태그 추가
          </Button>
        </div>
      </div>

      {/* Credential Status */}
      {/* {credentialError ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">
            Instagram Credential 미설정
          </h3>
          <p className="text-yellow-600 mb-3">
            Instagram API를 사용하려면 먼저 Access Token을 설정해야 합니다.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/settings")}
          >
            설정 페이지로 이동
          </Button>
        </div>
      ) : credential ? (
        <CredentialStatus credential={credential} />
      ) : null} */}

      {/* Limit Info */}
      {limitInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-blue-800 font-semibold mb-2">
            Instagram API 제한사항
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">7일 이내 등록된 해시태그</p>
              <p className="text-2xl font-bold text-blue-600">
                {limitInfo.current_count}
                <span className="text-sm text-gray-500">
                  {" "}
                  / {limitInfo.max_hashtags_per_7_days}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-600">추가 가능 개수</p>
              <p className="text-2xl font-bold text-green-600">
                {limitInfo.remaining}
              </p>
            </div>
            <div>
              <p className="text-gray-600">전체 해시태그</p>
              <p className="text-2xl font-bold text-gray-700">
                {hashtagsData?.total || 0}
              </p>
            </div>
          </div>
          {!canAddMore && (
            <p className="text-red-600 mt-3 text-sm">
              7일 이내 등록된 해시태그가 30개에 도달했습니다. 새 해시태그를
              추가하려면 기존 해시태그가 7일이 지날 때까지 기다려주세요.
            </p>
          )}
        </div>
      )}

      {/* Hashtags Table */}
      <HashtagsTable
        hashtags={hashtags}
        onToggle={handleToggle}
        isToggling={toggleMutation.isPending}
      />

      {/* Add Hashtag Dialog */}
      <AddHashtagDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["instagram-hashtags"] });
        }}
      />
    </div>
  );
}
