import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Instagram,
  Sparkles,
  Shield,
  Users,
  MessageSquare,
  Briefcase,
  ChevronDown,
  Settings,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { AdminApprovalService } from "@/services/admin-approval.service";

interface SubMenuItem {
  path: string;
  label: string;
}

interface MenuItem {
  label: string;
  icon: LucideIcon;
  path?: string;
  subItems?: SubMenuItem[];
  badge?: number;
  requiresSuperAdmin?: boolean;
}

const baseMenuItems: MenuItem[] = [
  {
    label: "대시보드",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "가챠 샵",
    icon: Store,
    subItems: [
      { path: "/shops", label: "샵 관리" },
      { path: "/shops/tags", label: "샵 태그 관리" },
      { path: "/shops/reviews", label: "샵 리뷰 관리" },
    ],
  },
  {
    label: "인스타그램",
    icon: Instagram,
    subItems: [
      { path: "/instagram/hashtags", label: "해시태그 관리" },
      { path: "/instagram/feeds", label: "피드 관리" },
    ],
  },
  {
    label: "애니메이션",
    icon: Sparkles,
    subItems: [{ path: "/animation/characters", label: "캐릭터 관리" }],
  },
  {
    label: "어드민",
    icon: Shield,
    subItems: [
      { path: "/admin/users", label: "어드민 유저 관리" },
      { path: "/admin/permissions", label: "어드민 메뉴 권한 관리" },
    ],
  },
  {
    label: "유저",
    icon: Users,
    subItems: [{ path: "/users", label: "사용 유저 관리" }],
  },
  {
    label: "커뮤니티",
    icon: MessageSquare,
    subItems: [{ path: "/community/posts", label: "게시글 관리" }],
  },
  {
    label: "사장님",
    icon: Briefcase,
    subItems: [
      { path: "/owner/dashboard", label: "사장님 대시보드" },
      { path: "/owner/stores", label: "매장별 관리" },
    ],
  },
  {
    label: "어드민 승인",
    icon: UserCheck,
    path: "/admin-approvals",
    requiresSuperAdmin: true,
  },
  {
    label: "설정 및 API",
    icon: Settings,
    path: "/settings",
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [openItems, setOpenItems] = useState<string[]>([]);
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

  const toggleItem = (label: string) => {
    setOpenItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isSubMenuActive = (subItems?: SubMenuItem[]) => {
    if (!subItems) return false;
    return subItems.some((subItem) => location.pathname === subItem.path);
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
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isOpen = openItems.includes(item.label);
            const isActive = item.path
              ? location.pathname === item.path
              : isSubMenuActive(item.subItems);

            if (!hasSubItems && item.path) {
              return (
                <li key={item.label}>
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
            }

            return (
              <li key={item.label}>
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.label)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium flex-1 text-left">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="mt-1 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              className={`flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-lg transition-colors text-sm ${
                                isSubActive
                                  ? "bg-primary text-white font-medium"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
