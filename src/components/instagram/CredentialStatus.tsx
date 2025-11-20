/**
 * CredentialStatus Component
 * Instagram Credential 정보 표시
 */

import type { InstagramCredential } from "@/services/instagram.service";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface CredentialStatusProps {
  credential: InstagramCredential;
}

export function CredentialStatus({ credential }: CredentialStatusProps) {
  const { days_remaining, is_expiring_soon, expires_at } = credential;

  const isExpired = days_remaining <= 0;

  return (
    <div
      className={`border rounded-md p-4 ${
        isExpired
          ? "bg-red-50 border-red-200"
          : is_expiring_soon
          ? "bg-yellow-50 border-yellow-200"
          : "bg-green-50 border-green-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {isExpired ? (
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        ) : is_expiring_soon ? (
          <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        )}
        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              isExpired
                ? "text-red-800"
                : is_expiring_soon
                ? "text-yellow-800"
                : "text-green-800"
            }`}
          >
            {isExpired
              ? "Access Token 만료됨"
              : is_expiring_soon
              ? "Access Token 만료 임박"
              : "Access Token 정상"}
          </h3>
          <div
            className={`text-sm space-y-1 ${
              isExpired
                ? "text-red-600"
                : is_expiring_soon
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            <p>
              <strong>만료까지:</strong> {days_remaining}일
            </p>
            <p>
              <strong>만료일:</strong>{" "}
              {new Date(expires_at).toLocaleString("ko-KR")}
            </p>
          </div>
          {(isExpired || is_expiring_soon) && (
            <p
              className={`mt-2 text-sm ${
                isExpired ? "text-red-700" : "text-yellow-700"
              }`}
            >
              {isExpired
                ? "Access Token이 만료되었습니다. 설정 페이지에서 새 토큰을 등록해주세요."
                : "Access Token이 곧 만료됩니다. 설정 페이지에서 새 토큰을 등록해주세요."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
