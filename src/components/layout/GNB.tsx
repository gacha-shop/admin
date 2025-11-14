import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function GNB() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '슈퍼 관리자';
      case 'admin':
        return '관리자';
      case 'owner':
        return '사장님';
      default:
        return role;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Gacha Store Admin
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-gray-600 flex flex-col items-end">
              <span className="font-medium">{user.full_name || user.email}</span>
              <span className="text-xs text-gray-500">
                {getRoleLabel(user.role)}
              </span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
