import type { AdminUser } from "@/services/admin-auth.service";
import { callEdgeFunction } from "@/services/admin-shop.service";
import { useQuery } from "@tanstack/react-query";

async function getAllAdminUsers(): Promise<AdminUser[]> {
  return callEdgeFunction("/admin-users-get-all", {
    method: "GET",
  });
}

export default function AdminUsers() {
  // TODO: 어드민 유저 데이터를 불러오는 api 테스트
  const { data, error } = useQuery({
    queryKey: ["amin-users"],
    queryFn: getAllAdminUsers,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">어드민 유저 관리</h1>
      <p className="text-gray-600">어드민 유저를 관리하는 페이지입니다.</p>
    </div>
  );
}
