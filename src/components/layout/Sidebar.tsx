import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  type LucideIcon,
  Tags,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { AdminApprovalService } from "@/services/admin-approval.service";

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  requiresSuperAdmin?: boolean;
}

const baseMenuItems: MenuItem[] = [
  { path: "/", label: "대시보드", icon: LayoutDashboard },
  { path: "/products", label: "스토어 관리", icon: Package },
  { path: "/tags", label: "태그 관리", icon: Tags },
  { path: "/users", label: "사용자 관리", icon: Users },
  // 메뉴 권한 관리 방식 변경
  // 각 메뉴 권한 관리
  {
    path: "/admin-approvals",
    label: "어드민 승인",
    icon: UserCheck,
    requiresSuperAdmin: true,
  },
  { path: "/settings", label: "설정 및 api", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Load pending count if user is super_admin
    if (user?.role === "super_admin") {
      loadPendingCount();

      // Refresh every 30 seconds
      const interval = setInterval(loadPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPendingCount = async () => {
    const { count } = await AdminApprovalService.getPendingCount();
    setPendingCount(count);
  };

  // Filter menu items based on user role
  const menuItems = baseMenuItems
    .filter((item) => {
      if (item.requiresSuperAdmin && user?.role !== "super_admin") {
        return false;
      }
      return true;
    })
    .map((item) => {
      // Add badge count for admin approvals
      if (item.path === "/admin-approvals" && pendingCount > 0) {
        return { ...item, badge: pendingCount };
      }
      return item;
    });

  return (
    <aside className="w-64 bg-gray-900 text-white fixed left-0 top-0 bottom-0 z-20">
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <h2 className="text-lg font-bold">GACHA STORE</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
