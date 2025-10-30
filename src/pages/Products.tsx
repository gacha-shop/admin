import { StoreRegistrationModal } from "@/features/store/components/StoreRegistrationModal";

export function Products() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">스토어 관리</h1>
        <StoreRegistrationModal />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">스토어 관리 페이지입니다.</p>
      </div>
    </div>
  );
}
