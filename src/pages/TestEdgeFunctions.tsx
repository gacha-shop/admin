/**
 * Edge Functions API 테스트 페이지
 */

import { useState } from "react";
import { AdminShopService, type Shop } from "@/services/admin-shop.service";

export default function TestEdgeFunctions() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Shop 목록 조회 테스트
  const handleListShops = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await AdminShopService.listShops({
        page: 1,
        limit: 5,
      });

      setShops(result.data);
      setSuccess(`✅ ${result.total}개의 매장을 조회했습니다.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  // Shop 생성 테스트
  const handleCreateShop = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newShop = await AdminShopService.createShop({
        name: "테스트 가챠샵",
        shop_type: "gacha",
        description: "Edge Functions API 테스트",
        road_address: "서울시 강남구 테헤란로 123",
        sido: "서울특별시",
        sigungu: "강남구",
        latitude: 37.5665,
        longitude: 126.978,
      });

      setSuccess(`✅ 매장이 생성되었습니다: ${newShop.name}`);
      // 목록 새로고침
      handleListShops();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edge Functions API 테스트</h1>

      {/* 버튼들 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleListShops}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "로딩 중..." : "Shop 목록 조회"}
        </button>

        <button
          onClick={handleCreateShop}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? "로딩 중..." : "Shop 생성 테스트"}
        </button>
      </div>

      {/* 성공 메시지 */}
      {success && (
        <div className="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ 에러: {error}
        </div>
      )}

      {/* Shop 목록 */}
      {shops.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            조회된 매장 목록 ({shops.length}개)
          </h2>
          <div className="space-y-4">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    <p className="text-sm text-gray-600">{shop.road_address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      타입: {shop.shop_type} | 상태:{" "}
                      <span
                        className={
                          shop.verification_status === "verified"
                            ? "text-green-600"
                            : shop.verification_status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      >
                        {shop.verification_status}
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>ID: {shop.id.slice(0, 8)}...</p>
                    <p>
                      생성: {new Date(shop.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {shop.description && (
                  <p className="text-sm text-gray-700 mt-2">
                    {shop.description}
                  </p>
                )}

                {shop.shop_tags && shop.shop_tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {shop.shop_tags.map((tag) => (
                      <span
                        key={tag.tag_id}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {tag.tags.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API 정보 */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">API 정보</h3>
        <p className="text-sm text-gray-700">
          Base URL: {import.meta.env.VITE_SUPABASE_URL}/functions/v1
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• POST /admin-shops-create - Shop 생성</li>
          <li>• GET /admin-shops-list - Shop 목록</li>
          <li>• GET /admin-shops-get?id=... - Shop 상세</li>
          <li>• PUT /admin-shops-update?id=... - Shop 수정</li>
          <li>• DELETE /admin-shops-delete?id=... - Shop 삭제</li>
        </ul>
      </div>
    </div>
  );
}
