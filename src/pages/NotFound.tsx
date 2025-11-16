import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 접근 권한이 없습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            이전 페이지로
          </Button>
          <Button onClick={() => navigate("/")}>홈으로 이동</Button>
        </div>
      </div>
    </div>
  );
}
