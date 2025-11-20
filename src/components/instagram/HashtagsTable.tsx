/**
 * HashtagsTable Component
 * Instagram 해시태그 목록 테이블
 */

import {
  InstagramService,
  type InstagramHashtag,
} from "@/services/instagram.service";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Hash, Calendar, Clock, ToggleLeft, ToggleRight } from "lucide-react";

interface HashtagsTableProps {
  hashtags: InstagramHashtag[];
  onToggle: (hashtag: InstagramHashtag) => void;
  isToggling: boolean;
}

export function HashtagsTable({
  hashtags,
  onToggle,
  isToggling,
}: HashtagsTableProps) {
  console.log("hashtags", hashtags);

  if (hashtags.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-gray-500">
        <Hash className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">등록된 해시태그가 없습니다</p>
        <p className="text-sm mt-1">
          "해시태그 추가" 버튼을 클릭하여 새 해시태그를 등록하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">키워드</TableHead>
            <TableHead>해시태그 ID</TableHead>
            <TableHead className="w-[120px]">상태</TableHead>
            <TableHead className="w-[150px]">7일 경과</TableHead>
            <TableHead className="w-[180px]">생성일</TableHead>
            <TableHead className="w-[100px] text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hashtags.map((hashtag) => {
            const isExpired = InstagramService.isExpiredHashtag(
              hashtag.created_at
            );
            const createdDate = new Date(hashtag.created_at);
            const now = new Date();
            const diffInDays = Math.floor(
              (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <TableRow key={hashtag.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    {hashtag.keyword}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-600">
                  {hashtag.hashtag_id}
                </TableCell>
                <TableCell>
                  {hashtag.is_active ? (
                    <Badge variant="default" className="bg-green-600">
                      활성화
                    </Badge>
                  ) : (
                    <Badge variant="neutral">비활성화</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isExpired ? (
                    <Badge
                      variant="outline"
                      className="border-red-300 text-red-600"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      만료됨 ({diffInDays}일)
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-blue-300 text-blue-600"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {diffInDays}일 경과
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {createdDate.toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggle(hashtag)}
                    disabled={isToggling}
                  >
                    {hashtag.is_active ? (
                      <>
                        <ToggleRight className="h-4 w-4 mr-1" />
                        비활성화
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4 mr-1" />
                        활성화
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
