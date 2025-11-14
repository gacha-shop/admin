import { useEffect, useState } from "react";
import { OwnerShopService, type Shop } from "@/services/owner-shop.service";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function OwnerStores() {
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyShop();
  }, []);

  const loadMyShop = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. 먼저 소유권 정보를 조회해서 shop_id를 가져옴
      const { ownerships, error: ownershipError } =
        await OwnerShopService.getMyShopOwnership();

      if (ownershipError || !ownerships || ownerships.length === 0) {
        setError(ownershipError?.message || "등록된 매장이 없습니다");
        setLoading(false);
        return;
      }

      // 2. shop_id로 매장 정보 조회
      const shopId = ownerships[0].shops.id;
      const shopData = await OwnerShopService.getMyShop(shopId);
      setShop(shopData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "매장 정보를 불러올 수 없습니다"
      );
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">매장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="rounded-md bg-red-50 p-4 max-w-md">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  오류가 발생했습니다
                </h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <div className="mt-4">
                  <Button
                    onClick={loadMyShop}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            등록된 매장이 없습니다
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            관리자의 승인을 기다리고 있거나 아직 매장이 등록되지 않았습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내 매장 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            등록된 매장 정보를 확인하고 관리할 수 있습니다
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/owner/stores/${shop.id}`)}
          >
              <div className="p-6">
                {/* 매장명 */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {shop.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shop.verification_status === "verified"
                        ? "bg-green-100 text-green-800"
                        : shop.verification_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {shop.verification_status === "verified"
                      ? "검증완료"
                      : shop.verification_status === "pending"
                        ? "검증대기"
                        : "거부됨"}
                  </span>
                </div>

                {/* 매장 타입 */}
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    {shop.shop_type === "gacha"
                      ? "가챠 전문"
                      : shop.shop_type === "figure"
                        ? "피규어 전문"
                        : "복합 매장"}
                  </span>
                </div>

                {/* 주소 */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 flex items-start">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-1 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="flex-1">
                      {shop.road_address}
                      {shop.detail_address && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {shop.detail_address}
                        </span>
                      )}
                    </span>
                  </p>
                </div>

                {/* 전화번호 */}
                {shop.phone && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {shop.phone}
                    </p>
                  </div>
                )}

                {/* 가챠 머신 개수 */}
                {shop.gacha_machine_count !== null && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      가챠 머신: {shop.gacha_machine_count}대
                    </p>
                  </div>
                )}

                {/* 설명 */}
                {shop.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {shop.description}
                    </p>
                  </div>
                )}

                {/* 버튼 */}
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/owner/stores/${shop.id}`);
                    }}
                  >
                    상세보기
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/owner/stores/${shop.id}/edit`);
                    }}
                  >
                    수정하기
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
